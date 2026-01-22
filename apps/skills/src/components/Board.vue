<script setup>
import { computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  size: { type: Number, default: 375 },
  pieces: { type: Array, default: () => [] },
  highlights: { type: Array, default: () => [] },
  lastMove: { type: Object, default: null }, // { from: 'e2', to: 'e4' }
  skillHighlight: { type: String, default: null }, // Square to highlight with skill animation (e.g., 'd6')
  skillHighlightLabel: { type: String, default: null }, // Label text for skill highlight (e.g., 'Skewer')
  showExplosion: { type: Boolean, default: false }, // Show the explosion circle
  brilliantHighlight: { type: String, default: null }, // Square to highlight with brilliant animation (e.g., 'f6')
})

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const squareSize = computed(() => props.size / 8)

// Target position for coin fall (aligned with progress bar start)
const TARGET_X = 60 // px from left edge of board
const TARGET_Y_OFFSET = 10 // px below board bottom

// Calculate coin fall position for a given square (as CSS values)
// The CSS left/top in keyframes are relative to the square element
const getCoinFallPosition = (square) => {
  if (!square) return { x: '-170%', y: '600%' }
  
  const fileIndex = files.indexOf(square[0])
  const rankIndex = 8 - parseInt(square[1], 10) // 0 = top row (rank 8)
  
  const sqSize = squareSize.value
  
  // Target absolute position on the board
  const targetX = TARGET_X
  const targetY = props.size + TARGET_Y_OFFSET
  
  // Square's position on the board
  const squareLeft = fileIndex * sqSize
  const squareTop = rankIndex * sqSize
  
  // Final position relative to square (for CSS left/top)
  const finalLeft = targetX - squareLeft
  const finalTop = targetY - squareTop
  
  // Convert to percentage of square size
  return {
    x: (finalLeft / sqSize) * 100,
    y: (finalTop / sqSize) * 100
  }
}

// Get CSS custom properties for the skill highlight square
const getSkillHighlightStyle = computed(() => {
  if (!props.skillHighlight) return {}
  const pos = getCoinFallPosition(props.skillHighlight)
  return {
    '--coin-fall-x': `${pos.x}%`,
    '--coin-fall-y': `${pos.y}%`
  }
})

const squares = computed(() => {
  const result = []
  for (let rank of ranks) {
    for (let file of files) {
      result.push(`${file}${rank}`)
    }
  }
  return result
})

const isLightSquare = (square) => {
  const fileIndex = files.indexOf(square[0])
  const rankIndex = parseInt(square[1], 10) - 1
  return (fileIndex + rankIndex) % 2 === 1
}

const isHighlighted = (square) => {
  return props.highlights.includes(square)
}

const isLastMoveSquare = (square) => {
  if (!props.lastMove) return false
  return props.lastMove.from === square || props.lastMove.to === square
}

const hasSkillHighlight = (square) => {
  return props.skillHighlight === square
}

const hasBrilliantHighlight = (square) => {
  return props.brilliantHighlight === square
}

const getPieceOnSquare = (square) => {
  return props.pieces.find(p => p.square === square)
}

// Piece image paths (PNG from Figma)
// Supports both 'wK' and 'wk' formats
const getPieceImage = (piece) => {
  const type = piece.type.toLowerCase()
  const base = import.meta.env.BASE_URL
  return `${base}pieces/${type}.png`
}
</script>

