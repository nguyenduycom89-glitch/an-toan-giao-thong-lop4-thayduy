
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIPraiseResponse } from "../types";
import { TT27_LIBRARY } from "../constants";

// Bộ nhớ đệm để lưu các đoạn âm thanh đã tạo nhằm tiết kiệm quota API
const ttsCache = new Map<string, string>();

export const generateLocalPraise = (score: number, total: number): AIPraiseResponse => {
  const percentage = (score / total) * 100;
  let level = "Chưa hoàn thành";
  if (percentage >= 80) level = "Hoàn thành tốt";
  else if (percentage >= 50) level = "Hoàn thành";

  const options = TT27_LIBRARY[level];
  return options[Math.floor(Math.random() * options.length)];
};

export const generateAIPraise = async (
  score: number,
  total: number,
  topic: string
): Promise<AIPraiseResponse> => {
  const fallback = generateLocalPraise(score, total);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Bạn đóng vai Thầy Duy - một giáo viên tiểu học miền Nam tận tâm, vui tính.
      Viết nhận xét TT27 cho bài trắc nghiệm: "${topic}". Điểm: ${score}/${total}.
      Yêu cầu: Nhận xét sâu sắc, chân thành, dùng từ miền Nam (nhen, nè, nha, con).
      Các mức: "Hoàn thành tốt" (>=80%), "Hoàn thành" (>=50%), "Chưa hoàn thành" (<50%).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: 'Lời nói vui nhộn của Mascot' },
            teacherComment: { type: Type.STRING, description: 'Nhận xét theo TT 27/BGDĐT' },
            assessmentLevel: { type: Type.STRING, description: 'Mức đánh giá' },
            rewardEmoji: { type: Type.STRING, description: 'Emoji phần thưởng' },
            rewardName: { type: Type.STRING, description: 'Tên phần thưởng' }
          },
          propertyOrdering: ["message", "teacherComment", "assessmentLevel", "rewardEmoji", "rewardName"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return { ...fallback, ...result };
  } catch (error) {
    console.error("Gemini generateAIPraise error:", error);
    return fallback;
  }
};

/**
 * Sử dụng giọng đọc của trình duyệt làm phương án dự phòng khi API Gemini hết hạn mức
 */
export const browserSpeak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Hủy các yêu cầu đọc cũ
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9; // Đọc chậm một chút cho học sinh dễ nghe
  utterance.pitch = 1.0;
  
  // Tìm giọng đọc tiếng Việt tốt nhất hiện có trên thiết bị
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.includes('vi'));
  if (viVoice) utterance.voice = viVoice;
  
  window.speechSynthesis.speak(utterance);
};

export const textToSpeech = async (text: string): Promise<string | undefined> => {
  // Kiểm tra trong bộ nhớ đệm trước
  if (ttsCache.has(text)) {
    return ttsCache.get(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Đọc: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Charon' } 
          } 
        },
      },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      // Lưu vào bộ nhớ đệm để dùng lại
      ttsCache.set(text, audioData);
    }
    return audioData;
  } catch (error: any) {
    // Nếu lỗi 429 (Hết hạn mức), log nhẹ nhàng và để component xử lý fallback
    if (error?.message?.includes('429')) {
      console.warn("API Quota exceeded, falling back to browser TTS.");
    } else {
      console.error("Gemini textToSpeech error:", error);
    }
    return undefined;
  }
};
