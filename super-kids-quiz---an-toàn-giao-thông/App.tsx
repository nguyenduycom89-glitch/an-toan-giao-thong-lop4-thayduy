
import React, { useState, useEffect, useRef } from 'react';
import { GameStage, Question } from './types';
import { DEFAULT_QUESTIONS, DEFAULT_TOPIC } from './constants';
import QuizGame from './components/QuizGame';
import Results from './components/Results';
import TeacherPanel from './components/TeacherPanel';
import Mascot from './components/Mascot';

const BACKGROUND_MUSIC_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 

const sanitizeImageUrl = (url: string) => {
  if (!url) return "";
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }
  return url;
};

const DEFAULT_BG = "https://lh3.googleusercontent.com/d/1340294zjPE2BQo0a7otcUy0QKaSOVt25";

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.START);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [topic, setTopic] = useState<string>("An Toàn Giao Thông");
  const [bgImage, setBgImage] = useState<string>(DEFAULT_BG);
  const [score, setScore] = useState(0);
  
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(BACKGROUND_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.1;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(err => console.log("Music blocked: ", err));
    }
  };

  const startGame = () => {
    setStage(GameStage.PLAYING);
    if (audioRef.current && !isMusicPlaying) {
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {});
    }
  };

  const handleGameFinish = (finalScore: number) => {
    setScore(finalScore);
    setStage(GameStage.FINISHED);
  };

  const handleRestart = () => {
    setScore(0);
    setStage(GameStage.PLAYING);
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden flex flex-col font-sans text-gray-800">
      
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-1000"
        style={{ 
          backgroundImage: `url("${bgImage}")`,
          filter: 'brightness(0.9) saturate(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/30 via-transparent to-white/90"></div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleMusic}
          className={`p-3 rounded-full shadow-xl border-4 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center ${
            isMusicPlaying 
              ? "bg-yellow-400 border-white text-white shadow-yellow-200" 
              : "bg-white/80 border-gray-200 text-gray-400"
          }`}
        >
          {isMusicPlaying ? '🎵' : '🔇'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-y-auto">
        
        {stage === GameStage.START && (
          <div className="text-center max-w-2xl w-full pop-in bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border-4 border-white">
             <div className="flex justify-center mb-4">
                <div className="relative">
                  <Mascot emotion="happy" className="animate-bounce" />
                  <div className="absolute -bottom-2 w-full h-4 bg-black/10 rounded-full blur-sm"></div>
                </div>
             </div>
             
             <div className="mb-10 space-y-2">
               <h1 className="text-4xl md:text-6xl font-black text-3d-blue tracking-tighter uppercase leading-none italic">
                 SUPER KIDS QUIZ
               </h1>
               <h2 className="text-3xl md:text-5xl font-black text-3d-yellow tracking-tight uppercase leading-tight">
                 AN TOÀN GIAO THÔNG
               </h2>
               <div className="h-2 w-48 bg-sky-500 mx-auto mt-6 rounded-full shadow-inner opacity-40"></div>
             </div>

             <div className="space-y-6 flex flex-col items-center">
               <button 
                 onClick={startGame}
                 className="group relative w-72 py-6 bg-green-500 hover:bg-green-600 text-white rounded-full text-3xl font-black shadow-[0_10px_0_rgb(21,128,61)] hover:shadow-[0_5px_0_rgb(21,128,61)] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all"
               >
                 CHƠI NGAY! 🚲
               </button>
               
               <button 
                 onClick={() => setStage(GameStage.TEACHER_MODE)}
                 className="text-sm text-gray-500 hover:text-purple-600 font-bold underline mt-8 flex items-center gap-1 opacity-70"
               >
                 <span>Góc của Thầy Duy</span>
                 <span className="text-lg">⚙</span>
               </button>
             </div>
          </div>
        )}

        {stage === GameStage.PLAYING && (
          <QuizGame 
            questions={questions} 
            onFinish={handleGameFinish} 
            onBack={() => setStage(GameStage.START)} 
          />
        )}

        {stage === GameStage.FINISHED && (
          <Results 
            score={score} 
            total={questions.length} 
            topic={topic}
            onRestart={handleRestart}
          />
        )}

        {stage === GameStage.TEACHER_MODE && (
          <TeacherPanel 
            initialQuestions={questions}
            initialTopic={topic}
            initialBg={bgImage}
            onSave={(q, t, bg) => { 
              setQuestions(q); 
              setTopic(t); 
              setBgImage(sanitizeImageUrl(bg));
              setStage(GameStage.START); 
            }}
            onCancel={() => setStage(GameStage.START)}
          />
        )}
      </div>

      <footer className="w-full bg-sky-600/90 backdrop-blur-md p-2 relative z-20 text-center shadow-inner">
          <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest">
            © 2025 THẦY NGUYỄN ĐỨC DUY - AN TOÀN LÀ TRÊN HẾT! 🍎
          </p>
      </footer>
    </div>
  );
};

export default App;
