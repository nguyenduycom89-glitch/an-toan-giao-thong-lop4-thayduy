
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Giải mã dữ liệu PCM 16-bit sang AudioBuffer
 * Gemini TTS trả về raw PCM 16-bit, 24000Hz, Mono
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  // Sử dụng DataView để đọc chính xác từng 2-byte (16-bit)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const frameCount = data.length / 2 / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Đọc Int16 (2 bytes) và chuyển sang Float32
      const offset = (i * numChannels + channel) * 2;
      const sample = view.getInt16(offset, true); // true cho little-endian
      channelData[i] = sample / 32768.0;
    }
  }
  return buffer;
}
