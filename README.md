<p align="center">
  <img src="resources/logo.svg" width="200" height="200" alt="Git Wayback Machine Logo" />
</p>

# Git Wayback Machine 🧭

> **Stop wondering "Why is this code like this?" and start *seeing* it.**

Git Wayback Machine is a powerful VS Code extension that transforms your dry Git history into a rich, interactive narrative. Visualize file evolution, understand ownership patterns, and replay changes like a cinematic time machine.

## ✨ Key Features

### Core Functionality
- **🎞️ Interactive History Replay**: Step through your code's evolution commit-by-commit. Watch the file build itself with line-by-line typing animations and high-contrast change highlighting.
- **🕒 Vertical Timeline**: A beautiful, interactive sidebar listing all commits for the active file. Filter by author and jump to any point in time instantly.
- **📊 Insights Engine**: Automatically calculates a **Stability Score** (0-100%) for your file based on churn and contributor diversity.
- **📖 Story Mode**: Generates a human-readable "biography" of your file, detailing its birth, major transformations, and current state.
- **🔥 Heatmap & Blame**: Integrated author attribution with color-coded "age" indicators. See at a glance which parts of your code are stable and which are "hot" with recent changes.
- **📂 Sidebar Integration**: Deep integration with the VS Code Activity Bar. Access your file history directly from a dedicated sidebar panel.

### UI Components (v0.0.1)

**8 Production-Grade Components** with distinctive aesthetic designs:

1. **CommitExplorerCard** — Editorial/Refined Minimalism
   - Detailed commit information with author avatars
   - Metadata grid (hash, timestamp, author)
   - Expandable commit body with smooth animations

2. **TimelineScrubber** — Premium Media Player
   - Draggable playhead with smooth interactions
   - Color-coded commit dots by author
   - Progress indicator and "Now Playing" card
   - Click-to-seek navigation

3. **FileExplorer** — Brutalist/Raw Design
   - Collapsible directory tree structure
   - Status badges (Added, Modified, Deleted, Renamed)
   - Line count indicators (+/-)
   - Summary statistics

4. **DiffViewer** — Maximalist/Detailed
   - Split view and unified view modes
   - Syntax highlighting for code
   - Line numbers and status indicators
   - Context line toggle

5. **ContributorGraph** — Organic/Data-Visualization
   - Contributor ranking with animated bars
   - Activity heatmap (commits over time)
   - Summary statistics
   - Interactive hover states

6. **SearchFilter** — Art Deco/Geometric
   - Advanced commit search (message, hash, author)
   - Author filter pills with color coding
   - Date range picker
   - Live results preview

7. **SettingsPanel** — Minimalist Luxury
   - Organized settings sections
   - Toggle switches, dropdowns, number inputs
   - Auto-saving functionality
   - Customizable playback and display options

8. **Onboarding** — Playful/Toy-like
   - Multi-step tutorial (5 steps)
   - Animated icons and progress indicators
   - Skip option for experienced users

## 🎨 Design System

### Typography
- **Display Font**: Crimson Text (elegant, editorial)
- **Body Font**: Source Sans Pro (clean, readable)

