# 🍅 Foco — Pomodoro Timer

> An elegant, responsive Pomodoro Timer with light/dark theme support and zero external dependencies.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Theme System](#theme-system)
- [Design Decisions](#design-decisions)
- [Customization](#customization)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

---

## About

**Foco** is a Pomodoro Timer built with plain HTML, CSS and JavaScript — no frameworks, no third-party dependencies. The goal was to create a productivity app with a refined user experience, a distinctive visual identity, full light/dark theme support, and code organized into cohesive modules.

The Pomodoro Technique splits work into focused blocks alternated with short breaks, improving concentration and reducing mental fatigue.

---

## Features

### Timer
- Three modes: **Focus**, **Short Break** and **Long Break**
- Animated SVG ring showing real-time progress
- Session indicator dots within the current cycle
- Browser tab title updated with remaining time

### Light / Dark Theme
- ☀️/🌙 button in the top bar to switch between themes
- `T` keyboard shortcut for quick toggling
- Preference persisted in `localStorage` across sessions
- Smooth CSS transition when switching themes
- Distinct accent palettes per theme: pastels in dark mode, saturated tones in light mode

### Automation
- **Auto-start breaks** — automatically starts the break when focus ends
- **Auto-start focus** — automatically starts the session when a break ends
- Configurable cycles (2 to 8 sessions per cycle)

### Tasks
- Add, select, complete and delete tasks
- Active task highlighted with the current mode's accent color
- Per-task 🍅 counter (how many pomodoros were spent on it)
- Second click on the active task marks it as done

### Statistics
- Pomodoros completed today
- Total focus time for the day
- Accumulated daily streak (resets automatically if broken)

### History
- Full log of all completed sessions
- Grouped by date, in reverse chronological order
- Persists across visits via `localStorage`

### Sound
- Sound effects generated via the **Web Audio API** (no external files)
- Ascending chord at the end of each focus session
- Two soft tones at the end of each break
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
- **Wake Lock API** — prevents the screen from sleeping while the timer runs
- Fully responsive for mobile, tablet and desktop
- Pulse animation on the ring during active sessions
- Toast feedback for all important actions

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
4. Use the ☀️/🌙 button in the top bar to switch themes (or press `T`)
5. Add tasks in the bottom panel to track your focus
6. Adjust durations and behaviour in ⚙️ **Settings**

---

## Keyboard Shortcuts

| Key     | Action                          |
|---------|---------------------------------|
| `Space` | Play / Pause                    |
| `R`     | Reset the timer                 |
| `S`     | Skip to the next session        |
| `T`     | Toggle light / dark theme       |
| `1`     | Switch to Focus mode            |
| `2`     | Switch to Short Break           |
| `3`     | Switch to Long Break            |

> Shortcuts are disabled when a text input is focused.

---

## Architecture

The project uses a **flat modular architecture** — each JavaScript file has a single, well-defined responsibility. Global state is shared via `window`-scoped variables (instead of ES6 modules) to maintain full compatibility with direct `file://` loading, requiring no server or bundler.

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

The order of `<script>` tags in `index.html` is intentional — each module finds its dependencies already loaded:

```
state.js      ← 1st — variables, constants, ACCENT_PALETTES, getAccents()
timer.js      ← 2nd — uses getDuration, renderTimer, renderRing
tasks.js      ← 3rd — uses savePersisted, renderTasks, showToast
sound.js      ← 4th — uses showToast
ui.js         ← 5th — uses getAccents(), applyTheme(), settings, state, tasks
settings.js   ← 6th — uses renderDots, renderTimer, applyTheme, toggleTheme()
modals.js     ← 7th — uses renderSettingsUI, escHtml, history
app.js        ← 8th — entry point; calls init()
```

---

## File Structure

```
foco/
├── index.html               ← HTML markup + imports + theme button (☀️/🌙)
│
├── css/
│   ├── base.css             ← Per-theme tokens (data-theme), reset, layout
│   ├── components.css       ← Timer, buttons, tabs, tasks, stats, toast
│   ├── modals.css           ← Settings and history modals
│   └── responsive.css       ← Media queries (mobile / tablet / desktop)
│
├── js/
│   ├── state.js             ← Global state, ACCENT_PALETTES, getAccents(), localStorage
│   ├── timer.js             ← Timer logic and session cycles
│   ├── tasks.js             ← Task CRUD
│   ├── sound.js             ← Web Audio API and sound control
│   ├── ui.js                ← All rendering + applyTheme() + renderThemeBtn()
│   ├── settings.js          ← Settings controls, notifications and toggleTheme()
│   ├── modals.js            ← Modal control and history rendering
│   └── app.js               ← App init and keyboard shortcuts (incl. T)
│
├── README.pt-BR.md          ← Portuguese version
└── README.md                ← This file
```

---

## Theme System

### How it works

Theme switching is driven by **a single HTML attribute** on the root element:

```html
<html data-theme="dark">   <!-- or "light" -->
```

No extra classes on `<body>`, no separate CSS files per theme. Every component uses only custom properties — no color value is hardcoded outside `base.css`.

### CSS — `base.css`

Two token blocks, one per theme:

```css
:root[data-theme="dark"] {
  --bg:          #0d0d0f;
  --surface:     #161618;
  --text:        #f0ede8;
  --accent-work: #e8c547;  /* soft yellow */
  /* ... */
}

:root[data-theme="light"] {
  --bg:          #f5f2ee;
  --surface:     #ffffff;
  --text:        #1a1814;
  --accent-work: #b8860b;  /* saturated amber */
  /* ... */
}
```

Each theme also defines shadow tokens (`--shadow-sm/md/lg`) and noise overlay opacity (`--noise-opacity`), which behave differently across themes.

### JS — `state.js` and `ui.js`

The SVG ring and play button receive colors injected by JS (`--current-accent`, `--current-glow`). For this reason `state.js` keeps `ACCENT_PALETTES` with both palettes mirroring the CSS, and `getAccents()` returns the right one based on `settings.theme`:

```js
// state.js
const ACCENT_PALETTES = {
  dark:  { work: { acc: '#e8c547', glow: 'rgba(232,197,71,0.18)',  label: 'Focus' }, /* ... */ },
  light: { work: { acc: '#b8860b', glow: 'rgba(184,134,11,0.10)',  label: 'Focus' }, /* ... */ }
};

function getAccents() {
  return ACCENT_PALETTES[settings.theme] || ACCENT_PALETTES.dark;
}
```

```js
// ui.js — updateAccent reads from getAccents(), not a fixed palette
function updateAccent() {
  const { acc, glow } = getAccents()[state.mode];
  document.documentElement.style.setProperty('--current-accent', acc);
  document.documentElement.style.setProperty('--current-glow',   glow);
}
```

### Why are accents different per theme?

In dark mode, pastel accents (`#e8c547`) read well against a black background. In light mode, those same pastels disappear against a white/cream background. The light theme uses more saturated, darker versions of the same hues:

| Mode        | Dark        | Light       |
|-------------|-------------|-------------|
| Focus       | `#e8c547`   | `#b8860b`   |
| Short Break | `#5ce8a4`   | `#1a9e68`   |
| Long Break  | `#5cb8e8`   | `#1a72b8`   |

### Full theme-switch flow

```
Click ☀️/🌙 button  (or press T)
        │
        ▼
  toggleTheme()          — settings.js
  settings.theme = 'light' | 'dark'
        │
        ├─► applyTheme()     — ui.js
        │   └─ setAttribute('data-theme', ...)
        │      └─ CSS reacts: all tokens swap instantly
        │      └─ renderThemeBtn() — updates ☀️/🌙 icon
        │
        ├─► updateAccent()   — ui.js
        │   └─ getAccents()[state.mode] → new JS palette
        │      └─ --current-accent and --current-glow updated
        │
        ├─► savePersisted()  — state.js
        │   └─ settings.theme saved to localStorage
        │
        └─► showToast()      — ui.js
            └─ visual feedback to the user
```

---

## Design Decisions

**Why `data-theme` on `<html>` instead of a class on `<body>`?**
`:root` always points to `<html>`. Using `data-theme` on the root element allows `:root[data-theme="dark"]` selectors without extra specificity, and makes future integration with `@media (prefers-color-scheme)` straightforward.

**Why no ES6 modules (`import`/`export`)?**
So that `index.html` can be opened directly via `file://` in any browser without a server or bundler. ES6 modules require HTTP.

**Why keep `ACCENT_PALETTES` in JS instead of reading CSS variables?**
`getComputedStyle` reads CSS variables but depends on when the browser has finished calculating styles, creating a timing dependency. Keeping the colors mirrored in JS is predictable and testable.

**Why does `state.js` contain no business logic?**
So that any module can read and write state without creating circular dependencies. Logic lives in domain modules (`timer`, `tasks`, `settings`); state is just data.

---

## Customization

### Add a third theme

In `css/base.css`:
```css
:root[data-theme="sepia"] {
  --bg:      #f4efe6;
  --surface: #fffdf9;
  /* ... */
}
```

In `js/state.js`, add the palette to `ACCENT_PALETTES` and update the `_sanitizeSettings` validation to accept the new value.

### Change colors in an existing theme

Edit the tokens in `css/base.css` **and** mirror the same colors in `ACCENT_PALETTES` in `js/state.js`. Both must stay in sync.

### Change the font

Replace the Google Fonts link in the `<head>` of `index.html` and update `--font-display` / `--font-mono` in `css/base.css`.

---

## Browser Compatibility

| Feature               | Minimum browser                     |
|-----------------------|-------------------------------------|
| CSS custom properties | Chrome 49 / Firefox 31 / Safari 9   |
| `data-theme` CSS      | All modern browsers                 |
| Web Audio API         | Chrome 35 / Firefox 25 / Safari 8   |
| Wake Lock API         | Chrome 84 / Edge 84 *(optional)*    |
| Notifications API     | Chrome 22 / Firefox 22 *(optional)* |
| `100dvh`              | Chrome 108 / Safari 15.4            |

> The app works normally without Wake Lock and Notifications — both features degrade gracefully.

---

## License

MIT — free to use, modify and distribute.