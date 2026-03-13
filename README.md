# 🍅 Foco — Pomodoro Timer

> An elegant, responsive, dependency-free Pomodoro Timer.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Design Decisions](#design-decisions)
- [Customization](#customization)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## About

**Foco** is a Pomodoro Timer built with plain HTML, CSS and JavaScript — no frameworks, no third-party dependencies. The goal was to create a productivity app with a refined user experience, a distinctive visual identity and code organized into cohesive modules.

The Pomodoro Technique splits work into focused blocks alternated with short breaks, improving concentration and reducing mental fatigue.

---

## Features

### Timer
- Three modes: **Focus**, **Short Break** and **Long Break**
- Animated SVG ring showing real-time progress
- Session indicator dots within the current cycle
- Browser tab title updated with remaining time

### Automation
- **Auto-start breaks** — automatically starts the break when focus ends
- **Auto-start focus** — automatically starts the session when a break ends
- Configurable cycles (2 to 8 sessions per cycle)

### Tasks
- Add, select, complete and delete tasks
- Active task highlighted with the current mode accent color
- Per-task 🍅 counter (how many pomodoros were spent on it)
- Second click on the active task marks it as done

### Statistics
- Pomodoros completed today
- Total focus time for the day
- Accumulated pomodoro streak

### History
- Full log of all completed sessions
- Grouped by date, in reverse chronological order
- Displays time and duration of each session
- Persists across visits via `localStorage`

### Sound
- Sound effects generated via the **Web Audio API** (no external files)
- Ascending chord played at the end of each focus session
- Two soft tones played at the end of each break
- Toggle button with visual feedback

### Notifications
- Native browser notifications (requires permission)
- Enabled/disabled in Settings

### Settings
- Focus duration (1–90 min, default: 25)
- Short Break duration (1–30 min, default: 5)
- Long Break duration (1–60 min, default: 15)
- Sessions per cycle (2–8, default: 4)
- Auto-start breaks (toggle)
- Auto-start focus (toggle)
- Notifications (toggle)

### UX & Accessibility
- **Wake Lock API** — prevents the screen from sleeping while the timer is running
- Fully responsive for mobile, tablet and desktop
- Large, legible display font for the timer
- Pulse animation on the ring during active sessions
- Toast feedback for all important actions
- Distinct accent colors per mode (yellow / green / blue)

---

## Demo

Open `index.html` directly in your browser. No server required.

```bash
# With Python (optional)
python3 -m http.server 8080
# Open: http://localhost:8080
```

---

## Getting Started

1. **Download** or clone the repository
2. Open `index.html` in your browser
3. Click **▶** or press `Space` to start
4. Add tasks in the bottom panel to track your focus
5. Adjust durations and behaviour in ⚙️ **Settings**

---

## Keyboard Shortcuts

| Key      | Action                          |
|----------|---------------------------------|
| `Space`  | Play / Pause                    |
| `R`      | Reset the timer                 |
| `S`      | Skip to the next session        |
| `1`      | Switch to Focus mode            |
| `2`      | Switch to Short Break           |
| `3`      | Switch to Long Break            |

> Shortcuts are disabled when a text input is focused.

---

## Architecture

The project uses a **flat modular architecture** — each JavaScript file has a single, well-defined responsibility. Global state is shared via `window`-scoped variables (instead of ES6 modules) to keep full compatibility with direct `file://` loading, requiring no server or bundler.

### Data flow

```
User interaction
       │
       ▼
timer.js / tasks.js / settings.js   ← business logic
       │
       ▼
    state.js                        ← global state mutated
       │
       ▼
      ui.js                         ← renders the DOM
       │
       ▼
  index.html                        ← updated elements
```

### Script loading order

The order of `<script>` tags in `index.html` is intentional and ensures each module finds its dependencies already loaded:

```
state.js      ← 1st — global variables and constants
timer.js      ← 2nd — uses getDuration, renderTimer, renderRing
tasks.js      ← 3rd — uses savePersisted, renderTasks, showToast
sound.js      ← 4th — uses showToast
ui.js         ← 5th — uses ACCENTS, settings, state, tasks
settings.js   ← 6th — uses renderDots, renderTimer, renderRing, getDuration
modals.js     ← 7th — uses renderSettingsUI, escHtml, history
app.js        ← 8th — entry point; calls init()
```

---

## File Structure

```
foco/
├── index.html               ← Full HTML markup + script/style imports
│
├── css/
│   ├── base.css             ← Custom properties, reset, root layout
│   ├── components.css       ← Timer, buttons, tabs, tasks, stats, toast
│   ├── modals.css           ← Settings and history modals
│   └── responsive.css       ← Media queries (mobile / tablet / desktop)
│
├── js/
│   ├── state.js             ← Global state, constants, localStorage
│   ├── timer.js             ← Timer logic and session cycles
│   ├── tasks.js             ← Task CRUD
│   ├── sound.js             ← Web Audio API and sound control
│   ├── ui.js                ← All DOM rendering functions
│   ├── settings.js          ← Settings controls and native notifications
│   ├── modals.js            ← Modal control and history rendering
│   └── app.js               ← App initialization and keyboard shortcuts
│
├── README.pt-BR.md          ← Portuguese version
└── README.md                ← This file
```

### File responsibilities

#### `css/base.css`
Defines all **CSS custom properties** (design tokens: colours, typography, spacing), the global reset and the base layout structure (topbar + main container). Imported first; it is the foundation for all other styles.

#### `css/components.css`
Contains styles for all **visual components**: SVG ring, control buttons, mode tabs, stat cards, task panel and toast. Also includes all keyframe animations (`ring-pulse`, `shimmer`, `flash-anim`).

#### `css/modals.css`
Styles exclusive to **bottom sheets**: blurred overlay, slide-in animation, numeric inputs, toggles and the history list.

#### `css/responsive.css`
Consolidates all **media queries**. Adjusts ring size, typography, spacing and component visibility based on viewport width and height.

#### `js/state.js`
The **single source of truth**. Declares `settings`, `state`, `tasks`, `history` and `activeTaskId`. Contains persistence helpers (`loadPersisted`, `savePersisted`, `checkDate`) and the `getDuration` utility. Contains no business logic.

#### `js/timer.js`
Manages the **timer lifecycle**: start, pause, stop, reset, skip, tick and session completion. Decides which mode comes next and triggers sound, notification and stats update at the end of each session. Also controls the Wake Lock.

#### `js/tasks.js`
Full task CRUD: add, select/complete (toggle), delete. Controls input visibility and the active task. Contains the `escHtml` utility to prevent XSS.

#### `js/sound.js`
Encapsulates the **Web Audio API**: lazy `AudioContext` initialisation, the `playTone` primitive and named sound compositions (`complete`, `break_end`). Manages the `soundEnabled` state and the sound button icon.

#### `js/ui.js`
Responsible for **all DOM writes**. Functions: `renderAll`, `updateAccent`, `renderTabs`, `renderTimer`, `updateTitle`, `renderRing`, `renderDots`, `renderStats`, `renderTasks`, `setPlayIcon` and `showToast`. Never decides — only receives state and updates the screen.

#### `js/settings.js`
Manages **settings controls**: increment/decrement of numeric values within defined limits, boolean toggles, modal UI synchronisation and integration with the browser Notifications API.

#### `js/modals.js`
Controls opening, closing and dynamic rendering of both modals (settings and history). Groups history sessions by date and displays them in reverse chronological order.

#### `js/app.js`
The application **entry point**. Calls `init()` (which runs `loadPersisted` → `checkDate` → `renderAll`), registers keyboard listeners and the `visibilitychange` listener for tab title updates.

---

## Design Decisions

**Why no ES6 modules (`import`/`export`)?**
So that `index.html` can be opened directly via `file://` in any browser without a server or bundler. ES6 modules require an HTTP server.

**Why does `state.js` contain no business logic?**
So that any module can read and write state without creating circular dependencies. Logic lives in domain modules (`timer`, `tasks`, `settings`); state is just data.

**Why is `ui.js` separate from `timer.js`?**
It separates *what to do* (timer) from *how to show it* (ui). If the project migrates to a framework in the future, `timer.js` can be reused without changes.

**Why Web Audio API instead of `.mp3` files?**
Eliminates external asset dependencies, works offline and allows precise frequency and volume control programmatically.

---

## Customization

### Change default durations
In `js/state.js`, edit the `settings` object:

```js
let settings = {
  workMins:        25,   // focus minutes
  shortMins:        5,   // short break
  longMins:        15,   // long break
  sessionsPerCycle: 4    // sessions before a long break
};
```

### Change accent colours
In `css/base.css`, edit the custom properties:

```css
:root {
  --accent-work:  #e8c547;   /* yellow — focus mode  */
  --accent-short: #5ce8a4;   /* green  — short break */
  --accent-long:  #5cb8e8;   /* blue   — long break  */
}
```

### Change the font
Replace the Google Fonts link in the `<head>` of `index.html` and update the `--font-display` and `--font-mono` variables in `css/base.css`.

---

## Browser Compatibility

| Feature              | Minimum browser                    |
|----------------------|------------------------------------|
| CSS custom props     | Chrome 49 / Firefox 31 / Safari 9  |
| Web Audio API        | Chrome 35 / Firefox 25 / Safari 8  |
| Wake Lock API        | Chrome 84 / Edge 84 *(optional)*   |
| Notifications API    | Chrome 22 / Firefox 22 *(optional)*|
| `100dvh`             | Chrome 108 / Safari 15.4           |

> The app works normally without Wake Lock and Notifications — both features degrade gracefully.

---

## License

MIT — free to use, modify and distribute.