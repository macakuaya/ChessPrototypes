<script setup>
import { ref, computed } from 'vue'
import { CcButton, CcIconButton, CcIcon } from '@chesscom/design-system'
import CoachBubble from './components/CoachBubble.vue'

// Icon names from Figma design
const icons = {
  // Header icons (20px)
  back: 'arrow-line-left',
  sound: 'media-audio-speaker-noise',
  // Board sidebar (20px)
  settings: 'utility-cogwheel',
  // Button icons (24px)
  video: 'media-control-play',
  hint: 'device-bulb-glow',
  // Toolbar icons (24px)
  analysis: 'arrows-stroke-expand-diagonal-a',
  retry: 'arrow-spin-redo',
  undo: 'arrow-spin-undo',
  prev: 'arrow-chevron-left',
  next: 'arrow-chevron-right',
}

// State
const currentChallenge = ref(2)
const totalChallenges = ref(3)
const streak = ref(5)
const coachMessage = ref('Sometimes I play bad moves just to see what happens.')
const progressPercent = ref((2 / 3) * 100)

// Chess board setup
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const base = import.meta.env.BASE_URL

// Generate all squares
const squares = computed(() => {
  const result = []
  for (let rank of ranks) {
    for (let file of files) {
      result.push(`${file}${rank}`)
    }
  }
  return result
})

// Check if square is light colored
const isLightSquare = (square) => {
  const fileIndex = files.indexOf(square[0])
  const rankIndex = parseInt(square[1], 10) - 1
  return (fileIndex + rankIndex) % 2 === 1
}

// Starting position pieces
const pieces = ref([
  // Black pieces (rank 8)
  { type: 'br', square: 'a8' },
  { type: 'bn', square: 'b8' },
  { type: 'bb', square: 'c8' },
  { type: 'bq', square: 'd8' },
  { type: 'bk', square: 'e8' },
  { type: 'bb', square: 'f8' },
  { type: 'bn', square: 'g8' },
  { type: 'br', square: 'h8' },
  // Black pawns (rank 7)
  { type: 'bp', square: 'a7' },
  { type: 'bp', square: 'b7' },
  { type: 'bp', square: 'c7' },
  { type: 'bp', square: 'd7' },
  { type: 'bp', square: 'e7' },
  { type: 'bp', square: 'f7' },
  { type: 'bp', square: 'g7' },
  { type: 'bp', square: 'h7' },
  // White pawns (rank 2)
  { type: 'wp', square: 'a2' },
  { type: 'wp', square: 'b2' },
  { type: 'wp', square: 'c2' },
  { type: 'wp', square: 'd2' },
  { type: 'wp', square: 'e2' },
  { type: 'wp', square: 'f2' },
  { type: 'wp', square: 'g2' },
  { type: 'wp', square: 'h2' },
  // White pieces (rank 1)
  { type: 'wr', square: 'a1' },
  { type: 'wn', square: 'b1' },
  { type: 'wb', square: 'c1' },
  { type: 'wq', square: 'd1' },
  { type: 'wk', square: 'e1' },
  { type: 'wb', square: 'f1' },
  { type: 'wn', square: 'g1' },
  { type: 'wr', square: 'h1' },
])

// Get piece on a specific square
const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

// Get piece image path from Chess.com CDN (neo theme, 300px for crisp rendering)
const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}
</script>

