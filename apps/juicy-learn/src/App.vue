<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { CcButton, CcIconButton, CcIcon } from '@chesscom/design-system'
import CoachBubble from './components/CoachBubble.vue'
import { playSound } from '@chess/components/sounds'

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

// ============================================
// LESSON DATA
// ============================================
const lesson = {
  name: 'The Goals of Chess',
  questions: [
    {
      fen: '6k1/5pp1/3b1n1p/1p6/1P1R4/6PP/5P2/6K1 w - - 0 1',
      correctMove: { from: 'd4', to: 'd6', piece: 'R' }, // Rxd6
      intro: 'Which piece can White capture?',
      wrong: "There's a better move. Try again and look for a possible capture.",
      hint: 'The black bishop is on the same file as your rook.',
      solution: 'Good choice! White captures the bishop.',
    },
    {
      fen: '6k1/6p1/7p/2Q5/8/6P1/5P1P/4r1K1 w - - 0 0',
      correctMove: { from: 'g1', to: 'g2', piece: 'K' }, // Kg2
      intro: "White's king is in check. How can you get to safety?",
      wrong: 'Illegal',
      hint: 'Move the king forward so that the black rook will no longer be able to attack it.',
      solution: 'Nice move! The king is safe there.',
    },
    {
      fen: '6k1/5pp1/3Q3p/3b4/8/6P1/5PKP/2r5 w - - 0 1',
      correctMove: { from: 'd6', to: 'd5', piece: 'Q' }, // Qxd5
      intro: "The black bishop is checking White's king. What is White's best way out of check?",
      wrong: "This move escapes the check, but it's better to capture the black bishop. How can you do that?",
      hint: "Capture the piece that's checking your king.",
      solution: 'Good choice! Capturing the bishop removes the attack on your king.',
    },
    {
      fen: '6k1/1p3pp1/p5q1/8/7R/7P/3Q1PP1/6K1 w - - 0 0',
      correctMove: { from: 'd2', to: 'd8', piece: 'Q' }, // Qd8#
      intro: 'White can check with the queen or with the rook. Which one is checkmate?',
      wrong: "There's a possible checkmate, but that's not it. Look at your checks and try again.",
      hint: "Find a way to check so that the black king can't capture the piece that attacks it.",
      solution: "Nice work! That's checkmate!",
    },
    {
      fen: '3k4/R7/1R6/8/8/7P/3q2PK/8 w - - 0 1',
      correctMove: { from: 'b6', to: 'b8', piece: 'R' }, // Rb8#
      intro: 'White has several checks, but only one is mate. Can you find it?',
      wrong: "There's a checkmate, but that's not it. Look at your checks and try again.",
      hint: "Look at your checks. See if you can find one that Black can't escape.",
      solution: 'Checkmate! Well done!',
    },
  ],
}

// ============================================
// GAME STATE
// ============================================
const currentQuestionIndex = ref(0)
const questionState = ref('intro') // 'intro', 'wrong', 'hint', 'solution'
const streak = ref(0)
const selectedSquare = ref(null)
const lastMove = ref(null) // { from, to }

// Drag state
const isDragging = ref(false)
const draggedPiece = ref(null) // { type, square }
const draggedFrom = ref(null)
const dragPosition = ref({ x: 0, y: 0 })
const boardRef = ref(null)

// Computed
const currentQuestion = computed(() => lesson.questions[currentQuestionIndex.value])
const totalChallenges = computed(() => lesson.questions.length)
const currentChallenge = computed(() => currentQuestionIndex.value + 1)
// Progress includes current question if solved
const progressPercent = computed(() => {
  const completed = currentQuestionIndex.value + (questionState.value === 'solution' ? 1 : 0)
  return (completed / totalChallenges.value) * 100
})
const lessonName = computed(() => lesson.name)

// Coach message based on state
const coachMessage = computed(() => {
  const q = currentQuestion.value
  switch (questionState.value) {
    case 'intro': return q.intro
    case 'wrong': return q.wrong
    case 'hint': return q.hint
    case 'solution': return q.solution
    default: return q.intro
  }
})

// Streak color logic
// 0-1 = green (text-win), 2 = lowest, 3-4 = low, 5-6 = medium, 7+ = high
const streakColor = computed(() => {
  const s = streak.value
  if (s <= 1) return 'var(--color-text-win, #81b64c)'
  if (s === 2) return 'var(--color-streak-lowest)'
  if (s <= 4) return 'var(--color-streak-low)'
  if (s <= 6) return 'var(--color-streak-medium)'
  return 'var(--color-streak-high)'
})

// ============================================
// CHESS BOARD
// ============================================
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const base = import.meta.env.BASE_URL
const pieces = ref([])

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

