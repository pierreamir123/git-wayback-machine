import React, { useState, useMemo } from 'react';
import { getAuthorColor } from '../../utils/colors';

interface Commit {
  hash: string;
  shortHash: string;
  authorName: string;
  subject: string;
  date: string;
}

interface SearchFilterProps {
  commits: Commit[];
  onSelectCommit: (hash: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ commits, onSelectCommit }) => {
  const [query, setQuery] = useState('');
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const uniqueAuthors = useMemo(
    () => Array.from(new Set(commits.map((c) => c.authorName))).sort(),
    [commits]
  );

  const filtered = useMemo(() => {
    return commits.filter((commit) => {
      const matchesQuery =
        query === '' ||
        commit.subject.toLowerCase().includes(query.toLowerCase()) ||
        commit.hash.includes(query) ||
        commit.shortHash.includes(query);

      const matchesAuthor = !authorFilter || commit.authorName === authorFilter;

      const commitDate = new Date(commit.date);
      const matchesDateFrom = !dateRange.from || commitDate >= new Date(dateRange.from);
      const matchesDateTo = !dateRange.to || commitDate <= new Date(dateRange.to);

      return matchesQuery && matchesAuthor && matchesDateFrom && matchesDateTo;
    });
  }, [commits, query, authorFilter, dateRange]);

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-white/3 via-white/1 to-transparent rounded-lg border border-white/15">
      {/* Geometric header */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500/30" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500/30" />

        <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] text-center py-2">
          Search & Filter
        </h3>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
          Query
        </label>
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Message, hash, or commit..."
            className="w-full bg-white/5 border-2 border-white/15 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Author Filter */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
          Author
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAuthorFilter(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all border-2 ${
              authorFilter === null
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-white/5 border-white/15 text-gray-400 hover:text-white hover:border-white/25'
            }`}
          >
            All
          </button>
          {uniqueAuthors.map((author) => (
            <button
              key={author}
              onClick={() => setAuthorFilter(author)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all border-2 flex items-center gap-1.5 ${
                authorFilter === author
                  ? 'border-white/50 text-white bg-white/10'
                  : 'bg-white/5 border-white/15 text-gray-400 hover:text-white hover:border-white/25'
              }`}
              style={{
                borderColor:
                  authorFilter === author ? getAuthorColor(author) : 'rgba(255,255,255,0.15)',
                backgroundColor:
                  authorFilter === author ? `${getAuthorColor(author)}20` : 'rgba(255,255,255,0.05)',
                color: authorFilter === author ? getAuthorColor(author) : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getAuthorColor(author) }}
              />
              <span className="truncate max-w-[80px]">{author.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            From
          </label>
          <input
            type="date"
            value={dateRange.from || ''}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value || undefined })
            }
            className="w-full bg-white/5 border-2 border-white/15 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
            To
          </label>
          <input
            type="date"
            value={dateRange.to || ''}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value || undefined })}
            className="w-full bg-white/5 border-2 border-white/15 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Results
          </label>
          <span className="text-[10px] text-gray-500">
            {filtered.length} of {commits.length}
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 border border-white/10 rounded bg-black/20 p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 text-xs py-4">No commits match filters</p>
          ) : (
            filtered.slice(0, 20).map((commit) => (
              <button
                key={commit.hash}
                onClick={() => onSelectCommit(commit.hash)}
                className="w-full text-left px-2 py-2 rounded hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white group-hover:text-blue-300 truncate flex-1">
                    {commit.subject}
                  </span>
                  <span className="text-[9px] text-gray-500 flex-shrink-0 font-mono">
                    {commit.shortHash}
                  </span>
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getAuthorColor(commit.authorName) }}
                  />
                  {commit.authorName}
                </div>
              </button>
            ))
          )}
          {filtered.length > 20 && (
            <p className="text-center text-gray-600 text-[9px] py-2">
              +{filtered.length - 20} more commits
            </p>
          )}
        </div>
      </div>

      {/* Clear Button */}
      {(query || authorFilter || dateRange.from || dateRange.to) && (
        <button
          onClick={() => {
            setQuery('');
            setAuthorFilter(null);
            setDateRange({});
          }}
          className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded transition-all uppercase tracking-wider"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default SearchFilter;
