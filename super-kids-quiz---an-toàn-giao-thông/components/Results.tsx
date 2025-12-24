
import React, { useEffect, useState, useRef } from 'react';
import Mascot from './Mascot';
import { generateAIPraise, textToSpeech, browserSpeak } from '../services/geminiService';
import { AIPraiseResponse } from '../types';
import { decodeBase64, decodeAudioData } from '../utils/audioHelper';

interface ResultsProps {
  score: number;
  total: number;
  topic: string;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, total, topic, onRestart }) => {
  const [isReviewing, setIsReviewing] = useState(true);
  const [aiResponse, setAiResponse] = useState<AIPraiseResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparingVoice, setIsPreparingVoice] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    if (isReviewing || score === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: any[] = [];
    const colors = ['#FFD93D', '#FF6B6B', '#4D96FF', '#6BCB77', '#F473B9'];

    class Particle {
      x: number; y: number; color: string; velocity: {x: number, y: number}; alpha: number;
      constructor(x: number, y: number, color: string) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1;
      }
      draw() {
        if (!ctx) return;
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
      }
      update() { this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.01; }
    }

    const createFirework = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 30; i++) particles.push(new Particle(x, y, color));
    };

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => { if (p.alpha <= 0) particles.splice(i, 1); else { p.update(); p.draw(); } });
      if (Math.random() < 0.05) createFirework(Math.random() * canvas.width, Math.random() * canvas.height);
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [isReviewing, score]);

  useEffect(() => {
    let isMounted = true;
    const processResults = async () => {
      const [response] = await Promise.all([
        generateAIPraise(score, total, topic),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
      if (isMounted) {
        setAiResponse(response);
        setIsReviewing(false);
      }
    };
    processResults();
    return () => { isMounted = false; stopSpeaking(); };
  }, [score, total, topic]);

  const stopSpeaking = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = async () => {
    if (!aiResponse) return;
    if (isSpeaking) { stopSpeaking(); return; }

    const ctx = getAudioContext();
    const text = `${aiResponse.message}. ${aiResponse.teacherComment}`;
    setIsPreparingVoice(true);
    
    try {
      const base64Audio = await textToSpeech(text);
      setIsPreparingVoice(false);
      
      if (!base64Audio) {
        browserSpeak(text);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), text.length * 100 + 1000);
        return;
      }

      const audioData = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      currentSourceRef.current = source;
      setIsSpeaking(true);
      source.start(0);
    } catch (err) {
      setIsPreparingVoice(false);
      setIsSpeaking(false);
      browserSpeak(text);
    }
  };

  if (isReviewing) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 h-full text-center pop-in">
        <div className="relative mb-8">
           <Mascot emotion="thinking" className="scale-150 animate-pulse" />
           <div className="absolute -top-4 -right-8 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-sky-100 font-black text-sky-500 animate-bounce">
             BÀI CON ĐÂU...
           </div>
        </div>
        <h2 className="text-3xl font-black text-sky-700 mb-2">Thầy Duy AI đang xem bài của con nè...</h2>
        <p className="text-gray-500 font-bold animate-pulse">Đợi thầy chấm chút xíu nhen con ơi! ✨</p>
        
        <div className="mt-8 flex space-x-2">
           <div className="w-4 h-4 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
           <div className="w-4 h-4 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
           <div className="w-4 h-4 bg-sky-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  const percentage = (score / total) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 h-full text-center pop-in overflow-y-auto relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <div className="mb-4 relative z-10 cursor-pointer" onClick={handleSpeak}>
        <Mascot emotion={percentage > 50 ? 'excited' : 'happy'} className={`scale-125 ${isSpeaking ? 'animate-bounce' : ''}`} />
      </div>

      <h1 className="text-4xl font-black text-sky-600 mb-2 drop-shadow-md uppercase z-10">KẾT QUẢ CỦA CON</h1>
      
      <div className="bg-white/95 backdrop-blur-sm rounded-[3rem] p-8 shadow-2xl border-b-[12px] border-sky-300 w-full max-w-md relative z-10">
        <div className="text-center mb-6">
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1">Số câu đúng</p>
            <div className="text-7xl font-black text-green-500 drop-shadow-sm">{score}/{total}</div>
        </div>

        {aiResponse && (
          <div className="space-y-6 pop-in">
              <div className="bg-yellow-50 rounded-3xl p-5 border-4 border-dashed border-yellow-200">
                  <p className="text-xl font-black text-orange-600 italic">"{aiResponse.message}"</p>
              </div>
              
              <button 
                onClick={handleSpeak}
                disabled={isPreparingVoice}
                className={`
                  w-full py-5 rounded-[2rem] font-black text-white flex items-center justify-center space-x-3 transition-all transform active:scale-95 text-xl
                  ${isSpeaking 
                    ? 'bg-red-500 shadow-[0_6px_0_rgb(185,28,28)]' 
                    : 'bg-green-500 hover:bg-green-600 shadow-[0_10px_0_rgb(21,128,61)]'
                  }
                `}
              >
                {isPreparingVoice ? 'ĐANG LẤY GIỌNG...' : isSpeaking ? '⏹ DỪNG NGHE' : '🔊 NGHE THẦY NHẬN XÉT'}
              </button>

              <div className="text-left bg-sky-50 rounded-2xl p-5 border-2 border-sky-100">
                  <p className="text-xs font-black text-sky-400 mb-2 uppercase tracking-tighter">Lời nhắn từ Thầy Duy:</p>
                  <p className="text-base text-gray-700 font-bold leading-relaxed">{aiResponse.teacherComment}</p>
                  <div className="mt-3 inline-block bg-white px-4 py-1 rounded-full text-[10px] font-black text-sky-600 border border-sky-200">
                    Đánh giá: {aiResponse.assessmentLevel}
                  </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-4 flex items-center justify-center space-x-4 shadow-xl border-b-8 border-indigo-800">
                  <span className="text-5xl animate-tada">{aiResponse.rewardEmoji}</span>
                  <div className="text-left">
                      <div className="text-[10px] text-white/70 font-black uppercase">QUÀ CỦA THẦY</div>
                      <div className="text-white font-black text-lg leading-tight uppercase">{aiResponse.rewardName}</div>
                  </div>
              </div>
          </div>
        )}
      </div>

      <button
        onClick={onRestart}
        className="mt-8 relative z-10 px-14 py-5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-2xl font-black shadow-[0_10px_0_rgb(14,165,233)] hover:translate-y-1 hover:shadow-[0_5px_0_rgb(14,165,233)] active:translate-y-2 active:shadow-none transition-all"
      >
        CHƠI LẠI THÔI! ↺
      </button>

    </div>
  );
};

export default Results;
