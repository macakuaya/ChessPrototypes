# Design System Integration Fix

## Bug: Design System Crashes in Standalone Vue Projects

**Problem:**  
When using `@chesscom/design-system` in a standalone Vue project (outside the main Chess.com codebase), components fail with:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'features')
```

**Root Cause:**  
The design system expects `window.chesscom` and `window.context` globals to exist at module evaluation time. In standalone projects, these don't exist.

## The Fix

Initialize the globals in `index.html` using a **regular script tag** (not `type="module"`) **before** the main module loads:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <script>
      // Initialize globals BEFORE any modules load
      window.chesscom = window.chesscom || { features: [], settings: {} };
      window.context = window.context || {};
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## Why This Specific Placement Matters

### What DOESN'T work:

**Setting globals at the top of `main.js`:**
```js
// ❌ This doesn't work!
window.chesscom = { features: [], settings: {} }
window.context = {}

import { CcButton } from '@chesscom/design-system' // Already too late!
```

This fails because ES module imports are **hoisted** - they are evaluated before any code in the file runs, regardless of where they appear in the source.

### What DOES work:

**Inline script in `<head>` (non-module):**
```html
<script>
  // ✅ This works!
  window.chesscom = { features: [], settings: {} };
</script>
```

Regular `<script>` tags (without `type="module"`) execute synchronously and block parsing. This guarantees the globals exist before any ES modules are fetched and evaluated.

## Complete Setup Checklist

1. **`index.html`** - Add globals script in `<head>`:
   ```html
   <script>
     window.chesscom = window.chesscom || { features: [], settings: {} };
     window.context = window.context || {};
   </script>
   ```

2. **`main.js`** - Import CSS and enable dark mode:
   ```js
   import '@chesscom/design-system/dist/variables.css'
   import '@chesscom/design-system/dist/cc-utils.css'
   import '@chesscom/design-system/dist/style.css'

   import { createApp } from 'vue'
   import App from './App.vue'

   document.body.classList.add('dark-mode')

   createApp(App).mount('#app')
   ```

3. **Components** - Import and use normally:
   ```vue
   <script setup>
   import { CcButton, CcIcon } from '@chesscom/design-system'
   </script>

   <template>
     <CcButton variant="primary">Click me</CcButton>
   </template>
   ```

## Recommendation

Consider adding this initialization to the design system's documentation for standalone usage, or having the design system gracefully handle missing globals with sensible defaults.
