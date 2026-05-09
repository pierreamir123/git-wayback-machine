import React from 'react';
import { getAuthorColor } from '../../utils/colors';

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
  const authorColor = getAuthorColor(commit.authorName);

  return (
    <div className="flex group">
      {/* Timeline track */}
      <div className="flex flex-col items-center mr-4 relative">
        <div className={`w-0.5 bg-white/20 flex-1 ${isFirst ? 'opacity-0' : ''}`} />
        <div 
          className={`w-3 h-3 rounded-full border-2 transition-all ${
            isSelected 
              ? 'scale-125 shadow-[0_0_8px_rgba(255,255,255,0.5)]' 
              : 'border-white/20 group-hover:scale-110'
          }`}
          style={{ 
            backgroundColor: isSelected ? authorColor : '#4b5563',
            borderColor: isSelected ? 'white' : 'transparent'
          }}
        />
        <div className={`w-0.5 bg-white/20 flex-1 ${isLast ? 'opacity-0' : ''}`} />
      </div>

      {/* Commit Content */}
      <div className="flex-1 pb-6">
        <div 
          onClick={() => onSelect(commit.hash)}
          className={`border rounded-lg p-3 transition-all cursor-pointer shadow-sm ${
            isSelected 
              ? 'ring-1' 
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
          style={isSelected ? { 
            backgroundColor: `${authorColor}1a`, 
            borderColor: `${authorColor}80`,
            boxShadow: `0 0 0 1px ${authorColor}33`
          } : {}}
        >
          <div className="flex justify-between items-start gap-4">
            <h3 className={`font-medium text-sm line-clamp-2 leading-tight ${isSelected ? 'text-white' : 'text-gray-100'}`}>
              {commit.subject}
            </h3>
            <span className="text-[10px] font-mono text-gray-500 bg-black/30 px-1.5 py-0.5 rounded shrink-0">
              {commit.shortHash}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-gray-400 gap-2">
            <span 
              className="font-semibold"
              style={{ color: isSelected ? 'white' : authorColor }}
            >
              {commit.authorName}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{new Date(commit.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitNode;