<template>
  <div class="board-wrapper">
    <div class="board" :style="{ width: `${size}px`, height: `${size}px` }">
      <div 
        v-for="square in squares" 
        :key="square"
        class="square"
        :class="{
          light: isLightSquare(square),
          dark: !isLightSquare(square),
          highlighted: isHighlighted(square),
          'last-move': isLastMoveSquare(square),
        }"
        :data-square="square"
      >
        <!-- Skill Highlight Overlay -->
        <div 
          v-if="hasSkillHighlight(square)" 
          class="skill-highlight-overlay"
        ></div>
        
        <!-- Skill Star Icon (separate from overlay to avoid opacity inheritance) -->
        <svg 
          v-if="hasSkillHighlight(square)" 
          class="skill-star-icon" 
          :style="getSkillHighlightStyle"
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path d="M6.56624 15.6425C6.14456 15.9236 5.64255 15.5622 5.78311 15.0803L6.82729 11.1244L3.6546 8.55415C3.23291 8.21278 3.57427 7.65053 3.9558 7.61037L8.05219 7.38949L9.51805 3.57423C9.59837 3.37342 9.79917 3.23286 10.0201 3.23286C10.2209 3.23286 10.4217 3.35334 10.502 3.57423L11.9678 7.38949L16.0442 7.61037C16.5662 7.63045 16.6867 8.27302 16.3454 8.53407L13.1727 11.1244L14.2168 15.0803C14.3574 15.5823 13.7751 15.8634 13.4337 15.6425L9.99998 13.4337L6.56624 15.6425Z" fill="white"/>
        </svg>
        
        <!-- Skill Label Bubble (transforms from white pill to gold circle) -->
        <div 
          v-if="hasSkillHighlight(square) && skillHighlightLabel" 
          class="skill-label-bubble"
          :style="getSkillHighlightStyle"
        >
          <span class="skill-label-text">{{ skillHighlightLabel }}</span>
        </div>

        <!-- Brilliant Highlight Overlay (teal color) -->
        <div 
          v-if="hasBrilliantHighlight(square)" 
          class="brilliant-highlight-overlay"
        ></div>
        
        <!-- Brilliant Icon (exclamation double) -->
        <div 
          v-if="hasBrilliantHighlight(square)" 
          class="brilliant-icon-wrapper"
        >
          <CcIcon name="move-exclamation-double" :size="16" color="white" />
        </div>
        
        <!-- Brilliant Label Bubble (teal, stays on board) -->
        <div 
          v-if="hasBrilliantHighlight(square)" 
          class="brilliant-label-bubble"
        >
          <span class="brilliant-label-text">Brilliant!</span>
        </div>

        <!-- Piece -->
        <img 
          v-if="getPieceOnSquare(square)" 
          class="piece"
          :src="getPieceImage(getPieceOnSquare(square))"
          :alt="getPieceOnSquare(square).type"
          draggable="false"
        />

        <!-- File label (bottom row) -->
        <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
        
        <!-- Rank label (left column) -->
        <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
      </div>
    </div>
    
    <!-- Explosion Circle (appears where coin disappeared) -->
    <div 
      v-if="showExplosion" 
      class="explosion-circle"
    ></div>
  </div>
</template>

<style scoped>
.board-wrapper {
  display: inline-block;
  position: relative;
}

/* Explosion Circle - appears where coin disappeared */
.explosion-circle {
  position: absolute;
  background: #E3AA24;
  border-radius: 50%;
  /* Center at bottom edge of board - creates semicircle effect */
  left: 60px;
  top: 100%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  /* Clip top half so only bottom semicircle shows */
  clip-path: inset(50% 0 0 0);
  /* Animation: grow from 34px to 280px, fade out */
  animation: explosion-expand 500ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes explosion-expand {
  0% {
    width: 34px;
    height: 34px;
    opacity: 1;
  }
  100% {
    width: 280px;
    height: 280px;
    opacity: 0;
  }
}

.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  overflow: hidden;
}

