import React, { useState, useEffect, useRef } from 'react';
import { getAuthorColor } from '../../utils/colors';

interface ReplayControllerProps {
  onStep: (indexOffset: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentAuthor?: string;
  onRestart?: () => void;
}

const ReplayController: React.FC<ReplayControllerProps> = ({
  onStep,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  currentAuthor,
  onRestart
}) => {
  const authorColor = currentAuthor ? getAuthorColor(currentAuthor) : '#3b82f6';

  return (
    <div className="flex items-center gap-4 bg-black/60 border border-white/10 rounded-full px-4 py-2 self-center shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-1">
        <button 
          onClick={onRestart}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          title="Restart from Oldest"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>

        <button 
          onClick={() => onStep(1)} // Newer in history (up in list)
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          title="Step Newer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>

        <button 
          onClick={onTogglePlay}
          className="p-3 rounded-full transition-all relative group"
          title={isPlaying ? 'Pause' : 'Play'}
          style={{ backgroundColor: `${authorColor}33`, color: authorColor }}
        >
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: authorColor, display: isPlaying ? 'block' : 'none' }}
          />
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button 
          onClick={() => onStep(-1)} // Older in history (down in list)
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          title="Step Older"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" />
          </svg>
        </button>
      </div>

      <div className="h-4 w-px bg-white/10 mx-1" />

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase">Speed</span>
        <select 
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer hover:text-white appearance-none text-gray-400"
          style={{ color: isPlaying ? authorColor : undefined }}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
};

export default ReplayController;
