import React, { useState } from 'react';

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'hunk';
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  fileName: string;
  language?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  oldCode,
  newCode,
  fileName,
  language = 'javascript',
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showContext, setShowContext] = useState(true);

  // Simple syntax highlighting
  const highlightCode = (code: string, type: 'add' | 'remove' | 'context') => {
    const keywords = /\b(function|const|let|var|return|if|else|for|while|class|import|export|async|await|interface|type)\b/g;
    let highlighted = code.replace(keywords, '<span class="text-blue-400">$1</span>');
    highlighted = highlighted.replace(/"[^"]*"/g, '<span class="text-green-400">$&</span>');
    highlighted = highlighted.replace(/'[^']*'/g, '<span class="text-green-400">$&</span>');
    highlighted = highlighted.replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>');
    return highlighted;
  };

  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const maxLines = Math.max(oldLines.length, newLines.length);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-white uppercase tracking-widest">{fileName}</p>
            <p className="text-[10px] text-gray-500 mt-1">
              Language: <span className="text-gray-400">{language}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                viewMode === 'split'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                viewMode === 'unified'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setShowContext(!showContext)}
              className="px-2 py-1 text-xs font-semibold rounded bg-white/5 text-gray-500 border border-white/10 hover:text-white transition-all"
              title="Toggle context lines"
            >
              {showContext ? 'Hide' : 'Show'} Context
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-green-400 font-semibold">+{newLines.length} lines</span>
          <span className="text-red-400 font-semibold">-{oldLines.length} lines</span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {viewMode === 'split' ? (
          // Split view
          <div className="flex divide-x divide-white/10">
            {/* Old code */}
            <div className="flex-1">
              <div className="sticky top-0 bg-red-950/30 px-3 py-2 border-b border-white/10 text-red-400 font-semibold text-[10px]">
                Original
              </div>
              <div className="space-y-0">
                {oldLines.map((line, idx) => (
                  <div
                    key={`old-${idx}`}
                    className="flex hover:bg-red-950/20 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-12 flex-shrink-0 bg-black/30 text-gray-600 text-right px-2 py-1 select-none border-r border-white/10">
                      {idx + 1}
                    </div>
                    <div className="flex-1 px-3 py-1 text-red-200 break-words">
                      {line || ' '}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New code */}
            <div className="flex-1">
              <div className="sticky top-0 bg-green-950/30 px-3 py-2 border-b border-white/10 text-green-400 font-semibold text-[10px]">
                Modified
              </div>
              <div className="space-y-0">
                {newLines.map((line, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="flex hover:bg-green-950/20 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="w-12 flex-shrink-0 bg-black/30 text-gray-600 text-right px-2 py-1 select-none border-r border-white/10">
                      {idx + 1}
                    </div>
                    <div className="flex-1 px-3 py-1 text-green-200 break-words">
                      {line || ' '}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Unified view
          <div>
            <div className="sticky top-0 bg-white/5 px-3 py-2 border-b border-white/10 text-gray-400 font-semibold text-[10px]">
              Unified Diff
            </div>
            <div className="space-y-0">
              {Array.from({ length: maxLines }).map((_, idx) => {
                const oldLine = oldLines[idx];
                const newLine = newLines[idx];
                const isAdded = idx >= oldLines.length;
                const isRemoved = idx >= newLines.length;

                if (isAdded && newLine === undefined) return null;
                if (isRemoved && oldLine === undefined) return null;

                return (
                  <div
                    key={idx}
                    className={`flex border-b border-white/5 last:border-0 ${
                      isAdded ? 'bg-green-950/20 hover:bg-green-950/30' : isRemoved ? 'bg-red-950/20 hover:bg-red-950/30' : 'hover:bg-white/5'
                    } transition-colors`}
                  >
                    <div className="w-8 flex-shrink-0 bg-black/30 text-gray-600 text-right px-2 py-1 select-none border-r border-white/10 text-[9px]">
                      {isAdded ? '+' : isRemoved ? '-' : ' '}
                    </div>
                    <div
                      className={`flex-1 px-3 py-1 break-words ${
                        isAdded ? 'text-green-200' : isRemoved ? 'text-red-200' : 'text-gray-300'
                      }`}
                    >
                      {isAdded ? newLine : oldLine || ' '}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;
