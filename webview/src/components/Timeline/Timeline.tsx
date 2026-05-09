import React, { useMemo, useState } from 'react';
import CommitNode, { Commit } from './CommitNode';

interface TimelineProps {
  commits: Commit[];
  filePath: string;
  onSelectCommit: (hash: string) => void;
  selectedHash: string | null;
}

const Timeline: React.FC<TimelineProps> = ({ commits, filePath, onSelectCommit, selectedHash }) => {
  const [authorFilter, setAuthorFilter] = useState<string>('all');

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(commits.map(c => c.authorName));
    return Array.from(authors).sort();
  }, [commits]);

  const filteredCommits = useMemo(() => {
    if (authorFilter === 'all') return commits;
    return commits.filter(c => c.authorName === authorFilter);
  }, [commits, authorFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header / Toolbar */}
      <div className="mb-6 space-y-4 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">Commit History</h2>
            <p className="text-[11px] text-gray-500 truncate max-w-xs" title={filePath}>
              {filePath.split('/').pop()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="author-select"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Authors</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredCommits.length > 0 ? (
          filteredCommits.map((commit, index) => (
            <CommitNode
              key={commit.hash}
              commit={commit}
              isFirst={index === 0}
              isLast={index === filteredCommits.length - 1}
              isSelected={selectedHash === commit.hash}
              onSelect={onSelectCommit}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            No commits found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
