Here's a structured implementation plan optimized for **Gemini Code**, broken into iterative phases that build on each other. Each phase produces a working, testable increment.

---

# Gemini Code Implementation Plan: Git Wayback Machine

## Phase 0: Foundation & Scaffold (Start Here)
**Goal:** Working extension shell with webview communication.

```
1. Create project structure:
   - package.json with activation events, commands, webview panel
   - tsconfig.json, webpack.config.js for webview bundling
   - src/extension.ts (entry point)
   - src/commands/ (command registrations)
   - src/providers/ (webview panel provider)
   - webview/src/App.tsx (React entry)
   - webview/public/index.html

2. Implement:
   - "Git Wayback: Open Timeline" command
   - WebviewPanel provider with message passing (vscode ↔ React)
   - Basic React app with dark theme shell
   - Build scripts for both extension host and webview

3. Acceptance: Command opens panel, React renders, ping/pong message works.
```

**Gemini Prompt:** *"Scaffold a VSCode extension with a React webview. Set up TypeScript, webpack for the webview, and implement a command that opens a webview panel with message passing between the extension host and React. Use VSCode's official webview API patterns."*

---

## Phase 1: Git Data Layer
**Goal:** Reliable local git data extraction, no UI yet.

```
1. src/git/gitService.ts
   - Find git repo root for active file
   - Execute git commands via child_process
   - Error handling for non-git files

2. src/git/historyIndex.ts
   - git log --follow --format=... for file history
   - Parse commits: hash, author, date, message, stats
   - Cache results in Map<filePath, Commit[]>

3. src/git/blameService.ts
   - git blame -p --porcelain
   - Parse line-by-line ownership and timestamps

4. src/git/diffService.ts
   - git show <commit>:<file> (get file at commit)
   - git diff <commitA> <commitB> -- <file>
   - Return unified diff strings

5. src/shared/types.ts
   - Define all interfaces (FileHistoryCommit, ContributorStats, etc.)
```

**Gemini Prompt:** *"Build a git service layer for a VSCode extension that extracts file history, blame data, and diffs using child_process. Include TypeScript interfaces for commits, authors, and line ownership. Implement caching so repeated lookups are instant."*

---

## Phase 2: Timeline UI (First Visual Feature)
**Goal:** Interactive commit timeline in the webview.

```
1. webview/src/components/Timeline/
   - Timeline.tsx (main container)
   - CommitNode.tsx (individual commit card)
   - TimelineScrubber.tsx (horizontal time scrubber)

2. Data flow:
   - Extension host requests git history → sends to webview
   - Webview renders vertical/horizontal timeline
   - Click commit → request file snapshot at that commit

3. Features:
   - Show commits with author, date, message, insertions/deletions
   - Zoom in/out on date ranges
   - Filter by author (dropdown from unique authors)
   - Jump to commit button

4. Styling: TailwindCSS, dark theme, compact cards
```

**Gemini Prompt:** *"Build a React timeline component for a VSCode webview that displays git commit history vertically. Each commit shows author, date, message, and change stats. Add zoom controls and author filtering. Use TailwindCSS with a dark developer theme. Receive data via postMessage from the extension host."*

---

## Phase 3: File Replay Mode
**Goal:** See file evolve commit-by-commit.

```
1. webview/src/components/Replay/
   - ReplayController.tsx (play/pause/speed controls)
   - DiffViewer.tsx (wrap Monaco diff editor or custom diff)

2. Extension host:
   - Preload file content for N commits around current position
   - Stream snapshots to webview incrementally

3. Webview:
   - Side-by-side diff view (Monaco Editor diff)
   - Playback controls: play, pause, step fwd/back, speed 1x-8x
   - Progress bar through commits
   - Ghost previous version option (opacity toggle)

4. Monaco integration:
   - Use monaco-editor npm package in webview
   - Configure for diff mode, dark theme, read-only
```

**Gemini Prompt:** *"Create a file replay component using Monaco Editor's diff view in a VSCode webview. Add playback controls (play, pause, step, speed) that cycle through git commit snapshots received from the extension host. Show a progress bar of commits and allow pausing on any commit."*