// Parse FEN to pieces array
const parseFEN = (fen) => {
  const pieceMap = {
    'r': 'br', 'n': 'bn', 'b': 'bb', 'q': 'bq', 'k': 'bk', 'p': 'bp',
    'R': 'wr', 'N': 'wn', 'B': 'wb', 'Q': 'wq', 'K': 'wk', 'P': 'wp',
  }
  const result = []
  const [position] = fen.split(' ')
  const rows = position.split('/')
  
  rows.forEach((row, rowIndex) => {
    let colIndex = 0
    for (const char of row) {
      if (/\d/.test(char)) {
        colIndex += parseInt(char, 10)
      } else if (pieceMap[char]) {
        const file = files[colIndex]
        const rank = 8 - rowIndex
        result.push({ type: pieceMap[char], square: `${file}${rank}` })
        colIndex++
      }
    }
  })
  
  return result
}

// Load question position
const loadQuestion = (index) => {
  const q = lesson.questions[index]
  pieces.value = parseFEN(q.fen)
  questionState.value = 'intro'
  selectedSquare.value = null
  lastMove.value = null
}

// Get piece on a specific square
const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

// Get piece image path from Chess.com CDN
const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}

// Check if square is selected
const isSelected = (square) => selectedSquare.value === square

// Check if square is part of last move
const isLastMove = (square) => {
  if (!lastMove.value) return false
  return lastMove.value.from === square || lastMove.value.to === square
}

// ============================================
// MOVE HANDLING
// ============================================
const handleSquareClick = (square) => {
  // If already solved, don't allow more moves
  if (questionState.value === 'solution') return
  
  const piece = getPieceOnSquare(square)
  
  // If no piece selected yet
  if (!selectedSquare.value) {
    // Can only select white pieces (player plays as white)
    if (piece && piece.type.startsWith('w')) {
      selectedSquare.value = square
    }
    return
  }
  
  // If clicking same square, deselect
  if (selectedSquare.value === square) {
    selectedSquare.value = null
    return
  }
  
  // If clicking another white piece, select that instead
  if (piece && piece.type.startsWith('w')) {
    selectedSquare.value = square
    return
  }
  
  // Attempt move
  const from = selectedSquare.value
  const to = square
  const movingPiece = getPieceOnSquare(from)
  
  if (!movingPiece) {
    selectedSquare.value = null
    return
  }
  
  // Check if this is the correct move
  const correct = currentQuestion.value.correctMove
  if (from === correct.from && to === correct.to) {
    // Correct move!
    makeMove(from, to)
    streak.value++
    questionState.value = 'solution'
    lastMove.value = { from, to }
  } else {
    // Wrong move - reset streak
    streak.value = 0
    questionState.value = 'wrong'
  }
  
  selectedSquare.value = null
}

// Execute a move on the board
const makeMove = (from, to) => {
  // Remove any piece on target square (capture)
  pieces.value = pieces.value.filter(p => p.square !== to)
  // Move the piece
  const piece = pieces.value.find(p => p.square === from)
  if (piece) {
    piece.square = to
  }
}

// Try to make a move (used by both click and drag)
const tryMove = (from, to) => {
  if (questionState.value === 'solution') return false
  
  const movingPiece = getPieceOnSquare(from)
  if (!movingPiece || !movingPiece.type.startsWith('w')) return false
  
  // Check if this is the correct move
  const correct = currentQuestion.value.correctMove
  if (from === correct.from && to === correct.to) {
    // Check if it's a capture (piece on target square)
    const isCapture = getPieceOnSquare(to) !== undefined
    // Check if it's checkmate (move ends with #)
    const isCheckmate = currentQuestion.value.solution.toLowerCase().includes('checkmate')
    
    // Correct move!
    makeMove(from, to)
    streak.value++
    questionState.value = 'solution'
    lastMove.value = { from, to }
    
    // Play appropriate sound
    if (isCheckmate) {
      playSound('check')
    } else if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    return true
  } else {
    // Wrong move - reset streak
    streak.value = 0
    questionState.value = 'wrong'
    return false
  }
}

// ============================================
// DRAG & DROP
// ============================================
const handleDragStart = (event, square) => {
  if (questionState.value === 'solution') return
  
  const piece = getPieceOnSquare(square)
  if (!piece || !piece.type.startsWith('w')) return
  
  // Prevent default drag behavior
  event.preventDefault()
  
  isDragging.value = true
  draggedPiece.value = piece
  draggedFrom.value = square
  selectedSquare.value = square
  
  // Get initial position
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  dragPosition.value = { x: clientX, y: clientY }
}

const handleDragMove = (event) => {
  if (!isDragging.value) return
  
  event.preventDefault()
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  dragPosition.value = { x: clientX, y: clientY }
}

const handleDragEnd = (event) => {
  if (!isDragging.value) return
  
  const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
  const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
  
  // Find which square we dropped on
  const targetSquare = getSquareFromPosition(clientX, clientY)
  
  if (targetSquare && targetSquare !== draggedFrom.value) {
    tryMove(draggedFrom.value, targetSquare)
  }
  
  // Reset drag state
  isDragging.value = false
  draggedPiece.value = null
  draggedFrom.value = null
  selectedSquare.value = null
}

const getSquareFromPosition = (x, y) => {
  if (!boardRef.value) return null
  
  const rect = boardRef.value.getBoundingClientRect()
  const squareSize = rect.width / 8
  
  const col = Math.floor((x - rect.left) / squareSize)
  const row = Math.floor((y - rect.top) / squareSize)
  
  if (col < 0 || col > 7 || row < 0 || row > 7) return null
  
  const file = files[col]
  const rank = 8 - row
  return `${file}${rank}`
}

