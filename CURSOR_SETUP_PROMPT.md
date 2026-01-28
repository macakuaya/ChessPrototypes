# Cursor Setup Prompt

Copy and paste this prompt into Cursor to automatically set up a Chess.com prototype project.

---

## Before Using This Prompt

Make sure you have completed these manual steps first:

1. **Node.js installed** (v20+) - verify with `node --version`
2. **GitHub account** with access to the chess-com organization
3. **Personal Access Token** created with `read:packages` and `repo` scopes
4. **npm configured** with your token:
   ```bash
   npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
   ```
5. **Empty repository created** on GitHub and cloned locally
6. **Cursor open** in the cloned repository folder

---

## The Prompt

Copy everything below the line and paste it into Cursor chat:

---

```
Please help me set up a Chess.com prototype project from scratch. Create a complete Vue.js application with the Chess.com Design System, MCP rules, and GitHub Pages deployment.

## Project Structure

Create the following structure:
- A Vue 3 app in the root (not in a subfolder)
- Design System integration
- Cursor rules for the Design System MCP
- GitHub Actions workflow for deployment

## Step 1: Create Vue Project Files

Create these files:

### package.json
```json
{
  "name": "my-prototype",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@chesscom/design-system": "^0.21.2",
    "vue": "^3.5.26"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.3",
    "vite": "^7.3.0"
  }
}
```

### .npmrc
```
@chesscom:registry=https://npm.pkg.github.com
```

### vite.config.js
Use my GitHub username and repository name for the base path. Ask me for these if you don't know them.

### index.html
Standard Vue 3 HTML entry point.

### src/main.js
Import Vue and the Design System CSS:
- @chesscom/design-system/dist/variables.css
- @chesscom/design-system/dist/cc-utils.css
- @chesscom/design-system/dist/style.css

### src/App.vue
Create a simple starter component that demonstrates:
- Importing CcButton and CcIcon from @chesscom/design-system
- A heading that says "My Prototype"
- A primary CcButton
- A CcIcon (use utility-cogwheel)
- Dark mode styling (background: #262421)

### src/assets/main.css
Basic reset and dark mode body styles.

## Step 2: Create Cursor Rules

### .cursor/rules/design-system.mdc
Create the Design System rules file with:
- Proper frontmatter with globs for vue, ts, js, css files
- Instructions to always use the MCP first
- Guidelines for components, tokens, and icons
- Example workflow

## Step 3: Create GitHub Actions

### .github/workflows/deploy.yml
Create the deployment workflow that:
- Triggers on push to main
- Sets up Node.js 20 with npm.pkg.github.com registry
- Installs dependencies with NODE_AUTH_TOKEN secret
- Builds the project
- Deploys to GitHub Pages

## Step 4: Create README

### README.md
Create a README that explains:
- What this prototype is
- How to run it locally (npm install, npm run dev)
- How deployment works

## After Creating Files

1. Tell me to run `npm install`
2. Tell me to run `npm run dev` to test locally
3. Remind me to:
   - Add NPM_TOKEN secret in GitHub repository settings
   - Enable GitHub Pages with "GitHub Actions" as the source
   - Push the code to trigger deployment

Please create all these files now. Ask me for my GitHub username and repository name first so you can configure the vite.config.js base path correctly.
```

---

## What This Prompt Does

When you paste this prompt into Cursor, it will:

1. **Ask for your GitHub details** (username and repo name)
2. **Create all project files** including:
   - `package.json` with Design System dependency
   - `.npmrc` for private npm registry
   - `vite.config.js` configured for GitHub Pages
   - `index.html` entry point
   - `src/main.js` with Design System CSS imports
   - `src/App.vue` with example components
   - `src/assets/main.css` with dark mode styles
3. **Create Cursor rules** at `.cursor/rules/design-system.mdc`
4. **Create GitHub Actions** at `.github/workflows/deploy.yml`
5. **Create README** with instructions

## After Cursor Creates the Files

Run these commands in the terminal:

```bash
# Install dependencies
npm install

# Test locally
npm run dev
```

Then on GitHub:
1. Go to your repository Settings > Secrets and variables > Actions
2. Add secret `NPM_TOKEN` with your Personal Access Token
3. Go to Settings > Pages > Source: "GitHub Actions"
4. Push your code: `git add . && git commit -m "Initial setup" && git push`

Your prototype will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`
