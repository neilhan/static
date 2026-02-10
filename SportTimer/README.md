# SportTimer

A modern interval timer app for creating and running sequential timer programs. Perfect for workouts, HIIT training, Tabata, cooking, or any activity requiring multiple timed segments.

## ✨ Features

### Program Management
- 📝 **Create Programs** - Build custom timer sequences with multiple segments
- ✏️ **Edit Programs** - Modify existing programs anytime
- 🗑️ **Delete Programs** - Remove programs you no longer need
- 💾 **Auto-Save** - All programs are automatically saved to local storage
- 🔄 **Cycles** - Repeat programs multiple times or infinitely

### Timer Segments
- 🎨 **Color-Coded** - Each segment gets a unique color for easy identification
- ⏱️ **Flexible Duration** - Set minutes and seconds for each segment
- 📝 **Named Segments** - Label each interval (Warm Up, Sprint, Rest, etc.)
- 🔄 **Reorderable** - Drag segments up/down to rearrange

### Timer Runner
- 🎯 **Visual Feedback** - Background color changes for each segment
- 📊 **Progress Tracking** - See progress within segment and overall
- 👀 **Next Up Preview** - Know what's coming next
- ⏯️ **Playback Controls** - Play, pause, reset, and skip
- 🔊 **Audio Alerts** - Sound notification when segments change
- 🎉 **Completion Screen** - Celebratory finish screen

### Technical Features
- ⚡️ **Vite** - Lightning fast development and builds
- ⚛️ **React 18** - Latest React with hooks and concurrent features
- 🔷 **TypeScript** - Full type safety
- 🎨 **Modern CSS** - Clean, responsive design
- 📱 **Mobile-Optimized** - Touch-friendly, adaptive layouts
- 🪝 **Custom Hooks** - Reusable timer and storage logic
- 🎯 **Functional Programming** - Pure functions and immutable state

### Mobile Features
- 📱 **Responsive Design** - Adapts to all screen sizes
- 👆 **Touch-Optimized** - Large touch targets (44px minimum)
- 🔄 **Orientation Support** - Works in portrait and landscape
- 🎯 **Safe Areas** - Respects notches and device curves
- ⚡ **Performance** - Smooth animations and transitions
- 🚫 **No Zoom** - Prevents accidental zooming on input
- 📍 **Sticky Controls** - Keep important buttons accessible
- 📐 **Dynamic Viewport** - Adapts to browser chrome hiding

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

The app will open at [http://localhost:3000](http://localhost:3000)

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

### Lint

Run ESLint to check code quality:

```bash
npm run lint
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

- **React 18.3.1** - UI library
- **TypeScript 5.6** - Programming language
- **Vite 5.4** - Build tool and dev server
- **ESLint** - Linting

## License

MIT