---

## Phase 4: Contributor Heatmap
**Goal:** Visualize ownership and churn on code lines.

```
1. Analytics: src/analytics/churn.ts, src/analytics/ownership.ts
   - Calculate edit frequency per line from blame data
   - Determine line ownership (last author, dominant author)
   - Churn score = number of edits / age

2. Webview: webview/src/components/Heatmap/
   - HeatmapOverlay.tsx (line-by-line color bars)
   - MiniMapHeatmap.tsx (file overview strip)
   - Legend and filter controls

3. Color mapping:
   - Cool tones (blue/green) = stable, single owner
   - Warm tones (yellow/orange/red) = high churn
   - Purple accents = recent changes (< 7 days)

4. Filters:
   - By author (highlight only their lines)
   - By time window (last 30/90/365 days)
   - By churn threshold
```

**Gemini Prompt:** *"Build a code heatmap analyzer that processes git blame data to calculate per-line churn and ownership scores. Create a React component that renders a heatmap overlay on code lines with a minimap summary. Use a color scale from blue (stable) to red (high churn). Include filters for author and time window."*

---

## Phase 5: Insights Engine
**Goal:** Generate smart observations about file evolution.

```
1. src/analytics/insights.ts
   - Detect heavy change periods (commit density spikes)
   - Identify ownership shifts (author dominance changes over time)
   - Find hotspots (functions/regions with high churn)
   - Detect large rewrites (>50% lines changed in single commit)
   - Calculate stability score (0-100)

2. src/analytics/story.ts
   - Rule-based narrative generation:
     * "First appeared in commit X by Author Y"
     * "Heavy refactoring period: Date A to Date B"
     * "Ownership shifted from Author X to Author Y in Month Z"
     * "This function has been modified N times"

3. Webview: webview/src/components/Insights/
   - InsightsPanel.tsx (collapsible cards)
   - StoryMode.tsx (readable narrative view)
   - HotspotList.tsx (ranked risky sections)
```

**Gemini Prompt:** *"Create an analytics engine that analyzes git history to detect code hotspots, ownership shifts, refactoring periods, and stability trends. Build a React insights panel that displays these as readable cards with icons and severity indicators. Include a story mode that generates a paragraph narrative of the file's evolution."*

---

## Phase 6: Comparison Mode
**Goal:** Compare two points in file history.

```
1. webview/src/components/Comparison/
   - ComparisonSelector.tsx (pick two commits/dates from timeline)
   - ComparisonView.tsx (diff + stats side panel)

2. Stats to show:
   - Lines added/removed/modified
   - Structural changes (imports, functions added/removed)
   - Ownership changes between versions
   - Stability difference score

3. UI:
   - Split diff view
   - Summary stats cards above diff
   - Highlight moved blocks where possible
```

**Gemini Prompt:** *"Build a historical comparison component that lets users select two git commits and view a unified diff with summary statistics. Show lines changed, structural differences, and ownership shifts between the two versions. Use Monaco diff editor for the code view."*

---

## Phase 7: VSCode Integration Polish
**Goal:** Deep IDE integration, not just a webview.

```
1. Activity Bar:
   - Custom view container with tree view of recent files analyzed
   - Click file → open its timeline

2. Editor Title Actions:
   - Button in editor tab bar to "Open in Wayback Machine"
   - Context menu on files: "Git Wayback: Replay History"

3. Inline Decorations:
   - Line blame annotations (inline git blame, like GitLens)
   - Heatmap indicators in gutter

4. Status Bar:
   - Current file's stability score / last modified indicator

5. Commands to register:
   - Git Wayback: Open Timeline
   - Git Wayback: Replay File History
   - Git Wayback: Show Contributor Heatmap
   - Git Wayback: Analyze File Evolution
   - Git Wayback: Compare Historical Snapshots
   - Git Wayback: Open Story Mode
```

**Gemini Prompt:** *"Add deep VSCode integration to the extension: an Activity Bar panel with a tree view of file history, editor title action buttons, inline blame decorations in the gutter, status bar indicators, and full command palette registration for all features."*

