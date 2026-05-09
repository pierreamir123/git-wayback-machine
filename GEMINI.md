# Git Wayback Machine - Project Instructions

This document provides context and instructions for AI agents working on the **Git Wayback Machine** VSCode extension.

## Project Overview

**Git Wayback Machine** is a VSCode extension designed to visualize and replay git history like a time machine. It provides an interactive timeline and a code viewer that allows users to see how a file evolved over time, complete with animations and insights.

### Main Technologies
- **VSCode Extension API**: Powers the sidebar integration, commands, and webview management.
- **React (v18)**: Used for building the interactive webview UI.
- **Vite**: The build tool and development server for the React webview.
- **TailwindCSS**: Provides styling for the webview components.
- **TypeScript**: Used throughout the project (extension host and webview) for type safety.
- **Webpack**: Used to bundle the extension host code.
- **Git CLI**: Used via `child_process` to extract history, blame, and diff data.

### Architecture
- **Extension Host (`src/`)**: 
    - `extension.ts`: Entry point for the extension.
    - `providers/`: Contains `WaybackPanelProvider` (manages the webview) and `HistoryTreeViewProvider` (manages the sidebar tree view).
    - `git/`: Services for interacting with the Git CLI (`HistoryService`, `BlameService`, `DiffService`).
    - `analytics/`: `InsightsEngine` for analyzing git data and generating "Story Mode".
    - `shared/`: TypeScript interfaces shared between the extension host and webview.
- **Webview (`webview/`)**: 
    - `src/App.tsx`: Main React application.
    - `src/components/Timeline/`: Components for the vertical commit timeline.
    - `src/components/Replay/`: Components for file viewing and playback controls.
    - `src/components/Insights/`: Components for displaying file stability and observations.

## Building and Running

### Key Commands
- **Install Dependencies**: `npm install && cd webview && npm install`
- **Full Build**: `npm run build` (Builds both webview and extension host)
- **Watch Extension Host**: `npm run watch`
- **Dev Webview**: `npm run webview:dev` (Starts Vite dev server)
- **Package**: `npm run package`

### Launching in VSCode
1. Open the project in VSCode.
2. Press **F5** to start a new "Extension Development Host" window.
3. In the new window, open a file with git history and run the command `Git Wayback: Open Timeline` from the Command Palette.

## Development Conventions

### Coding Style
- **Strict TypeScript**: Adhere to strict type checking. Always define interfaces in `src/shared/types.ts` for data passed between host and webview.
- **Component Architecture**: Use functional React components with hooks.
- **Styling**: Prefer TailwindCSS utility classes for all webview styling. Use VSCode CSS variables (e.g., `var(--vscode-editor-background)`) to ensure theme compatibility.
- **Git Interaction**: Always use the provided services in `src/git/` rather than executing raw shell commands.

### Communication
- The extension host and webview communicate via `postMessage`.
- Webview sends a `ready` message upon loading.
- Host sends `setData` with initial history/blame and `setFileContent` when a commit is selected.

### Performance
- Be mindful of large repositories. The `HistoryService` uses `--follow` to track file renames.
- Replay animations should be smooth and non-blocking.
