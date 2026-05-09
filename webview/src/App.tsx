import React, { useEffect, useState, useRef, useCallback } from 'react'
import Timeline from './components/Timeline/Timeline'
import FileViewer from './components/Replay/FileViewer'
import ReplayController from './components/Replay/ReplayController'
import InsightsPanel from './components/Insights/InsightsPanel'

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

function App() {
  const [history, setHistory] = useState<{filePath: string, commits: Commit[]} | null>(null);
  const [blame, setBlame] = useState<BlameLine[]>([]);
  const [insights, setInsights] = useState<FileInsights | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContentPayload | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  
  const [currentCommitIndex, setCurrentCommitIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  
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

    setCurrentCommitIndex(index);
    setIsLoadingContent(true);
    vscodeRef.current.postMessage({
      command: 'selectCommit',
      payload: { hash: commits[index].hash }
    });
  }, [history]);

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

  return (
    <div className="flex h-screen bg-transparent text-gray-100 select-none overflow-hidden">
      {/* Sidebar: Timeline */}
      <div className="w-80 border-r border-white/10 flex flex-col p-4 bg-black/10 shrink-0">
        {history ? (
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
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Loading history...</p>
          </div>
        )}
      </div>

      {/* Main Content: File Viewer */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
        {fileContent ? (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded px-3 py-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">Snapshot: {fileContent.hash.substring(0, 7)}</span>
                <span className="text-[10px] text-gray-600">({currentCommitIndex + 1} of {history?.commits.length})</span>
              </div>
              <div className="flex items-center gap-4">
                {isLoadingContent && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                <button 
                  onClick={() => setShowInsights(!showInsights)}
                  className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded transition-colors ${showInsights ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-500 border border-white/10 hover:text-gray-300'}`}
                >
                  Insights
                </button>
              </div>
            </div>
            
            <FileViewer 
              content={fileContent.content} 
              blame={fileContent.hash === (history?.commits[0]?.hash) ? blame : []}
              addedLines={fileContent.addedLines}
              isReplaying={isPlaying}
            />

            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <ReplayController 
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onStep={handleStep}
                  speed={replaySpeed}
                  onSpeedChange={setReplaySpeed}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm italic">Select a commit to view file content</p>
          </div>
        )}
      </div>

      {/* Right Sidebar: Insights */}
      {showInsights && insights && (
        <div className="w-72 border-l border-white/10 flex flex-col p-4 bg-black/10 shrink-0 overflow-hidden">
          <InsightsPanel 
            insights={insights.insights}
            stabilityScore={insights.stabilityScore}
            story={insights.story}
          />
        </div>
      )}
    </div>
  )
}

export default App
