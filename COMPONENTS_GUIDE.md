# Git Wayback Machine — Components Guide

This document outlines all the newly created frontend components for the Git Wayback Machine VS Code extension.

## Overview

6 production-grade components have been built with distinctive aesthetic directions:

---

## 1. **CommitExplorerCard** — Editorial/Refined Minimalism
📍 Location: `webview/src/components/CommitExplorerCard/CommitExplorerCard.tsx`

**Design Philosophy**: Luxury minimalism with editorial typography and careful spatial hierarchy

**Features**:
- Author avatar with initials and dynamic color (based on author hash)
- Full commit metadata (hash, timestamp, author)
- Expandable commit body with smooth animations
- Metadata grid showing complete commit information
- Author-color accent bar at top
- Glassmorphic design with gradient backgrounds

**Usage**:
```tsx
<CommitExplorerCard
  commit={commit}
  currentIndex={currentIndex}
  totalCommits={totalCommits}
/>
```

---

## 2. **TimelineScrubber** — Premium Media Player
📍 Location: `webview/src/components/TimelineScrubber/TimelineScrubber.tsx`

**Design Philosophy**: Refined, subtle playback control with high-end media player feel

**Features**:
- Draggable playhead with smooth interactions
- Color-coded commit dots (one per author)
- Progress percentage display
- Click-to-seek timeline
- "Now Playing" card with current commit
- Visual progress bar
- Hover states with smooth animations

**Usage**:
```tsx
<TimelineScrubber
  commits={history.commits}
  currentIndex={currentCommitIndex}
  onSelectCommit={handleSelectCommitByIndex}
/>
```

---

## 3. **FileExplorer** — Brutalist/Raw
📍 Location: `webview/src/components/FileExplorer/FileExplorer.tsx`

**Design Philosophy**: Stark, high-contrast with monospace typography and bare-bones aesthetics

**Features**:
- Collapsible directory tree structure
- Color-coded status badges (Added, Modified, Deleted, Renamed)
- Line count indicators (+/-) for each file
- Summary statistics footer
- Monospace typography for code authenticity
- Hover states with author-color accent

**Usage**:
```tsx
<FileExplorer
  files={fileChanges}
  currentAuthor={authorName}
/>
```

---

## 4. **DiffViewer** — Maximalist/Detailed
📍 Location: `webview/src/components/DiffViewer/DiffViewer.tsx`

**Design Philosophy**: Rich, detailed visualization with extensive controls and annotations

**Features**:
- Split view and unified view modes
- Syntax highlighting for code
- Line numbers and status indicators
- Add/remove line highlighting
- Statistics display (+/- lines)
- Context toggle for detailed comparison
- Color-coded file sections

**Usage**:
```tsx
<DiffViewer
  oldCode={oldCode}
  newCode={newCode}
  fileName="example.ts"
  language="typescript"
/>
```

---

## 5. **ContributorGraph** — Organic/Data-Viz
📍 Location: `webview/src/components/ContributorGraph/ContributorGraph.tsx`

**Design Philosophy**: Organic data visualization with flowing layouts and natural patterns

**Features**:
- Contributor ranking bars with animated widths
- Activity heatmap showing commits over time
- Author color coding and styling
- Last commit timestamp for each contributor
- Summary statistics (total, contributors, weeks)
- Hover tooltips on heatmap cells
- Smooth animated bars

**Usage**:
```tsx
<ContributorGraph commits={commits} />
```

---

## 6. **SearchFilter** — Art Deco/Geometric
📍 Location: `webview/src/components/SearchFilter/SearchFilter.tsx`

**Design Philosophy**: Sharp geometric design with art deco influences and retro-futuristic feel

**Features**:
- Text search (commit message, hash)
- Author filter pills with color coding
- Date range picker (from/to)
- Live results preview (top 20)
- Result counter
- Clear filters button
- Geometric corner accents

**Usage**:
```tsx
<SearchFilter
  commits={commits}
  onSelectCommit={handleSelect}
/>
```

---

## 7. **SettingsPanel** — Minimalist Luxury
📍 Location: `webview/src/components/SettingsPanel/SettingsPanel.tsx`

**Design Philosophy**: Refined minimalism with elegant spacing and careful typography