---

## Phase 8: Performance & Large Repo Handling
**Goal:** Works on files with 1000+ commits without freezing.

```
1. Optimization:
   - Web Workers for blame parsing and diff computation
   - Virtualized lists for long commit timelines (react-window)
   - Incremental history loading (load 50 commits at a time)
   - LRU cache for file snapshots and diffs
   - Debounce rapid scrubbing actions

2. Background processing:
   - Index file history in worker thread
   - Stream commits to webview as they're parsed
   - Cancelable operations (AbortController for git processes)

3. Memory management:
   - Clear old snapshots when switching files
   - Limit diff context lines for large files
```

**Gemini Prompt:** *"Optimize the extension for large repositories. Implement Web Workers for git parsing, virtualized scrolling for long timelines, incremental commit loading with pagination, and an LRU cache. Ensure the UI remains responsive during heavy git operations."*

---

## Phase 9: Testing & Packaging
**Goal:** Production-ready artifact.

```
1. Testing:
   - Unit tests for analytics engine (Jest)
   - Integration tests for git service (mock git repo)
   - Webview component tests (React Testing Library)

2. Mock data:
   - src/test/mockData.ts for development without git repo

3. Build & Package:
   - vsce package configuration
   - CI-friendly build scripts
   - README with GIFs/screenshots
   - CHANGELOG.md

4. Final polish:
   - Error boundaries in React
   - Loading states for all async operations
   - Empty states (no git history, binary files, etc.)
   - Keyboard shortcuts
```

**Gemini Prompt:** *"Add comprehensive testing to the extension: Jest unit tests for analytics functions, mock git data for offline development, error boundaries and loading states in React, and vsce packaging configuration. Create a README with usage instructions."*

---

## Recommended Gemini Code Session Strategy

| Session | Focus | Estimated Files |
|---------|-------|----------------|
| 1 | Phase 0 + Phase 1 | 8-12 files |
| 2 | Phase 2 | 6-8 files |
| 3 | Phase 3 | 5-7 files |
| 4 | Phase 4 | 6-8 files |
| 5 | Phase 5 | 5-6 files |
| 6 | Phase 6 | 4-5 files |
| 7 | Phase 7 | 6-10 files |
| 8 | Phase 8 + Phase 9 | 8-12 files |

---

## Key Technical Decisions (Tell Gemini Explicitly)

1. **Git access:** Use Node `child_process.exec/spawn`, not NodeGit (native deps break). Use `git -C <repo> <command>` format.
2. **Webview framework:** React 18 + Vite (faster than webpack for webview dev). TypeScript strict mode.
3. **Styling:** TailwindCSS with CSS variables for VSCode theme adaptation (`var(--vscode-editor-background)`).
4. **Charts:** D3.js for timeline/custom viz, Recharts for simple bar/line charts.
5. **State management:** Zustand in webview (lightweight, no Provider hell).
6. **Diff display:** Monaco Editor (already bundled with VSCode, load from CDN `cdn.jsdelivr.net/npm/monaco-editor@0.45.0` in webview).
7. **No remote APIs:** Everything from `git` CLI on local repo.

---

## Starter Prompt for Gemini Code

Copy-paste this to begin:

> Build a VSCode extension called "Git Wayback Machine" that visualizes file git history. Start with Phase 0 and Phase 1: scaffold the extension with a React webview using Vite, set up TypeScript, and build a git service layer that extracts file commit history, blame data, and diffs via child_process. Define all TypeScript interfaces in src/shared/types.ts. Implement caching. The webview should open via a command and receive mock commit data initially. Use TailwindCSS for styling with a dark theme. Make sure the extension host can send messages to the React app and vice versa. Follow the VSCode webview official guidelines. Do not build UI components yet beyond a basic "Hello Git Wayback" screen.

---

Want me to generate the **actual starter files** (package.json, tsconfig, extension.ts, webview scaffold) so you can paste them directly into a repo and then hand off to Gemini for the implementation phases?