// Check if piece is being dragged (to hide it from original square)
const isPieceDragged = (square) => {
  return isDragging.value && draggedFrom.value === square
}

// ============================================
// ACTIONS
// ============================================
const handleHint = () => {
  if (questionState.value === 'solution') return
  streak.value = 0 // Reset streak on hint
  questionState.value = 'hint'
}

const openVideo = () => {
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalChallenges.value - 1) {
    currentQuestionIndex.value++
    loadQuestion(currentQuestionIndex.value)
  }
}

const handleComplete = () => {
  // TODO: Navigate to next lesson (to be implemented)
  console.log('Lesson complete! Moving to next lesson...')
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    loadQuestion(currentQuestionIndex.value)
  }
}

// ============================================
// INITIALIZATION
// ============================================
onMounted(() => {
  loadQuestion(0)
  
  // Add global event listeners for drag
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDragMove, { passive: false })
  document.addEventListener('touchend', handleDragEnd)
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
})
</script>

<template>
  <div class="app">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="chessboard" ref="boardRef">
          <div 
            v-for="square in squares" 
            :key="square"
            class="square"
            :class="[
              isLightSquare(square) ? 'light' : 'dark',
              { 'selected': isSelected(square), 'last-move': isLastMove(square) }
            ]"
            :data-square="square"
            @click="handleSquareClick(square)"
          >
            <!-- Piece -->
            <img 
              v-if="getPieceOnSquare(square) && !isPieceDragged(square)" 
              class="piece"
              :class="{ 'draggable': getPieceOnSquare(square)?.type.startsWith('w') }"
              :src="getPieceImage(getPieceOnSquare(square))"
              :alt="getPieceOnSquare(square).type"
              draggable="false"
              @mousedown="handleDragStart($event, square)"
              @touchstart="handleDragStart($event, square)"
            />
            <!-- File label (bottom row) -->
            <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
            <!-- Rank label (left column) -->
            <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
          </div>
        </div>
        
        <!-- Dragged piece (follows cursor) -->
        <img 
          v-if="isDragging && draggedPiece"
          class="dragged-piece"
          :src="getPieceImage(draggedPiece)"
          :style="{
            left: dragPosition.x + 'px',
            top: dragPosition.y + 'px'
          }"
        />
        
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
            <span>{{ lessonName }}</span>
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
                <div class="progress-fill" :style="{ width: progressPercent + '%', background: streakColor }"></div>
              </div>
              <div class="queen-badge">
                <img :src="`${base}icons/misc/Diamond.svg`" alt="" class="queen-diamond" />
                <CcIcon name="piece-fill-queen" :size="16" class="queen-icon" />
              </div>
            </div>
            <div class="streak" :style="{ color: streakColor }">
              <CcIcon name="element-fire-blank" :size="16" class="fire-icon" />
              <span>{{ streak }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <div class="action-buttons">
            <!-- Complete state: only Complete button -->
            <template v-if="questionState === 'solution' && currentQuestionIndex >= totalChallenges - 1">
              <CcButton 
                variant="primary" 
                size="large" 
                :icon="{ name: 'arrow-line-right' }"
                @click="handleComplete"
                class="complete-button"
              >
                Complete
              </CcButton>
            </template>
            <!-- Normal states -->
            <template v-else>
              <CcButton variant="secondary" size="large" :icon="{ name: icons.video }" @click="openVideo">Video</CcButton>
              <template v-if="questionState === 'solution'">
                <CcButton 
                  variant="primary" 
                  size="large" 
                  :icon="{ name: 'arrow-line-right' }"
                  @click="nextQuestion"
                >
                  Next
                </CcButton>
              </template>
              <template v-else>
                <CcButton variant="secondary" size="large" :icon="{ name: icons.hint }" @click="handleHint">Hint</CcButton>
              </template>
            </template>
          </div>
          <div class="toolbar">
            <CcIcon :name="icons.settings" :size="24" class="toolbar-icon" />
            <div class="toolbar-nav">
              <CcIcon :name="icons.prev" :size="24" class="toolbar-icon" @click="prevQuestion" />
              <CcIcon :name="icons.next" :size="24" class="toolbar-icon" @click="nextQuestion" />
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
  cursor: pointer;
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

.square.selected.light { background: #f6f669; }
.square.selected.dark { background: #bbcb44; }

.square.last-move.light { background: #f6f669; }
.square.last-move.dark { background: #bbcb44; }

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  user-select: none;
}

.piece.draggable {
  cursor: grab;
}

.piece.draggable:active {
  cursor: grabbing;
}

.dragged-piece {
  position: fixed;
  width: 8.5rem;
  height: 8.5rem;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
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
  border-radius: 99.9rem;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms cubic-bezier(0.4, 0, 0.2, 1);
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
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 2rem;
  transition: color 0.3s ease;
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

.action-buttons .complete-button :deep(button) {
  width: 100%;
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