**Features**:
- Organized settings sections (Playback, Display, Diff Viewer)
- Toggle switches for boolean settings
- Dropdown selects for enum options
- Number input with min/max bounds
- Descriptive labels and help text
- Automatic saving notification
- Minimal visual weight

**Usage**:
```tsx
<SettingsPanel onSettingChange={handleChange} />
```

---

## 8. **Onboarding** — Playful/Toy-like
📍 Location: `webview/src/components/Onboarding/Onboarding.tsx`

**Design Philosophy**: Friendly, approachable with playful interactions and warm aesthetics

**Features**:
- Multi-step tutorial (5 steps)
- Progress indicator bar
- Animated icon bounces
- Gradient backgrounds and decorative corners
- Previous/Next navigation
- Skip option
- Colorful, welcoming design

**Usage**:
```tsx
<Onboarding isFirstTime={true} onDismiss={handleDismiss} />
```

---

## Integration Into App

### Basic Integration Example

Add imports to your `App.tsx`:

```tsx
import CommitExplorerCard from './components/CommitExplorerCard/CommitExplorerCard'
import TimelineScrubber from './components/TimelineScrubber/TimelineScrubber'
import FileExplorer from './components/FileExplorer/FileExplorer'
import DiffViewer from './components/DiffViewer/DiffViewer'
import ContributorGraph from './components/ContributorGraph/ContributorGraph'
import SearchFilter from './components/SearchFilter/SearchFilter'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'
import Onboarding from './components/Onboarding/Onboarding'
```

Then use them contextually in your layout:

```tsx
{/* Show onboarding on first run */}
{isFirstTime && <Onboarding onDismiss={() => setIsFirstTime(false)} />}

{/* Main content area */}
<CommitExplorerCard ... />
<TimelineScrubber ... />

{/* Sidebar for additional data */}
<ContributorGraph ... />
<SearchFilter ... />

{/* Modals/Panels */}
{showDiff && <DiffViewer ... />}
{showSettings && <SettingsPanel ... />}
```

---

## Design System Reference

### Typography
- **Display Font**: `font-display` — Crimson Text (elegant, editorial)
- **Body Font**: `font-body` — Source Sans Pro (clean, readable)

### Colors
- **Author Colors**: Dynamic per author (10-color palette from `utils/colors.ts`)
- **Status Colors**:
  - Added: `#10b981` (green)
  - Modified: `#f59e0b` (amber)
  - Deleted: `#ef4444` (red)
  - Renamed: `#8b5cf6` (purple)

### Animations
- `animate-fade-in` — 0.5s fade from transparent
- `animate-slide-up` — 0.4s slide up with fade
- `animate-pulse-glow` — 2s glow pulse effect

### Glassmorphic Components
- `.glass-card` — Base glassmorphic style
- `.glass-card-hover` — Interactive variant

---

## Customization Tips

1. **Adjust color intensity**: Modify the opacity values in gradient backgrounds
2. **Change animation speed**: Update keyframes in `tailwind.config.js`
3. **Customize fonts**: Import different Google Fonts in `src/index.css`
4. **Tweak spacing**: Use Tailwind's spacing utilities (`px`, `py`, `gap`, etc.)
5. **Update status colors**: Modify `statusColors` object in FileExplorer

---

## Browser Support

All components use modern CSS features:
- CSS Grid & Flexbox
- CSS Variables
- Backdrop filters (blur)
- CSS Animations
- Modern color functions

**Recommended**: VS Code 1.85.0 or later (all Chromium-based)

---

## Performance Notes

- All components use React.memo where appropriate
- Animations use CSS-only (no JavaScript animation libraries)
- Lazy rendering for large lists (FileExplorer, SearchFilter)
- Optimized re-renders with useMemo/useCallback

---

## Next Steps

1. **Integrate into App**: Choose which components fit your UI layout
2. **Pass real data**: Connect commit data from VS Code extension
3. **Add interactivity**: Wire up event handlers to state management
4. **Test on device**: Verify rendering in VS Code webview environment
5. **Customize colors**: Adjust author color palette if needed

---

Built with intentionality. Each component has a distinct aesthetic voice while maintaining cohesion with the overall Git Wayback Machine design system.
