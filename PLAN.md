# 📋 ChessPrototypes Monorepo Plan

## Overview

This repo will host all Chess.com prototypes AND shared components (sounds, animations, effects) in a simple folder structure with automatic GitHub Pages deployment.

---

## Current Structure of Existing Repos

### ChessComponents (shared library)

```
src/
├── index.js                    # Main exports
├── board-animations/           # ANIMATION_TIMINGS, ANIMATION_COLORS, skillHighlightCSS
├── celebrations/               # BoardCelebration.vue, SkillEarned.vue, SkillUnlockedModal.vue
└── sounds/                     # useSound.js, playSound
```

### ChessSkills (prototype app)

```
web/
├── vite.config.js              # base: '/ChessSkills/'
├── package.json                # depends on @chess/components, @chesscom/design-system
├── src/
│   ├── App.vue
│   └── components/             # Board, CoachBubble, EvalBar, etc.
└── public/                     # fonts, icons, pieces, games
```

---

## Proposed Monorepo Structure

```
ChessPrototypes/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Auto-deploy to GitHub Pages
│
├── shared/
│   └── chess-components/        # 📁 Shared components (from ChessComponents repo)
│       ├── index.js             # Main exports
│       ├── board-animations/
│       ├── celebrations/
│       └── sounds/
│
└── apps/
    ├── skills/                  # 🎮 Skills prototype (from ChessSkills/web)
    │   ├── vite.config.js       # base: '/ChessPrototypes/skills/'
    │   ├── package.json
    │   ├── src/
    │   └── public/
    │
    └── juicy-learn/             # 🆕 New JuicyLearn prototype
        ├── vite.config.js       # base: '/ChessPrototypes/juicy-learn/'
        ├── package.json
        ├── src/
        └── public/
```

---

## Deployment URLs

| Prototype   | URL                                                        |
| ----------- | ---------------------------------------------------------- |
| Skills      | `https://macakuaya.github.io/ChessPrototypes/skills/`      |
| JuicyLearn  | `https://macakuaya.github.io/ChessPrototypes/juicy-learn/` |
| (future)    | `https://macakuaya.github.io/ChessPrototypes/<name>/`      |

---

## Key Changes

| Item                | Change Needed                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| **ChessSkills**     | Move `web/` contents → `apps/skills/`, update base path                 |
| **ChessComponents** | Move `src/` contents → `shared/chess-components/` (just files, no package.json) |
| **Import paths**    | Use Vite alias: `@chess/components` → `../../shared/chess-components`   |
| **vite.config.js**  | Each app gets `base` + alias for shared components                      |
| **GitHub Actions**  | New workflow that builds all apps → deploys combined `dist/`            |

---

## Implementation Steps

### Step 1: Create Folder Structure

```bash
mkdir -p shared/chess-components
mkdir -p apps/skills
mkdir -p apps/juicy-learn
mkdir -p .github/workflows
```

### Step 2: Copy ChessComponents

- Clone from `github.com/macakuaya/ChessComponents`
- Copy `src/*` contents to `shared/chess-components/`
- **No package.json needed** - it's just a shared folder

Final structure:
```
shared/chess-components/
├── index.js
├── board-animations/
│   └── index.js
├── celebrations/
│   ├── index.js
│   ├── BoardCelebration.vue
│   ├── SkillEarned.vue
│   └── SkillUnlockedModal.vue
└── sounds/
    ├── index.js
    └── useSound.js
```

### Step 3: Copy ChessSkills

- Clone from `github.com/macakuaya/ChessSkills`
- Copy `web/*` contents to `apps/skills/`
- Update `vite.config.js`:

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/ChessPrototypes/skills/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@chess/components': fileURLToPath(new URL('../../shared/chess-components', import.meta.url))
    }
  }
})
```

- Update `package.json`: **Remove** `@chess/components` from dependencies (it's now a local folder)

### Step 4: Create ChessJuicyLearn

- Create new Vue+Vite app at `apps/juicy-learn/`
- Configure `vite.config.js` with:
  - `base: '/ChessPrototypes/juicy-learn/'`
  - Alias for `@chess/components`
- Add `@chesscom/design-system` dependency

### Step 5: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` that:

1. Triggers on push to `main`
2. Installs dependencies for each app
3. Builds all apps in `apps/` folder
4. Combines all `dist/` outputs into single deployment folder:
   ```
   dist/
   ├── skills/        # from apps/skills/dist
   └── juicy-learn/   # from apps/juicy-learn/dist
   ```
5. Deploys to GitHub Pages

### Step 6: Optional Landing Page

Create a simple `index.html` at root that lists all prototypes with links.

---

## How Imports Work

Each app uses a Vite alias to import from the shared folder:

```js
// In any app's component:
import { BoardCelebration, SkillEarned } from '@chess/components'
import { playSound } from '@chess/components/sounds'
```

The alias in `vite.config.js` resolves `@chess/components` to `../../shared/chess-components`.

---

## Tech Stack

- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **Design System**: `@chesscom/design-system`
- **Deployment**: GitHub Pages (via GitHub Actions)

---

## Decisions

1. **ChessJuicyLearn** - Basic Vue scaffold similar to Skills (with design system setup)
2. **Landing page** - Simple list of links for now (can enhance with chess components later)
