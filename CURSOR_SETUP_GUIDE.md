# Zero to Hero: Building a Chess.com Prototype with Cursor

This guide walks you through setting up everything from scratch to deploy a prototype with the Chess.com Design System.

---

## Prerequisites

Before starting, you need:
- A Mac (this guide assumes macOS)
- A Chess.com email/account (for GitHub access to the design system)
- A Figma account

---

## Part 1: Install Required Software

### 1.1 Install Cursor IDE

1. Go to [cursor.com](https://cursor.com)
2. Download Cursor for Mac
3. Open the downloaded `.dmg` file and drag Cursor to Applications
4. Launch Cursor and sign in (you can use Google, GitHub, or email)

### 1.2 Install Node.js

Node.js is required to run Vue.js projects.

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS version** (v20 or higher)
3. Run the installer and follow the prompts
4. Verify installation by opening Terminal and running:
   ```bash
   node --version
   ```
   You should see something like `v20.19.0`

### 1.3 Install Git

Git is usually pre-installed on Mac. Verify by running:
```bash
git --version
```

If not installed, it will prompt you to install Xcode Command Line Tools. Click "Install".

---

## Part 2: Set Up GitHub

### 2.1 Create a GitHub Account

1. Go to [github.com](https://github.com) and sign up (use your Chess.com email)
2. Verify your email address

### 2.2 Request Access to Chess.com Organization

To use `@chesscom/design-system`, you need access to the Chess.com GitHub organization:

1. Ask your manager or the Design System team to add you to the `chess-com` GitHub organization
2. Once added, you'll have access to the private npm packages

### 2.3 Create a Personal Access Token (PAT)

This token allows npm to download the private design system package:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "npm-design-system"
4. Select these scopes:
   - `read:packages`
   - `repo` (if you want to push code)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### 2.4 Configure npm to Use the Token

In Terminal, run:
```bash
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

---

## Part 3: Create Your Vue.js Project

### 3.1 Create a New Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Name it something like `my-chess-prototype`
3. Make it **Private** (for internal prototypes)
4. Check "Add a README file"
5. Click "Create repository"

### 3.2 Clone the Repository

1. Copy the repository URL (click the green "Code" button)
2. Open Terminal and run:
   ```bash
   cd ~/Documents
   git clone https://github.com/YOUR_USERNAME/my-chess-prototype.git
   cd my-chess-prototype
   ```

### 3.3 Open in Cursor

1. Open Cursor
2. File > Open Folder
3. Select your `my-chess-prototype` folder

### 3.4 Create a Vue.js App

In Cursor's terminal (View > Terminal), run:
```bash
npm create vue@latest my-app
```

When prompted:
- Project name: `my-app`
- TypeScript: No (unless you prefer it)
- JSX: No
- Vue Router: No (for simple prototypes)
- Pinia: No
- Vitest: No
- End-to-End Testing: No
- ESLint: Yes (recommended)
- Prettier: Yes (recommended)

Then:
```bash
cd my-app
npm install
```

### 3.5 Install the Chess.com Design System

Create an `.npmrc` file in your app folder:
```bash
echo "@chesscom:registry=https://npm.pkg.github.com" > .npmrc
```

Install the design system:
```bash
npm install @chesscom/design-system
```

### 3.6 Set Up Design System CSS

In your `src/main.js`, add these imports at the top:
```javascript
import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'
```

### 3.7 Use Components

In any Vue component, import and use design system components:
```vue
<script setup>
import { CcButton, CcIcon } from '@chesscom/design-system'
</script>

<template>
  <CcButton variant="primary">Click me!</CcButton>
  <CcIcon name="utility-cogwheel" :size="24" />
</template>
```

---

## Part 4: Configure MCPs in Cursor

MCPs (Model Context Protocol servers) give Cursor AI superpowers by connecting it to external tools.

### 4.1 Open MCP Settings

1. In Cursor, press `Cmd + Shift + P`
2. Type "Cursor Settings" and select it
3. Click on "MCP" in the left sidebar

### 4.2 Add Chess.com Design System MCP

Click "Add new MCP server" and configure:

- **Name**: `chesscom-design-system`
- **Type**: Select the appropriate type (check with Design System team for the exact configuration)

This MCP lets you ask Cursor things like:
- "What props does cc-button have?"
- "Find a gear icon"
- "What color token should I use for backgrounds?"

### 4.3 Add Figma MCP

Click "Add new MCP server" and configure:

- **Name**: `figma`
- **Type**: Follow Figma's MCP setup instructions

This MCP lets you:
- Generate code from Figma designs
- Get screenshots of Figma nodes
- Extract design tokens and variables

### 4.4 Create Design System Rules

Create a folder and file at `.cursor/rules/design-system.mdc`:

```markdown
---
description: Chess.com Design System guidelines for AI assistance
globs: ["**/*.vue", "**/*.ts", "**/*.js", "**/*.css"]
---

# Chess.com Design System Rules

When working on Chess.com UI code, follow these guidelines:

## Always Use the MCP First

Before writing UI code, **always query the Chess.com Design System MCP**:

1. **Components**: Use `search_components` or `get_component_api`
2. **Tokens**: Use `search_tokens` or `get_token_value` for colors, spacing
3. **Icons**: Use `search_glyphs` for monochrome icons
4. **Guidelines**: Use `get_do_dont` for best practices

## Component Usage

- Always use `cc-` prefixed components from `@chesscom/design-system`
- Never hardcode colors - use CSS variables
- Never hardcode spacing - use spacing tokens
```

---

## Part 5: Deploy to GitHub Pages

### 5.1 Configure Vite for GitHub Pages

Edit `vite.config.js` and add the `base` option:
```javascript
export default defineConfig({
  base: '/my-chess-prototype/my-app/',
  // ... rest of config
})
```

Replace `my-chess-prototype` with your repository name.

### 5.2 Create GitHub Actions Workflow

Create the folder structure `.github/workflows/` and add a file called `deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@chesscom'

      - uses: actions/configure-pages@v4

      - name: Install dependencies
        working-directory: my-app
        run: npm ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Build
        working-directory: my-app
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: my-app/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

### 5.3 Add NPM Token Secret

1. Go to your repository on GitHub
2. Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your Personal Access Token from Part 2.3

### 5.4 Enable GitHub Pages

1. Go to your repository Settings
2. Pages (in left sidebar)
3. Source: Select "GitHub Actions"

### 5.5 Deploy!

Commit and push your changes:
```bash
git add .
git commit -m "Initial prototype setup"
git push
```

Your site will be live at: `https://YOUR_USERNAME.github.io/my-chess-prototype/my-app/`

---

## Part 6: Daily Workflow

### Talking to Cursor AI

With MCPs configured, you can ask Cursor things like:

- "Implement this Figma design: [paste Figma URL]"
- "What button should I use for a primary action?"
- "Find an icon for settings"
- "What's the correct spacing token for gaps?"

### Making Changes

1. Make your changes in Cursor
2. Test locally with `npm run dev`
3. Commit and push to auto-deploy:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

---

## Troubleshooting

### "npm install" fails for design-system

- Verify your PAT token has `read:packages` scope
- Run `npm config list` to verify the token is set
- Make sure you have access to the chess-com GitHub organization

### MCP not working

- Restart Cursor after adding MCPs
- Check MCP settings for error messages
- Verify the MCP server is running

### Build fails on GitHub Actions

- Check that `NPM_TOKEN` secret is set correctly
- Verify the token hasn't expired

---

## Need Help?

- **Design System questions**: Ask in the Design System Slack channel
- **Cursor questions**: Check [Cursor docs](https://docs.cursor.com)
- **GitHub Actions issues**: Check the Actions tab in your repository for error logs
