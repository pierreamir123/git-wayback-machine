import React, { useMemo } from 'react';
import { getAuthorColor } from '../../utils/colors';

interface Commit {
  hash: string;
  authorName: string;
  date: string;
}

interface ContributorGraphProps {
  commits: Commit[];
}

const ContributorGraph: React.FC<ContributorGraphProps> = ({ commits }) => {
  const stats = useMemo(() => {
    const authorStats: Record<
      string,
      { count: number; color: string; lastCommit: Date }
    > = {};

    commits.forEach((commit) => {
      if (!authorStats[commit.authorName]) {
        authorStats[commit.authorName] = {
          count: 0,
          color: getAuthorColor(commit.authorName),
          lastCommit: new Date(commit.date),
        };
      }
      authorStats[commit.authorName].count++;
      const commitDate = new Date(commit.date);
      if (commitDate > authorStats[commit.authorName].lastCommit) {
        authorStats[commit.authorName].lastCommit = commitDate;
      }
    });

    return Object.entries(authorStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [commits]);

  const maxCount = Math.max(...stats.map((s) => s.count));

  // Generate commit heatmap (by week)
  const dateRange = useMemo(() => {
    if (commits.length === 0) return { start: new Date(), end: new Date() };
    const dates = commits.map((c) => new Date(c.date)).sort((a, b) => a.getTime() - b.getTime());
    return { start: dates[0], end: dates[dates.length - 1] };
  }, [commits]);

  const heatmapData = useMemo(() => {
    const map: Record<string, number> = {};
    commits.forEach((commit) => {
      const date = new Date(commit.date);
      const week = Math.floor((date.getTime() - dateRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const key = `week-${week}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [commits, dateRange]);

  const weekCount = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const getHeatmapColor = (count: number) => {
    if (count === 0) return '#1e293b';
    const intensity = Math.min(count / 10, 1);
    const r = Math.round(59 + (59 - 59) * intensity);
    const g = Math.round(130 + (245 - 130) * intensity);
    const b = Math.round(246 + (157 - 246) * intensity);
    return `rgba(${r}, ${g}, ${b}, 0.6)`;
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-white/5 to-transparent rounded-lg border border-white/10">
      {/* Contributors Ranking */}
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-3">
          Contributors
        </h3>
        <div className="space-y-2">
          {stats.map((author, idx) => (
            <div key={author.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-500">{idx + 1}</span>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: author.color }}
                  />
                  <span className="text-sm text-white truncate">{author.name}</span>
                </div>
                <span className="text-xs font-semibold text-gray-400 ml-2 flex-shrink-0">
                  {author.count}
                </span>
              </div>

              {/* Bar */}
              <div className="h-5 bg-white/5 rounded overflow-hidden relative group-hover:bg-white/10 transition-colors">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${(author.count / maxCount) * 100}%`,
                    background: `linear-gradient(90deg, ${author.color}40 0%, ${author.color}80 100%)`,
                    boxShadow: `0 0 8px ${author.color}40`,
                  }}
                />
              </div>

              {/* Last commit */}
              <p className="text-[10px] text-gray-600 mt-1">
                Last: {author.lastCommit.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div>
        <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-3">
          Activity Timeline
        </h3>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: weekCount }).map((_, week) => {
            const count = heatmapData[`week-${week}`] || 0;
            const weekStart = new Date(
              dateRange.start.getTime() + week * 7 * 24 * 60 * 60 * 1000
            );
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

            return (
              <div
                key={week}
                className="group relative"
                title={`${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}: ${count} commits`}
              >
                <div
                  className="w-4 h-4 rounded-sm transition-all hover:scale-125 cursor-pointer border border-white/10 hover:border-white/30"
                  style={{ backgroundColor: getHeatmapColor(count) }}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-black/80 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/20">
                    {count} commits
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase text-[9px] tracking-widest mb-1">Total</p>
          <p className="text-lg font-bold text-white">{commits.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase text-[9px] tracking-widest mb-1">Contributors</p>
          <p className="text-lg font-bold text-white">{stats.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase text-[9px] tracking-widest mb-1">Weeks</p>
          <p className="text-lg font-bold text-white">{weekCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ContributorGraph;
