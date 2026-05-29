import React, { useState } from 'react';
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

interface CommitExplorerCardProps {
  commit: Commit;
  currentIndex: number;
  totalCommits: number;
}

const CommitExplorerCard: React.FC<CommitExplorerCardProps> = ({
  commit,
  currentIndex,
  totalCommits,
}) => {
  const [expanded, setExpanded] = useState(false);
  const authorColor = getAuthorColor(commit.authorName);
  const commitDate = new Date(commit.date);
  const formattedDate = commitDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = commitDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate author avatar initials
  const initials = commit.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="animate-fade-in">
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Commit {currentIndex + 1} of {totalCommits}
          </span>
          <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: `${authorColor}40` }} />
        </div>
      </div>

      {/* Main Card */}
      <div
        className="glass-card overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          borderColor: `${authorColor}40`,
          background: `linear-gradient(135deg, ${authorColor}08 0%, transparent 100%), rgba(255,255,255,0.03)`,
        }}
      >
        {/* Color accent bar */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: authorColor }}
        />

        <div className="p-6 space-y-6">
          {/* Author Section */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 shadow-md"
              style={{
                backgroundColor: authorColor,
                opacity: 0.9,
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm" style={{ color: authorColor }}>
                {commit.authorName}
              </p>
              <p className="text-xs text-gray-400 truncate">{commit.authorEmail}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

          {/* Commit Message */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-white leading-relaxed">
              {commit.subject}
            </h2>
            {commit.body && (
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                {commit.body}
              </p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="glass-card p-3 bg-white/5">
              <p className="text-gray-500 uppercase font-semibold tracking-wider text-[10px] mb-1">
                Hash
              </p>
              <p className="font-mono text-gray-200">{commit.shortHash}</p>
              <p className="font-mono text-gray-600 text-[10px] mt-1">{commit.hash.slice(0, 16)}…</p>
            </div>
            <div className="glass-card p-3 bg-white/5">
              <p className="text-gray-500 uppercase font-semibold tracking-wider text-[10px] mb-1">
                Committed
              </p>
              <p className="text-gray-200">{formattedDate}</p>
              <p className="text-gray-600 text-[10px] mt-1">{formattedTime}</p>
            </div>
          </div>

          {/* Expand Toggle */}
          {commit.body && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 px-3 text-xs font-semibold uppercase tracking-wider rounded transition-all text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
            >
              {expanded ? 'Hide Full Message' : 'View Full Message'}
            </button>
          )}

          {/* Expanded Body */}
          {expanded && commit.body && (
            <div className="animate-slide-up bg-white/5 border border-white/10 rounded p-4">
              <p className="text-xs leading-relaxed text-gray-300 font-mono whitespace-pre-wrap break-words">
                {commit.body}
              </p>
            </div>
          )}
        </div>

        {/* Footer accent */}
        <div
          className="h-px w-full opacity-20"
          style={{
            background: `linear-gradient(90deg, ${authorColor} 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Additional info row */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-gray-600">
        <span>Git Wayback Machine</span>
        <span className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: authorColor }}
          />
          {commit.authorName}
        </span>
      </div>
    </div>
  );
};

export default CommitExplorerCard;
