import React, { useState, useEffect, useRef } from 'react';

interface ReplayControllerProps {
  onStep: (indexOffset: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const ReplayController: React.FC<ReplayControllerProps> = ({
  onStep,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange
}) => {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-2 self-center shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-1">
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
          className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30'}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
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
          className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer hover:text-blue-400"
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
