
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import Mascot from './Mascot';
import { CORRECT_PRAISES, INCORRECT_ENCOURAGEMENTS } from '../constants';
import { playGameSound } from '../utils/sound';
import { textToSpeech, browserSpeak } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../utils/audioHelper';

interface QuizGameProps {
  questions: Question[];
  onFinish: (score: number) => void;
  onBack: () => void;
}

const TIMER_DURATION = 10;

const QuizGame: React.FC<QuizGameProps> = ({ questions, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mascotMessage, setMascotMessage] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    return audioContextRef.current;
  };

  const currentQuestion = questions[currentIndex];

  const stopSpeaking = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    stopSpeaking();
    const ctx = getAudioContext();
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      
      const base64Audio = await textToSpeech(text);
      
      // Nếu API lỗi hoặc hết quota, sử dụng giọng nói trình duyệt
      if (!base64Audio) {
        browserSpeak(text);
        setIsSpeaking(true);
        // Tự động tắt trạng thái 'đang nói' sau một khoảng thời gian ước tính
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
      console.error("Lỗi phát âm, chuyển sang dự phòng:", err);
      browserSpeak(text);
    }
  };

  useEffect(() => {
    if (isTimerRunning && !showFeedback && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 4 && prev > 1) playGameSound('tick'); 
            return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && !showFeedback && isTimerRunning) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [timeLeft, showFeedback, isTimerRunning]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setHasTimedOut(false);
    
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const handleTimeout = () => {
    setIsTimerRunning(false);
    setHasTimedOut(true);
    playGameSound('incorrect');
    const message = "Hết thời gian suy nghĩ, mời cả lớp giơ bảng!";
    setMascotMessage(message);
    speakText(message);
  };

  const revealAnswer = () => {
    setIsCorrect(false); 
    setShowFeedback(true);
    setHasTimedOut(false);
    const message = "Đáp án đúng là " + String.fromCharCode(65 + currentQuestion.correctAnswerIndex) + " nhen!";
    setMascotMessage(message);
    speakText(message);
  };

  const handleOptionClick = (index: number) => {
    if (showFeedback || !isTimerRunning) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    stopSpeaking();

    const correct = index === currentQuestion.correctAnswerIndex;
    setSelectedOption(index);
    setIsCorrect(correct);
    setShowFeedback(true);
    setIsTimerRunning(false);
    
    if (correct) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        playGameSound('correct');
        setScore(prev => prev + 1);
    } else {
        playGameSound('incorrect');
    }

    const message = correct 
      ? CORRECT_PRAISES[Math.floor(Math.random() * CORRECT_PRAISES.length)]
      : INCORRECT_ENCOURAGEMENTS[Math.floor(Math.random() * INCORRECT_ENCOURAGEMENTS.length)];
    
    setMascotMessage(message);
    speakText(message);
  };

  const handleNext = () => {
    stopSpeaking();
    setSelectedOption(null);
    setShowFeedback(false);
    setHasTimedOut(false);
    setMascotMessage("");
    setTimeLeft(TIMER_DURATION);
    setIsTimerRunning(false);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(score);
    }
  };

  const getTimerColor = () => {
    if (!isTimerRunning && !showFeedback && !hasTimedOut) return 'bg-sky-400';
    if (timeLeft > 6) return 'bg-green-500';
    if (timeLeft > 3) return 'bg-yellow-500';
    return 'bg-red-500 animate-pulse';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 h-full relative z-10">
      
      {showConfetti && (
          <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
              {[...Array(20)].map((_, i) => (
                  <div key={i} className="animate-ping absolute text-4xl" style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random()}s`
                  }}>⭐</div>
              ))}
          </div>
      )}

      <div className="w-full flex justify-between items-center mb-6">
        <button onClick={onBack} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-gray-600 hover:text-sky-600 font-black shadow-sm flex items-center border border-white transition-all">
          <span className="mr-2">🏠</span> THOÁT
        </button>
        
        <div className={`flex items-center space-x-2 px-6 py-2 rounded-full shadow-lg border-2 border-white font-black text-white transition-all duration-500 ${getTimerColor()} ${(!isTimerRunning && !showFeedback && !hasTimedOut) ? 'opacity-50' : 'opacity-100 scale-110'}`}>
          <span>{timeLeft > 0 ? (isTimerRunning ? '🔥' : '⏱️') : '⌛'}</span>
          <span className="text-xl tabular-nums">{timeLeft}s</span>
        </div>

        <div className="bg-sky-500 px-6 py-2 rounded-full shadow-lg border-2 border-white text-white font-black text-sm">
          CÂU {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="relative w-full mb-8 mt-12">
         {isTimerRunning && !showFeedback && (
           <div className="absolute -top-4 left-0 w-full h-3 bg-gray-200 rounded-full overflow-hidden z-30 border-2 border-white shadow-sm">
             <div 
               className={`h-full transition-all duration-1000 ease-linear ${getTimerColor()}`}
               style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
             ></div>
           </div>
         )}

         <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
             <div className="relative">
                <Mascot 
                  emotion={showFeedback ? (isCorrect ? 'excited' : 'thinking') : (hasTimedOut ? 'thinking' : 'happy')} 
                  className={isSpeaking ? 'animate-bounce' : ''} 
                />
                
                {(showFeedback || hasTimedOut) && (
                  <div className="absolute top-0 left-24 w-48 bg-white rounded-3xl p-4 shadow-2xl border-4 border-sky-100 pop-in z-30">
                    <div className="absolute top-8 -left-3 w-6 h-6 bg-white transform rotate-45 border-l-4 border-b-4 border-sky-100"></div>
                    <div className="flex flex-col items-center">
                      <p className={`text-base font-black text-center mb-2 leading-tight ${showFeedback ? (isCorrect ? 'text-green-600' : 'text-orange-500') : 'text-sky-600'}`}>
                        {mascotMessage}
                      </p>
                      <button onClick={() => speakText(mascotMessage)} className="text-xs bg-sky-50 text-sky-600 px-3 py-1 rounded-full font-black hover:bg-sky-100 transition-colors">
                        {isSpeaking ? '📢 Đang nói...' : '🔈 Nghe lại'}
                      </button>
                    </div>
                  </div>
                )}
             </div>
         </div>
         
         <div className="bg-white/95 backdrop-blur-md w-full rounded-[3rem] shadow-2xl p-10 pt-16 border-b-[12px] border-sky-200 relative group overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isTimerRunning ? 'from-orange-400 via-red-400 to-yellow-400 animate-pulse' : 'from-sky-400 via-purple-400 to-pink-400'}`}></div>
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
                  {currentQuestion.text}
                </h2>
            </div>
         </div>
      </div>

      <div className="relative w-full">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 w-full transition-all duration-500`}>
          {currentQuestion.options.map((option, index) => {
            let btnClass = "bg-white/90 backdrop-blur-sm border-4 border-white text-gray-700 shadow-lg";
            
            if (isTimerRunning && !showFeedback) {
              btnClass += " hover:bg-yellow-50 hover:scale-[1.02] cursor-pointer";
            } else if (!isTimerRunning && !showFeedback && !hasTimedOut) {
              btnClass += " opacity-100"; 
            }

            if (showFeedback) {
              if (index === currentQuestion.correctAnswerIndex) {
                btnClass = "bg-green-100 border-4 border-green-500 text-green-800 shadow-none scale-105 z-10";
              } else if (index === selectedOption) {
                btnClass = "bg-red-50 border-4 border-red-400 text-red-800 opacity-80";
              } else {
                btnClass = "bg-white/40 text-gray-400 opacity-40 border-transparent";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback || !isTimerRunning || hasTimedOut}
                className={`
                  p-6 rounded-[2rem] text-lg font-black transition-all duration-300 
                  transform active:scale-95 text-left flex items-center
                  ${btnClass}
                `}
              >
                <span className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-black flex-shrink-0 border-2 ${showFeedback && index === currentQuestion.correctAnswerIndex ? 'bg-green-500 text-white border-white' : 'bg-sky-100 text-sky-600 border-sky-200'}`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="leading-snug">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-32 mt-8 flex flex-col items-center justify-center w-full">
        {!isTimerRunning && !showFeedback && !hasTimedOut && (
          <button 
            onClick={handleStartTimer}
            className="group relative px-10 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-2xl font-black shadow-[0_10px_0_rgb(194,65,12)] hover:translate-y-1 hover:shadow-[0_5px_0_rgb(194,65,12)] active:translate-y-2 active:shadow-none transition-all animate-bounce text-center leading-tight"
          >
            THỜI GIAN SUY NGHĨ BẮT ĐẦU! ⏳
          </button>
        )}

        {hasTimedOut && !showFeedback && (
          <button 
            onClick={revealAnswer}
            className="px-10 py-6 bg-green-500 hover:bg-green-600 text-white rounded-full text-2xl font-black shadow-[0_10px_0_rgb(21,128,61)] hover:translate-y-1 active:translate-y-2 transition-all"
          >
            XEM ĐÁP ÁN ĐÚNG! ✅
          </button>
        )}

        {showFeedback && (
          <button 
            onClick={handleNext}
            className={`
              px-12 py-5 rounded-full text-white text-2xl font-black shadow-xl
              transform transition hover:scale-110 active:translate-y-2 active:shadow-none
              ${currentIndex === questions.length - 1 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-[0_10px_0_rgb(79,70,229)]' 
                : 'bg-gradient-to-r from-sky-400 to-sky-600 shadow-[0_10px_0_rgb(2,132,199)]'}
            `}
          >
            {currentIndex === questions.length - 1 ? 'XEM KẾT QUẢ ⭐' : 'CÂU TIẾP THEO ➜'}
          </button>
        )}
      </div>

    </div>
  );
};

export default QuizGame;
