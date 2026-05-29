import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import Timeline from './components/Timeline/Timeline'
import FileViewer from './components/Replay/FileViewer'
import ReplayController from './components/Replay/ReplayController'
import InsightsPanel from './components/Insights/InsightsPanel'
import CommitExplorerCard from './components/CommitExplorerCard/CommitExplorerCard'
import TimelineScrubber from './components/TimelineScrubber/TimelineScrubber'
import FileExplorer from './components/FileExplorer/FileExplorer'
import DiffViewer from './components/DiffViewer/DiffViewer'
import ContributorGraph from './components/ContributorGraph/ContributorGraph'
import SearchFilter from './components/SearchFilter/SearchFilter'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'
import Onboarding from './components/Onboarding/Onboarding'

interface Commit {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  subject: string;
  body: string;
}

interface BlameLine {
  lineNumber: number;
  commitHash: string;
  author: string;
  timestamp: number;
  content: string;
}

interface Insight {
  type: 'hotspot' | 'ownership' | 'churn' | 'stability' | 'milestone';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'info';
}

interface FileInsights {
  stabilityScore: number;
  insights: Insight[];
  story: string[];
}

interface FileContentPayload {
  hash: string;
  content: string;
  addedLines?: number[];
}

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  lines?: { added: number; deleted: number };
}

