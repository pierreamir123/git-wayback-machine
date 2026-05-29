import React, { useState, useRef, useEffect } from 'react';
import { getAuthorColor } from '../../utils/colors';

interface Commit {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  subject: string;
  body: string;
}

interface TimelineScrubberProps {
  commits: Commit[];
  currentIndex: number;
  onSelectCommit: (index: number) => void;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  commits,
  currentIndex,
  onSelectCommit,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const currentCommit = commits[currentIndex] || null;
  const currentAuthorColor = currentCommit ? getAuthorColor(currentCommit.authorName) : '#3b82f6';
  const progress = commits.length > 0 ? ((currentIndex + 1) / commits.length) * 100 : 0;

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newIndex = Math.floor((percentage / 100) * commits.length);

      if (newIndex >= 0 && newIndex < commits.length) {
        onSelectCommit(newIndex);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, commits.length, onSelectCommit]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newIndex = Math.floor((percentage / 100) * commits.length);

    if (newIndex >= 0 && newIndex < commits.length) {
      onSelectCommit(newIndex);
    }
  };

  return (
    <div className="w-full space-y-3 px-1">
      {/* Timeline Track */}
      <div
        ref={containerRef}
        className="space-y-2"
      >
        {/* Main timeline bar */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-8 rounded-full overflow-hidden cursor-pointer group"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Background dots for commits */}
          <div className="absolute inset-0 flex items-center px-2">
            {commits.map((commit, idx) => {
              const position = (idx / Math.max(1, commits.length - 1)) * 100;
              const color = getAuthorColor(commit.authorName);
              const isNear = currentIndex === idx;

              return (
                <div
                  key={commit.hash}
                  className="absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 transition-all"
                  style={{
                    left: `${position}%`,
                    backgroundColor: color,
                    opacity: isNear ? 1 : 0.4,
                    boxShadow: isNear ? `0 0 6px ${color}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* Progress bar */}
          <div
            className="absolute inset-y-0 left-0 transition-all pointer-events-none"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${currentAuthorColor}40 0%, ${currentAuthorColor}10 100%)`,
            }}
          />

          {/* Playhead */}
          <div
            className={`absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all z-10 border-2 ${
              isDragging ? 'scale-125' : 'group-hover:scale-110'
            }`}
            style={{
              left: `${progress}%`,
              borderColor: currentAuthorColor,
              boxShadow: `0 0 12px ${currentAuthorColor}60, 0 2px 8px rgba(0,0,0,0.3)`,
            }}
            onMouseDown={handleMouseDown}
          />
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-[10px] text-gray-500 px-2">
          <span>{currentIndex + 1}</span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
          <span>{commits.length}</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoverIndex !== null && hoverIndex !== currentIndex && (
        <div className="animate-fade-in glass-card p-2 text-xs">
          <p className="text-gray-300 font-semibold truncate">
            {commits[hoverIndex]?.subject}
          </p>
          <p className="text-gray-500 text-[10px]">
            {commits[hoverIndex]?.authorName}
          </p>
        </div>
      )}

      {/* Current commit info */}
      {currentCommit && (
        <div
          className="glass-card p-3 transition-all"
          style={{
            borderColor: `${currentAuthorColor}40`,
            background: `linear-gradient(135deg, ${currentAuthorColor}08 0%, transparent 100%), rgba(255,255,255,0.03)`,
          }}
        >
          <p className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider mb-1">
            Now Playing
          </p>
          <p className="text-sm font-semibold text-white line-clamp-2">
            {currentCommit.subject}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            <span style={{ color: currentAuthorColor }}>{currentCommit.authorName}</span>
            {' • '}
            {new Date(currentCommit.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimelineScrubber;
