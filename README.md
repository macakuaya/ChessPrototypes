# ♟️ Chess Prototypes

A monorepo for Chess.com UI prototypes with shared components.

## 🌐 Live Demos

- **Landing**: https://macakuaya.github.io/ChessPrototypes/
- **Skills**: https://macakuaya.github.io/ChessPrototypes/skills/
- **Juicy Learn**: https://macakuaya.github.io/ChessPrototypes/juicy-learn/

## 📁 Structure

```
ChessPrototypes/
├── shared/
│   └── chess-components/     # Shared components (sounds, animations, celebrations)
├── apps/
│   ├── skills/               # Skills prototype
│   └── juicy-learn/          # Juicy Learn prototype
├── landing/                  # Landing page
└── .github/workflows/        # Auto-deploy to GitHub Pages
```

## 🚀 Development

### Running a prototype locally

```bash
cd apps/skills
npm install
npm run dev
```

Or for Juicy Learn:

```bash
cd apps/juicy-learn
npm install
npm run dev
```

### Adding a new prototype

1. Create a new folder in `apps/`
2. Copy the structure from an existing app (e.g., `juicy-learn`)
3. Update `vite.config.js` with the correct `base` path
4. Add build steps to `.github/workflows/deploy.yml`
5. Add link to `landing/index.html`

## 🔧 Shared Components

Import shared components in any app using the `@chess/components` alias:

```js
import { BoardCelebration, SkillEarned } from '@chess/components'
import { playSound, useSound } from '@chess/components/sounds'
```

## 📦 Deployment

Automatic deployment to GitHub Pages on push to `main` branch.