### Color System
- **Author Colors**: Dynamic 10-color palette, consistently hashed per author
- **Status Colors**: 
  - Added: Green (#10b981)
  - Modified: Amber (#f59e0b)
  - Deleted: Red (#ef4444)
  - Renamed: Purple (#8b5cf6)

### Animations
- `animate-fade-in` — Smooth opacity transitions
- `animate-slide-up` — Entrance animations
- `animate-pulse-glow` — Attention effects
- CSS-only for optimal performance

### Layout
- **Optimized Code Viewing**: 70% width main area
- **Left Sidebar**: 264px for Timeline/Search
- **Right Panel**: 384px for Details & Controls
- **Responsive**: Adapts to editor width

## 🚀 Getting Started

### Installation

1. **From VS Code Marketplace** (coming soon):
   - Search "Git Wayback Machine"
   - Click Install

2. **From VSIX File**:
   - Download `git-wayback-machine-0.0.1.vsix`
   - Run: `code --install-extension git-wayback-machine-0.0.1.vsix`
   - Or upload in VS Code Extensions tab

3. **From Source**:
   - Clone this repository
   - Follow [Development Setup](#-development-setup)

### Usage

1. Open any file within a Git repository in VS Code
2. Click the **Git Wayback** icon in the Activity Bar
3. Select a commit from the sidebar to view its state
4. Use the **Timeline Scrubber** to navigate
5. Toggle between **File Content** and **Diff View**
6. Explore **Contributors**, **Insights**, and **File Changes** in the right panel
7. Use **Play/Pause** buttons to replay history

## 🎮 Keyboard Shortcuts & Controls

- **Timeline**: Click commits to jump to any point
- **Scrubber**: Drag playhead or click to seek
- **Play/Pause**: Watch changes unfold in real-time
- **Speed Controls**: 0.5x, 1x, 2x, 4x playback
- **Settings**: ⚙️ button for customization

## 🔧 Development Setup

### Prerequisites
- Node.js 16+
- VS Code 1.85.0+
- Git

### Installation & Build

```bash
# Clone repository
git clone https://github.com/pierreamir123/git-wayback-machine.git
cd git-wayback-machine

# Install dependencies
npm install
cd webview && npm install && cd ..

# Build for development
npm run webview:dev    # Webview dev server
npm run build          # Full build with extension

# Build VSIX for distribution
npm run vsix
```

### Development Workflow

```bash
# Watch mode (recommended)
npm run watch          # Watches extension code
# In another terminal:
cd webview && npm run dev  # Watches webview code

# Launch extension in VS Code
# Press F5 in VS Code to open "Extension Development Host"
```

### Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run build` | Full production build |
| `npm run webview:dev` | Start webview dev server |
| `npm run webview:build` | Build webview for production |
| `npm run vsix` | Package extension as VSIX |
| `npm run watch` | Watch extension code |
| `npm run lint` | Lint TypeScript code |

## 📁 Project Structure

```
git-wayback-machine/
├── src/                          # Extension code (TypeScript)
│   ├── extension.ts             # Entry point
│   ├── git/                     # Git integration layer
│   ├── providers/               # VS Code providers
│   └── analytics/               # Insights engine
├── webview/                      # React UI (Vite)
│   ├── src/
│   │   ├── App.tsx              # Main component
│   │   ├── components/          # 8 new UI components
│   │   │   ├── CommitExplorerCard/
│   │   │   ├── TimelineScrubber/
│   │   │   ├── FileExplorer/
│   │   │   ├── DiffViewer/
│   │   │   ├── ContributorGraph/
│   │   │   ├── SearchFilter/
│   │   │   ├── SettingsPanel/
│   │   │   └── Onboarding/
│   │   ├── utils/               # Helper functions
│   │   └── index.css            # Global styles
│   └── tailwind.config.js        # Tailwind configuration
├── resources/                    # Extension assets
│   └── logo.svg                 # Activity bar icon
├── COMPONENTS_GUIDE.md          # Component documentation
├── package.json                 # Extension manifest
├── Makefile                     # Development tasks
└── README.md                    # This file
```

## 🛠 Tech Stack

### Extension Layer
- **Language**: TypeScript 5.3+
- **Bundler**: Webpack 5
- **Runner**: VS Code API
- **Git Integration**: Native `child_process`

### Webview UI
- **Framework**: React 18.2
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3.4
- **Fonts**: Google Fonts (Crimson Text, Source Sans Pro)
- **Animations**: CSS-only (no JS libraries)

### Quality
- **Linting**: ESLint 8
- **Type Safety**: TypeScript strict mode
- **No External Design Libraries**: Custom aesthetic

## 📊 Component Statistics

- **Total Components**: 8
- **Lines of UI Code**: ~2,000
- **Animations**: 10+
- **CSS Custom Properties**: 4
- **Tailwind Classes**: 200+

## 🚢 Versioning

- **Current Version**: 0.0.1
- **Release**: v0.0.1 (May 2026)
- **VSIX Package**: 1.3 MB
- **Status**: Beta

## 🤝 Contributing

To contribute to Git Wayback Machine:

1. Create a feature branch
2. Make your changes
3. Test in Extension Development Host
4. Submit a pull request

See [CLAUDE.md](.claude/CLAUDE.md) for development guidelines.

## 📝 License

See [LICENSE.txt](LICENSE.txt) for details.

---

**Built for developers who want to understand the *journey* of their code, not just its destination.**

### Quick Links
- [Component Guide](COMPONENTS_GUIDE.md) — Detailed component documentation
- [GitHub Repository](https://github.com/pierreamir123/git-wayback-machine)
- [Issue Tracker](https://github.com/pierreamir123/git-wayback-machine/issues)

Made with ❤️ by [Pierre Bassily](https://github.com/pierreamir123)
