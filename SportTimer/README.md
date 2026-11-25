# SportTimer

A modern interval timer app for creating and running sequential timer programs. Perfect for workouts, HIIT training, Tabata, cooking, or any activity requiring multiple timed segments.

## ✨ Features

### Program Management
- 📝 **Create & Edit Programs** - Build custom timer sequences with multiple segments and edit anytime
- 🗑️ **Delete Programs** - Remove programs you no longer need
- 💾 **Auto-Save** - All programs and trackers are automatically saved to `localStorage`
- 🔄 **Rounds / Cycles** - Repeat programs `1×`, `3×`, `5×`, custom counts, or infinitely (`∞`)
- 📋 **Counter Trackers** - Create and run custom multi-item counter trackers alongside interval timers

### Timer Segments
- 🎨 **Color-Coded** - Each segment gets a distinct color for easy identification
- ⏱️ **Flexible Duration** - Set minutes and seconds for each segment (with inline editing)
- 📝 **Named Segments** - Label each interval (`Warm Up`, `Sprint`, `Rest`, etc.)
- ↕️ **Reorderable** - Move segments up/down to rearrange

### Timer Runner & Audio
- 🎯 **Visual Feedback** - Background color changes for each segment
- 📊 **Progress Tracking** - See progress within the current segment, round, and overall program
- 👀 **Next Up Preview** - Know what's coming next
- ⏯️ **Playback Controls** - Play, pause, reset, and skip
- ⏱️ **Drift-Free Countdown** - Wall-clock (`Date.now()`) timing with `visibilitychange` catch-up when returning to the tab
- 🔊 **Audio Alerts** - Web Audio beep when segments start/change (toggleable via Sound Alert)
- 🗣️ **Voice Announcements** - Speaks section names when each segment starts, plus optional remaining-time announcements (`Off`, `10s`, `15s`, `30s`, `60s`, or custom seconds)
- 🎵 **Background Media Friendly (iPhone / iOS 16.4+)** - Uses `navigator.audioSession.type = 'ambient'` so timer beeps mix with other playing media (Spotify, Apple Music, Podcasts) instead of pausing it
- 🔒 **Screen-Off & Audio Trade-off (iPhone / iOS WebKit Limitation)** - In a web app/PWA on iOS, background media mixing (`ambient`) and screen-off audio (`playback` + silent `<audio>` keep-alive) are mutually exclusive because WebKit does not expose `mixWithOthers` for `playback` sessions. Currently configured for **other media playback** (with Screen Wake Lock while open and `Date.now()` catch-up on unlock); running audio/announcements while the screen is off *and* keeping other media playing requires a native iOS app.
- 🔆 **Screen Wake Lock** - Keeps the screen awake while the timer is active
- 🎉 **Completion Screen** - Celebratory finish screen

### Technical Features
- ⚡️ **Vite 7** - Fast development and builds
- ⚛️ **React 19** - React with hooks
- 🔷 **TypeScript 5.9** - Full type safety
- 🧪 **Vitest 4** - Unit tests for timer state, catch-up, and announcements
- 🎨 **Modern CSS** - Clean, responsive design
- 🪝 **Custom Hooks** - Reusable timer, wake-lock, and storage logic

### Mobile Features
- 📱 **Responsive Design** - Adapts to all screen sizes
- 👆 **Touch-Optimized** - Large touch targets and iPhone-friendly editor modals (`100dvh` flex layout with pinned header and `Done` footer)
- 🔄 **Orientation Support** - Works in portrait and landscape
- 🎯 **Safe Areas** - Respects notches, home indicator, and device curves
- 🚫 **No Zoom** - Prevents accidental zooming on inputs (`16px` font size)
- 📐 **Dynamic Viewport** - Adapts to mobile browser chrome (`dvh`)

## Getting Started

### Prerequisites

- Node.js (v25 or higher recommended)
- npm, yarn, or pnpm

### Installation

Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at [http://localhost:3004](http://localhost:3004)

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Test

Run unit tests:

```bash
npm test
```

## 🎮 How to Use

1. **Create a Program**
   - Click "Create New Program"
   - Give it a name (e.g., "HIIT Workout")
   - Add segments with names and durations
   - Reorder segments as needed
   - Save the program

2. **Run a Timer**
   - Click "Start Program" on any saved program
   - Press play to begin
   - Use pause/resume during the workout
   - Skip segments if needed
   - Reset to start over

3. **Edit/Delete**
   - Use the edit (✏️) button to modify a program
   - Use the delete (🗑️) button to remove a program

## 📁 Project Structure

```
SportTimer/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── ProgramList.tsx    # Program list view
│   │   ├── ProgramList.css
│   │   ├── TimerEditor.tsx    # Create/edit programs
│   │   ├── TimerEditor.css
│   │   ├── TimerRunner.tsx    # Timer execution view
│   │   └── TimerRunner.css
│   ├── hooks/
│   │   ├── useLocalStorage.ts # Local storage hook
│   │   └── useTimer.ts        # Timer logic hook
│   ├── utils/
│   │   └── helpers.ts         # Helper functions
│   ├── types.ts               # TypeScript interfaces
│   ├── App.tsx                # Main app component
│   ├── App.css
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.cjs
```

## 🏗️ Architecture

The app follows functional programming principles:

- **Pure Components** - All React components are pure functions
- **Custom Hooks** - Encapsulated logic for timer and storage
- **Immutable State** - State updates create new objects
- **Functional Utilities** - Helper functions are pure and composable
- **Type Safety** - Full TypeScript coverage

## Tech Stack

- **React 19** - UI library
- **TypeScript 5.9** - Programming language
- **Vite 7** - Build tool and dev server
- **Vitest 4** - Unit testing

## License

MIT

