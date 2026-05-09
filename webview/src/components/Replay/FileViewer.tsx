import React from 'react';

interface FileViewerProps {
  content: string;
  language?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="flex-1 overflow-auto bg-black/20 rounded-lg border border-white/10 font-mono text-[12px] leading-relaxed relative group">
      <div className="flex min-h-full">
        {/* Line Numbers */}
        <div className="py-4 pr-4 pl-2 text-right text-gray-600 bg-white/5 border-r border-white/5 select-none sticky left-0 z-10 min-w-[3rem]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Content */}
        <div className="py-4 px-4 text-gray-300 whitespace-pre min-w-full">
          {content}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
