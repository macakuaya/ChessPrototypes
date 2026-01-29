# CoachBubble Component

A Vue 3 component that displays a coach avatar with an animated speech bubble.

## Contents

```
CoachBubble/
├── CoachBubble.vue    # The Vue component
├── assets/
│   ├── coach-avatar.png  # Coach avatar image (80x80)
│   └── bubble-tip.svg    # Speech bubble pointer
└── README.md          # This file
```

## Installation

1. Copy this entire `CoachBubble` folder into your project's components directory
2. Copy the assets to your public folder (or configure paths via props)

## Usage

```vue
<script setup>
import CoachBubble from './components/CoachBubble/CoachBubble.vue'
</script>

<template>
  <CoachBubble
    header-text="Brilliant"
    header-icon="/icons/brilliant.svg"
    eval-text="+3.2"
    message="Great move! You found the best continuation."
    :visible="true"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headerText` | String | `''` | Header text (e.g., "Brilliant", "Good move") |
| `headerIcon` | String | `''` | URL to the header icon |
| `evalText` | String | `''` | Evaluation badge text (e.g., "+3.2") |
| `message` | String | `''` | The coach's message content |
| `showTip` | Boolean | `true` | Show the speech bubble pointer |
| `visible` | Boolean | `true` | Control visibility (animates in/out) |
| `avatarSrc` | String | `'./assets/coach-avatar.png'` | Path to coach avatar image |
| `tipSrc` | String | `'./assets/bubble-tip.svg'` | Path to bubble tip SVG |
| `defaultIconSrc` | String | `''` | Default icon when headerIcon is empty |

## Events

| Event | Description |
|-------|-------------|
| `after-leave` | Emitted when the bubble finishes its exit animation |

## Configuring Asset Paths

If your assets are in a different location, pass custom paths:

```vue
<CoachBubble
  avatar-src="/public/images/coach.png"
  tip-src="/public/images/bubble-tip.svg"
  message="Hello!"
/>
```

## CSS Variables (Optional)

The animation uses CSS variables with fallback values. To customize timing:

```css
:root {
  --motion-steady: 300ms;
  --motion-ease-out-gentle: cubic-bezier(0.2, 0, 0, 1);
}
```

## Animation Behavior

- **Enter**: Slides in from the left with fade
- **Leave**: Slides up with fade
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

## Examples

### Simple message only

```vue
<CoachBubble message="Good job! Keep it up." />
```

### With header and evaluation

```vue
<CoachBubble
  header-text="Brilliant"
  header-icon="/icons/brilliant.svg"
  eval-text="+5.2"
  message="You found the winning move!"
/>
```

### Controlled visibility

```vue
<script setup>
import { ref } from 'vue'
const showBubble = ref(true)
</script>

<template>
  <CoachBubble
    :visible="showBubble"
    message="This bubble can be toggled"
    @after-leave="console.log('Bubble hidden')"
  />
  <button @click="showBubble = !showBubble">Toggle</button>
</template>
```

## Requirements

- Vue 3.x
- No external dependencies