.square {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.square.dark {
  background: #779556;
}

.square.light {
  background: #EBECD0;
}

.square.highlighted {
  background: #EDDA93;
}

.square.last-move.dark {
  background: #BBCB44;
}

.square.last-move.light {
  background: #F6F669;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  cursor: pointer;
  user-select: none;
  pointer-events: none;
}

.coord {
  position: absolute;
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
}

.file-coord {
  bottom: 2px;
  right: 3px;
}

.rank-coord {
  top: 2px;
  left: 3px;
}

.square.dark .coord {
  color: #EBECD0;
}

.square.light .coord {
  color: #779556;
}

/* Skill Highlight Overlay */
.skill-highlight-overlay {
  position: absolute;
  inset: 0;
  background: #E3AA24; /* color-gold-300 */
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: skill-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes skill-overlay-animate {
  /* State 1 → State 2: fade in */
  0% {
    opacity: 0;
  }
  37.5% { /* 300ms */
    opacity: 0.8;
  }
  /* Hold until 500ms (62.5%) */
  62.5% {
    opacity: 0.8;
  }
  /* State 2 → State 3: fade out */
  100% { /* 800ms */
    opacity: 0;
  }
}

/* Skill Star Icon */
.skill-star-icon {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  filter: drop-shadow(0px 1.2px 0px rgba(0, 0, 0, 0.25));
  /* Total: 800ms morph + 50ms pause + 500ms fall = 1350ms */
  animation: skill-star-animate 1350ms cubic-bezier(0.8, 0, 1, 1) forwards;
}

@keyframes skill-star-animate {
  /* State 1 (0ms) */
  0% {
    opacity: 0.1;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 2 (300ms = 22.2%) */
  22.2% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 3: in gold pill (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: 4px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: 4px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 4: fall to target position, rotate -90° (1350ms = 100%) */
  100% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, -50%) rotate(-90deg);
  }
}

/* Skill Label Bubble (transforms from white pill to gold circle, then falls) */
.skill-label-bubble {
  position: absolute;
  left: 90%;
  top: -6px;
  height: 20px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 1.1px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  /* Total: 800ms morph + 50ms pause + 500ms fall = 1350ms */
  animation: skill-pill-animate 1350ms cubic-bezier(0.8, 0, 1, 1) forwards;
}

@keyframes skill-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 22.2%) */
  22.2% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* State 3: gold circle (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 20px;
    padding: 0;
    background: #E3AA24;
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 20px;
    padding: 0;
    background: #E3AA24;
  }
  /* State 4: fall to target position (1350ms = 100%) */
  100% {
    opacity: 1;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, 0);
    max-width: 20px;
    padding: 0;
    background: #E3AA24;
  }
}

/* Text inside the pill - fades out */
.skill-label-text {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 800;
  line-height: 20px;
  color: #cf8d1b;
  white-space: nowrap;
  animation: skill-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes skill-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}

/* ========== BRILLIANT HIGHLIGHT ANIMATIONS ========== */
/* Same as skill animation but with teal color (#26C2A3) and no falling */

/* Brilliant Highlight Overlay (teal color) */
.brilliant-highlight-overlay {
  position: absolute;
  inset: 0;
  background: #26C2A3; /* Brilliant teal */
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: brilliant-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-overlay-animate {
  0% { opacity: 0; }
  37.5% { opacity: 0.8; }
  62.5% { opacity: 0.8; }
  100% { opacity: 0; }
}

/* Brilliant Icon Wrapper - contains the CcIcon */
.brilliant-icon-wrapper {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 1.2px 0px rgba(0, 0, 0, 0.25));
  /* 800ms animation - no falling, stays at final position */
  animation: brilliant-icon-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-icon-animate {
  /* State 1 (0ms) - centered, faded */
  0% {
    opacity: 0.1;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 2 (300ms = 37.5%) - centered, visible, larger */
  37.5% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 3: in teal coin at top right (800ms = 100%) - STAYS HERE */
  100% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: 4px;
    left: 90%;
    transform: translate(-50%, -50%);
  }
}

/* Brilliant Label Bubble (white pill → teal circle, stays on board) */
.brilliant-label-bubble {
  position: absolute;
  left: 90%;
  top: -6px;
  height: 20px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 1.1px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  /* 800ms animation - no falling, stays at final position */
  animation: brilliant-pill-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 37.5%) */
  37.5% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 6px;
    background: white;
  }
  /* State 3: teal circle (800ms = 100%) - STAYS HERE */
  100% {
    opacity: 1;
    top: -6px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 20px;
    padding: 0;
    background: #26C2A3;
  }
}

/* Text inside the brilliant pill - fades out */
.brilliant-label-text {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 800;
  line-height: 20px;
  color: #1a9a82; /* Darker teal for text */
  white-space: nowrap;
  animation: brilliant-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
