import React from 'react';

interface MascotProps {
  emotion: 'happy' | 'thinking' | 'excited';
  className?: string;
}

const Mascot: React.FC<MascotProps> = ({ emotion, className = "" }) => {
  // Simple color/shape changes based on emotion
  const mouthPath = emotion === 'happy' 
    ? "M 35 65 Q 50 75 65 65" // Smile
    : emotion === 'excited'
    ? "M 35 60 Q 50 80 65 60" // Big Open Smile
    : "M 40 70 Q 50 65 60 70"; // Thinking/Serious

  const eyeShape = emotion === 'excited'
    ? <><circle cx="35" cy="45" r="6" fill="#333"/><circle cx="65" cy="45" r="6" fill="#333"/></> // Wide eyes
    : <><circle cx="35" cy="45" r="4" fill="#333"/><circle cx="65" cy="45" r="4" fill="#333"/></>; // Normal eyes

  return (
    <div className={`w-32 h-32 relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl filter">
        {/* Body/Head */}
        <circle cx="50" cy="50" r="45" fill="#FFD93D" stroke="#F4C430" strokeWidth="3" />
        
        {/* Cheeks */}
        <circle cx="25" cy="55" r="5" fill="#FF9A8B" opacity="0.6" />
        <circle cx="75" cy="55" r="5" fill="#FF9A8B" opacity="0.6" />

        {/* Eyes */}
        {eyeShape}
        
        {/* Mouth */}
        <path d={mouthPath} fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />

        {/* Antennas */}
        <path d="M 30 15 Q 20 5 10 15" stroke="#F4C430" strokeWidth="3" fill="none"/>
        <circle cx="10" cy="15" r="3" fill="#4D96FF" />
        
        <path d="M 70 15 Q 80 5 90 15" stroke="#F4C430" strokeWidth="3" fill="none"/>
        <circle cx="90" cy="15" r="3" fill="#4D96FF" />
      </svg>
      {emotion === 'thinking' && (
         <div className="absolute -top-2 -right-4 text-4xl animate-bounce">?</div>
      )}
    </div>
  );
};

export default Mascot;