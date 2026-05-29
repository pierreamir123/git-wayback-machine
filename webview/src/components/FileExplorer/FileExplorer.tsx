import React, { useState } from 'react';
import { getAuthorColor } from '../../utils/colors';

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  lines?: { added: number; deleted: number };
}

interface FileExplorerProps {
  files: FileChange[];
  currentAuthor?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, currentAuthor }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const authorColor = currentAuthor ? getAuthorColor(currentAuthor) : '#3b82f6';

  const togglePath = (path: string) => {
    const newSet = new Set(expandedPaths);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setExpandedPaths(newSet);
  };

  const statusColors = {
    added: '#10b981',
    modified: '#f59e0b',
    deleted: '#ef4444',
    renamed: '#8b5cf6',
  };

  const statusLabels = {
    added: 'A',
    modified: 'M',
    deleted: 'D',
    renamed: 'R',
  };

  // Group files by directory
  const grouped = files.reduce(
    (acc, file) => {
      const parts = file.path.split('/');
      const dir = parts.slice(0, -1).join('/') || 'root';
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    },
    {} as Record<string, FileChange[]>
  );

  return (
    <div className="font-mono text-xs space-y-0.5 select-text">
      {/* Header */}
      <div className="sticky top-0 bg-black/40 border-b border-white/10 px-3 py-2 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-white text-[11px] uppercase tracking-wider">
            Files Changed
          </span>
          <span className="text-gray-500">{files.length}</span>
        </div>
      </div>

      {/* Files by directory */}
      <div className="space-y-1 p-3">
        {Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dir, dirFiles]) => (
            <div key={dir} className="space-y-1">
              {/* Directory header */}
              <button
                onClick={() => togglePath(dir)}
                className="w-full text-left px-2 py-1 rounded transition-colors hover:bg-white/5 flex items-center gap-2 group"
              >
                <span
                  className="text-gray-600 group-hover:text-gray-400 transition-colors"
                  style={{ color: expandedPaths.has(dir) ? authorColor : undefined }}
                >
                  {expandedPaths.has(dir) ? '▼' : '▶'}
                </span>
                <span className="text-gray-400 truncate text-[10px]">{dir}</span>
                <span className="text-gray-600 ml-auto text-[9px]">{dirFiles.length}</span>
              </button>

              {/* Files in directory */}
              {expandedPaths.has(dir) && (
                <div className="space-y-0.5 pl-6">
                  {dirFiles.map((file) => (
                    <div
                      key={file.path}
                      className="group px-2 py-1 rounded hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-l-2"
                      style={{ borderColor: expandedPaths.has(dir) ? `${authorColor}40` : 'transparent' }}
                    >
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Status badge */}
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider flex-shrink-0"
                            style={{ backgroundColor: statusColors[file.status] }}
                          >
                            {statusLabels[file.status]}
                          </span>

                          {/* File name */}
                          <span className="text-gray-200 truncate text-[10px]">
                            {file.path.split('/').pop()}
                          </span>
                        </div>

                        {/* Changes */}
                        {file.lines && (
                          <div className="flex items-center gap-2 text-[9px] flex-shrink-0">
                            {file.lines.added > 0 && (
                              <span className="text-green-400">+{file.lines.added}</span>
                            )}
                            {file.lines.deleted > 0 && (
                              <span className="text-red-400">-{file.lines.deleted}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Old path for renames */}
                      {file.oldPath && file.oldPath !== file.path && (
                        <div className="text-[9px] text-gray-600 ml-8 mt-1">
                          ← {file.oldPath}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Stats footer */}
      <div className="border-t border-white/10 px-3 py-2 bg-black/20">
        <div className="text-[10px] text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Total files:</span>
            <span className="text-white">{files.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Added:</span>
            <span className="text-green-400">{files.filter((f) => f.status === 'added').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Modified:</span>
            <span className="text-yellow-400">{files.filter((f) => f.status === 'modified').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Deleted:</span>
            <span className="text-red-400">{files.filter((f) => f.status === 'deleted').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
