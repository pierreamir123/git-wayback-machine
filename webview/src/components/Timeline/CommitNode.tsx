import React from 'react';

export interface Commit {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  subject: string;
  body: string;
}

interface CommitNodeProps {
  commit: Commit;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (hash: string) => void;
}

const CommitNode: React.FC<CommitNodeProps> = ({ commit, isFirst, isLast, isSelected, onSelect }) => {
  return (
    <div className="flex group">
      {/* Timeline track */}
      <div className="flex flex-col items-center mr-4 relative">
        <div className={`w-0.5 bg-white/20 flex-1 ${isFirst ? 'opacity-0' : ''}`} />
        <div className={`w-3 h-3 rounded-full border-2 transition-all ${
          isSelected 
            ? 'bg-blue-500 border-white scale-125 shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
            : 'bg-gray-600 border-white/20 group-hover:scale-110 group-hover:bg-blue-400'
        }`} />
        <div className={`w-0.5 bg-white/20 flex-1 ${isLast ? 'opacity-0' : ''}`} />
      </div>

      {/* Commit Content */}
      <div className="flex-1 pb-6">
        <div 
          onClick={() => onSelect(commit.hash)}
          className={`border rounded-lg p-3 transition-all cursor-pointer shadow-sm ${
            isSelected 
              ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20' 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <h3 className={`font-medium text-sm line-clamp-2 leading-tight ${isSelected ? 'text-blue-100' : 'text-gray-100'}`}>
              {commit.subject}
            </h3>
            <span className="text-[10px] font-mono text-gray-500 bg-black/30 px-1.5 py-0.5 rounded shrink-0">
              {commit.shortHash}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-gray-400 gap-2">
            <span className={`font-semibold ${isSelected ? 'text-blue-200' : 'text-gray-300'}`}>{commit.authorName}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{new Date(commit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitNode;
