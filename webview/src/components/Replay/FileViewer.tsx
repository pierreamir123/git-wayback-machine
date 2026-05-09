import React, { useEffect, useState } from 'react';

interface BlameLine {
  lineNumber: number;
  commitHash: string;
  author: string;
  timestamp: number;
  content: string;
}

interface FileViewerProps {
  content: string;
  blame?: BlameLine[];
  addedLines?: number[];
  isReplaying?: boolean;
}

const FileViewer: React.FC<FileViewerProps> = ({ content, blame, addedLines, isReplaying }) => {
  const lines = content.split('\n');
  const [visibleLines, setVisibleLines] = useState<number>(lines.length);

  useEffect(() => {
    if (isReplaying) {
      setVisibleLines(0);
      const timer = setInterval(() => {
        setVisibleLines(prev => {
          if (prev >= lines.length) {
            clearInterval(timer);
            return lines.length;
          }
          return prev + Math.ceil(lines.length / 20); // Animate in chunks for smoothness
        });
      }, 30);
      return () => clearInterval(timer);
    } else {
      setVisibleLines(lines.length);
    }
  }, [content, isReplaying]);

  const getHeatmapColor = (timestamp: number) => {
    const now = Date.now() / 1000;
    const age = now - timestamp;
    const day = 24 * 60 * 60;

    if (age < 7 * day) return 'bg-purple-500/40';
    if (age < 30 * day) return 'bg-red-500/30';
    if (age < 90 * day) return 'bg-orange-500/20';
    if (age < 365 * day) return 'bg-yellow-500/10';
    return 'bg-blue-500/10';
  };

  return (
    <div className="flex-1 overflow-auto bg-black/20 rounded-lg border border-white/10 font-mono text-[12px] leading-relaxed relative group custom-scrollbar">
      <div className="flex min-h-full">
        {/* Blame / Heatmap Column */}
        {blame && blame.length > 0 && (
          <div className="py-4 bg-white/5 border-r border-white/5 select-none sticky left-0 z-10">
            {lines.slice(0, visibleLines).map((_, i) => {
              const b = blame[i];
              return (
                <div key={i} className={`px-2 flex items-center gap-2 whitespace-nowrap h-5 ${b ? getHeatmapColor(b.timestamp) : ''}`}>
                   <span className="w-16 truncate text-[10px] text-gray-400 font-medium">
                     {b?.author || ''}
                   </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Line Numbers */}
        <div className="py-4 pr-4 pl-2 text-right text-gray-600 bg-white/5 border-r border-white/5 select-none sticky left-0 z-10 min-w-[3rem]">
          {lines.slice(0, visibleLines).map((_, i) => (
            <div key={i} className="h-5">{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <div className="py-4 px-4 text-gray-300 whitespace-pre min-w-full">
          {lines.slice(0, visibleLines).map((line, i) => {
            const isAdded = addedLines?.includes(i + 1);
            return (
              <div 
                key={i} 
                className={`h-5 flex items-center transition-all duration-300 ${
                  isAdded 
                    ? 'bg-green-500/20 text-green-100 font-bold ring-1 ring-green-500/20 -mx-4 px-4' 
                    : ''
                }`}
              >
                {line || ' '}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
