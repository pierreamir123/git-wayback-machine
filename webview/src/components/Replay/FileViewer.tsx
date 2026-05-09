import React, { useEffect, useState, useRef } from 'react';
import { getAuthorColor, getAuthorLightColor } from '../../utils/colors';

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
  currentAuthor?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ content, blame, addedLines, isReplaying, currentAuthor }) => {
  const lines = content.split('\n');
  const [visibleLines, setVisibleLines] = useState<number>(lines.length);
  const [cursorPositions, setCursorPositions] = useState<number[]>([]);

  useEffect(() => {
    if (isReplaying) {
      setVisibleLines(0);
      setCursorPositions([]);
      const timer = setInterval(() => {
        setVisibleLines(prev => {
          if (prev >= lines.length) {
            clearInterval(timer);
            return lines.length;
          }
          const next = prev + Math.ceil(lines.length / 20);
          return next > lines.length ? lines.length : next;
        });
      }, 30);
      return () => clearInterval(timer);
    } else {
      setVisibleLines(lines.length);
      setCursorPositions([]);
    }
  }, [content, isReplaying]);

  useEffect(() => {
    if (isReplaying && addedLines && addedLines.length > 0) {
      setCursorPositions(addedLines);
    } else {
      setCursorPositions([]);
    }
  }, [addedLines, isReplaying]);

  const getHeatmapColor = (timestamp: number, author: string) => {
    const authorColor = getAuthorColor(author);
    const now = Date.now() / 1000;
    const age = now - timestamp;
    const day = 24 * 60 * 60;

    let opacity = '10';
    if (age < 7 * day) opacity = '66';
    else if (age < 30 * day) opacity = '44';
    else if (age < 90 * day) opacity = '33';
    else if (age < 365 * day) opacity = '22';

    return { backgroundColor: `${authorColor}${opacity}` };
  };

  const authorColor = currentAuthor ? getAuthorColor(currentAuthor) : '#3b82f6';

  return (
    <div className="flex-1 overflow-auto bg-black/20 rounded-lg border border-white/10 font-mono text-[12px] leading-relaxed relative group custom-scrollbar">
      <div className="flex min-h-full relative">
        {/* Blame / Heatmap Column */}
        {blame && blame.length > 0 && (
          <div className="py-4 bg-white/5 border-r border-white/5 select-none sticky left-0 z-10">
            {lines.slice(0, visibleLines).map((_, i) => {
              const b = blame[i];
              return (
                <div 
                  key={i} 
                  className="px-2 flex items-center gap-2 whitespace-nowrap h-5"
                  style={b ? getHeatmapColor(b.timestamp, b.author) : {}}
                >
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
        <div className="py-4 px-4 text-gray-300 whitespace-pre min-w-full relative">
          {lines.slice(0, visibleLines).map((line, i) => {
            const lineNum = i + 1;
            const isAdded = addedLines?.includes(lineNum);
            const hasCursor = cursorPositions.includes(lineNum);

            return (
              <div 
                key={i} 
                className={`h-5 flex items-center transition-all duration-300 relative ${
                  isAdded 
                    ? 'bg-white/5 font-bold -mx-4 px-4' 
                    : ''
                }`}
                style={isAdded ? { borderLeft: `3px solid ${authorColor}`, backgroundColor: `${authorColor}11` } : {}}
              >
                {hasCursor && isReplaying && (
                  <div 
                    className="absolute left-0 w-1 h-5 z-20"
                    style={{ backgroundColor: authorColor, boxShadow: `0 0 10px ${authorColor}, 0 0 20px ${authorColor}` }}
                  >
                    <div 
                      className="absolute -top-5 left-0 text-[9px] px-1.5 py-0.5 rounded shadow-lg text-white font-bold whitespace-nowrap animate-bounce"
                      style={{ backgroundColor: authorColor }}
                    >
                      {currentAuthor}
                    </div>
                  </div>
                )}
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