function App() {
  const [history, setHistory] = useState<{filePath: string, commits: Commit[]} | null>(null);
  const [blame, setBlame] = useState<BlameLine[]>([]);
  const [insights, setInsights] = useState<FileInsights | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContentPayload | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [currentCommitIndex, setCurrentCommitIndex] = useState<number>(-1);
  const [previousCommitIndex, setPreviousCommitIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [viewMode, setViewMode] = useState<'files' | 'search'>('files');

  const vscodeRef = useRef<any>(null);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!vscodeRef.current) {
      vscodeRef.current = (window as any).acquireVsCodeApi();
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'setData':
          setHistory({ filePath: message.payload.filePath, commits: message.payload.commits });
          setBlame(message.payload.blame);
          setInsights(message.payload.insights);
          setLogoUri(message.payload.logoUri);
          if (message.payload.commits.length > 0 && currentCommitIndex === -1) {
            handleSelectCommitByIndex(0, message.payload.commits);
          }
          break;
        case 'setFileContent':
          setFileContent(message.payload);
          setIsLoadingContent(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    vscodeRef.current.postMessage({ command: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
      if (playTimerRef.current) window.clearInterval(playTimerRef.current);
    };
  }, []);

  const handleSelectCommitByIndex = useCallback((index: number, commitsOverride?: Commit[]) => {
    const commits = commitsOverride || history?.commits;
    if (!commits || index < 0 || index >= commits.length) return;

    setPreviousCommitIndex(currentCommitIndex);
    setCurrentCommitIndex(index);
    setIsLoadingContent(true);
    vscodeRef.current.postMessage({
      command: 'selectCommit',
      payload: { hash: commits[index].hash }
    });
  }, [history, currentCommitIndex]);

  const handleStep = useCallback((offset: number) => {
    if (!history) return;
    const newIndex = currentCommitIndex - offset;
    if (newIndex >= 0 && newIndex < history.commits.length) {
      handleSelectCommitByIndex(newIndex);
    } else if (isPlaying) {
      setIsPlaying(false);
    }
  }, [history, currentCommitIndex, handleSelectCommitByIndex, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = window.setInterval(() => {
        handleStep(1);
      }, 3000 / replaySpeed);
    } else {
      if (playTimerRef.current) {
        window.clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }
    return () => {
      if (playTimerRef.current) window.clearInterval(playTimerRef.current);
    };
  }, [isPlaying, replaySpeed, handleStep]);

  // Mock file changes for demo
  const mockFileChanges: FileChange[] = history?.commits[currentCommitIndex] ? [
    { path: 'src/components/App.tsx', status: 'modified', lines: { added: 12, deleted: 5 } },
    { path: 'src/types/index.ts', status: 'modified', lines: { added: 3, deleted: 2 } },
    { path: 'README.md', status: 'added', lines: { added: 45, deleted: 0 } },
  ] : [];

  // Generate mock diff based on commit transitions
  const diffContent = useMemo(() => {
    if (currentCommitIndex === previousCommitIndex || previousCommitIndex === -1) {
      return {
        old: fileContent?.content || '',
        new: fileContent?.content || '',
      };
    }
    // Simple mock: slightly modify the content to show as diff
    const base = fileContent?.content || 'const greeting = "Hello World";\nconsole.log(greeting);';
    return {
      old: base.split('\n').slice(0, -1).join('\n'),
      new: base,
    };
  }, [currentCommitIndex, previousCommitIndex, fileContent?.content]);

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <Onboarding
          isFirstTime={true}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-2xl max-h-96 overflow-y-auto bg-black/80 rounded-lg border border-white/20">
            <div className="flex justify-between items-center sticky top-0 bg-black/90 border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <SettingsPanel onSettingChange={(id, value) => console.log(id, value)} />
          </div>
        </div>
      )}

      <div className="flex h-screen bg-transparent text-gray-100 select-none overflow-hidden">
        {/* Left Sidebar: Timeline & Search */}
        <div className="w-64 border-r border-white/10 flex flex-col p-3 bg-black/10 shrink-0 overflow-hidden">
          {history ? (
            <div className="flex flex-col h-full gap-3">
              {/* Search/Filter Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('files')}
                  className={`flex-1 px-2 py-1 text-xs font-semibold rounded transition-colors ${
                    viewMode === 'files'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('search')}
                  className={`flex-1 px-2 py-1 text-xs font-semibold rounded transition-colors ${
                    viewMode === 'search'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
                  }`}
                >
                  Search
                </button>
              </div>

              {/* Timeline or Search View */}
              <div className="flex-1 overflow-hidden">
                {viewMode === 'files' ? (
                  <Timeline
                    commits={history.commits}
                    filePath={history.filePath}
                    onSelectCommit={(hash) => {
                      const idx = history.commits.findIndex(c => c.hash === hash);
                      handleSelectCommitByIndex(idx);
                    }}
                    selectedHash={currentCommitIndex !== -1 ? history.commits[currentCommitIndex].hash : null}
                    logoUri={logoUri}
                  />
                ) : (
                  <SearchFilter
                    commits={history.commits}
                    onSelectCommit={(hash) => {
                      const idx = history.commits.findIndex(c => c.hash === hash);
                      handleSelectCommitByIndex(idx);
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading history...</p>
            </div>
          )}
        </div>

        {/* Main Content Area - Code Viewer */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
          {fileContent && currentCommitIndex !== -1 && history ? (
            <>
              {/* View Mode Tabs */}
              <div className="flex gap-2 border-b border-white/10 mb-4 flex-shrink-0">
                <button
                  onClick={() => setShowDiff(false)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                    !showDiff
                      ? 'text-white border-blue-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  File Content
                </button>
                <button
                  onClick={() => setShowDiff(true)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                    showDiff
                      ? 'text-white border-blue-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  Diff View
                </button>
              </div>

              {/* Code Area - Full Height */}
              <div className="flex-1 overflow-auto">
                {showDiff ? (
                  <DiffViewer
                    oldCode={diffContent.old}
                    newCode={diffContent.new}
                    fileName={history.filePath.split('/').pop() || 'file.ts'}
                    language="typescript"
                  />
                ) : (
                  <FileViewer
                    content={fileContent.content}
                    blame={fileContent.hash === (history?.commits[0]?.hash) ? blame : []}
                    addedLines={fileContent.addedLines}
                    isReplaying={isPlaying}
                    currentAuthor={history?.commits[currentCommitIndex]?.authorName}
                  />
                )}
              </div>

              {/* Replay Controls - Bottom */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                  <ReplayController
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                    onStep={handleStep}
                    speed={replaySpeed}
                    onSpeedChange={setReplaySpeed}
                    currentAuthor={history?.commits[currentCommitIndex]?.authorName}
                    onRestart={() => {
                      if (history) {
                        handleSelectCommitByIndex(history.commits.length - 1);
                        setIsPlaying(true);
                      }
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm italic">Select a commit to view file content</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Details & Timeline Scrubber */}
        {fileContent && currentCommitIndex !== -1 && history && (
          <div className="w-96 border-l border-white/10 flex flex-col p-4 bg-black/10 shrink-0 overflow-hidden">
            {/* Commit Details Card */}
            <div className="mb-6">
              <CommitExplorerCard
                commit={history.commits[currentCommitIndex]}
                currentIndex={currentCommitIndex}
                totalCommits={history.commits.length}
              />
            </div>

            {/* Timeline Scrubber */}
            <div className="mb-6">
              <TimelineScrubber
                commits={history.commits}
                currentIndex={currentCommitIndex}
                onSelectCommit={handleSelectCommitByIndex}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 my-4" />

            {/* Additional Info Tabs */}
            <div className="flex-1 overflow-auto space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Changed Files
                </h3>
                <FileExplorer
                  files={mockFileChanges}
                  currentAuthor={history.commits[currentCommitIndex]?.authorName}
                />
              </div>

              {insights && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Insights
                  </h3>
                  <InsightsPanel
                    insights={insights.insights}
                    stabilityScore={insights.stabilityScore}
                    story={insights.story}
                  />
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Contributors
                </h3>
                <ContributorGraph commits={history.commits} />
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="mt-4 w-full py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