<template>
  <div class="app">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="chessboard">
          <div 
            v-for="square in squares" 
            :key="square"
            class="square"
            :class="isLightSquare(square) ? 'light' : 'dark'"
            :data-square="square"
          >
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
        <!-- Settings icon positioned at top-right of board -->
        <div class="board-settings">
          <CcIcon :name="icons.settings" :size="20" />
        </div>
      </div>

      <!-- Right: Panel -->
      <div class="review-panel">
        <!-- Header -->
        <header class="panel-header">
          <div class="header-icon-container">
            <CcIcon :name="icons.back" :size="20" />
          </div>
          <div class="header-title">
            <img 
              src="https://www.chess.com/bundles/web/images/color-icons/lessons.svg" 
              alt="Lessons" 
              class="lessons-icon"
            />
            <span>Evaluating Captures</span>
          </div>
          <div class="header-icon-container">
            <CcIcon :name="icons.sound" :size="20" />
          </div>
        </header>

        <!-- Content -->
        <div class="panel-content">
          <!-- Coach -->
          <CoachBubble 
            :message="coachMessage"
            :show-tip="true"
          />

          <!-- Progress -->
          <div class="progress-section">
            <div class="progress-label">
              <span>Challenge</span>
              <span class="progress-numbers mono">
                <span>{{ currentChallenge }}</span>
                <span class="progress-slash">/</span>
                <span>{{ totalChallenges }}</span>
              </span>
            </div>
            <div class="progress-row">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="queen-badge">
                <img :src="`${base}icons/misc/Diamond.svg`" alt="" class="queen-diamond" />
                <CcIcon name="piece-fill-queen" :size="16" class="queen-icon" />
              </div>
            </div>
            <div class="streak">
              <CcIcon name="element-fire-blank" :size="16" class="fire-icon" />
              <span>{{ streak }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <div class="action-buttons">
            <CcButton variant="secondary" size="large" :icon="{ name: icons.video }">Video</CcButton>
            <CcButton variant="secondary" size="large" :icon="{ name: icons.hint }">Hint</CcButton>
          </div>
          <div class="toolbar">
            <CcIcon :name="icons.settings" :size="24" class="toolbar-icon" />
            <div class="toolbar-nav">
              <CcIcon :name="icons.prev" :size="24" class="toolbar-icon" />
              <CcIcon :name="icons.next" :size="24" class="toolbar-icon" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style>
html {
  box-sizing: border-box;
  font-size: 62.5%;
}
*, *::before, *::after {
  box-sizing: inherit;
}
body {
  margin: 0;
  background: var(--color-bg-primary, #312e2b);
  color: var(--color-text-boldest, white);
  font-family: 'Chess Sans', system-ui, sans-serif;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.4rem;
}

.layout {
  display: flex;
  gap: 3.2rem;
  height: 68rem;
}

/* Board */
.board-section {
  position: relative;
  display: flex;
}

.chessboard {
  width: 68rem;
  height: 68rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-radius: 0.3rem;
  overflow: hidden;
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

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
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  pointer-events: none;
}

.file-coord {
  bottom: 0.2rem;
  right: 0.3rem;
}

.rank-coord {
  top: 0.2rem;
  left: 0.3rem;
}

.square.dark .coord {
  color: #ebecd0;
}

.square.light .coord {
  color: #779556;
}

.board-settings {
  position: absolute;
  top: 0.6rem;
  right: -2.6rem;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

/* Panel */
.review-panel {
  width: 50rem;
  height: 68rem;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.2) 100%), #312e2b;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  height: 4.8rem;
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.14));
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon-container {
  width: 4.8rem;
  height: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 2rem;
  color: var(--color-text-boldest, white);
}

.lessons-icon {
  width: 2.4rem;
  height: 2.4rem;
}

.panel-content {
  flex: 1;
  padding: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  max-width: 50rem;
}

.progress-label {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 2rem;
  color: var(--color-text-boldest, white);
}

.progress-numbers {
  display: flex;
  align-items: center;
}

.progress-numbers.mono {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}

.progress-slash {
  font-weight: 800;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.progress-bar {
  flex: 1;
  height: 1.6rem;
  background: var(--color-bg-progress-track, rgba(255, 255, 255, 0.1));
  border-radius: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-bg-success, #81b64c);
  border-radius: 99.9rem;
}

.queen-badge {
  width: 4rem;
  height: 3.6rem;
  position: relative;
  flex-shrink: 0;
  overflow: visible;
}

.queen-diamond {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.queen-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% - 2px));
  color: #ebffbd;
  filter: drop-shadow(0 1px 0 var(--color-green-400, #5D9948));
}

.streak {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: var(--color-streak-medium, #fa742c);
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 2rem;
}

.fire-icon {
  flex-shrink: 0;
}

/* Footer */
.panel-footer {
  background: var(--color-bg-tertiary, rgba(0, 0, 0, 0.14));
  padding: 1.6rem 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
  max-width: 50rem;
}

.action-buttons > :deep(button) {
  flex: 1;
  max-height: 4.8rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-icon {
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

.toolbar-nav {
  display: flex;
  gap: 0.8rem;
}
</style>
