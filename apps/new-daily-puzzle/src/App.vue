<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { CcButton, CcIconButton, CcIcon, CcDropdownButton } from '@chesscom/design-system'
// CcIconButton used for date picker arrows, CcDropdownButton for date selector
import CoachBubble from './components/CoachBubble.vue'
import { playSound } from '@chess/components/sounds'

// Puzzle sound URLs from Chess.com CDN
const PUZZLE_SOUNDS = {
  correct: 'https://www.chess.com/bundles/web/sounds/mp3/correct.mp3',
  incorrect: 'https://www.chess.com/bundles/web/sounds/mp3/incorrect.mp3',
  puzzleSolved: 'https://www.chess.com/bundles/web/sounds/puzzles/solving/puzzle-solved.wav',
  coinHit1: 'https://www.chess.com/bundles/web/sounds/puzzles/solving/coin_hit_1.wav',
  coinHit2: 'https://www.chess.com/bundles/web/sounds/puzzles/solving/coin_hit_2.wav',
  coinHit3: 'https://www.chess.com/bundles/web/sounds/puzzles/solving/coin_hit_3.wav',
  rewardCoin: 'https://www.chess.com/bundles/web/sounds/puzzles/solving/reward_points_coin.wav',
  levelUp: 'https://www.chess.com/bundles/web/sounds/puzzles/level_up/level_up_award.wav',
}

// Preload puzzle sounds for instant playback
const puzzleSoundCache = {}
const preloadPuzzleSound = (key) => {
  if (!puzzleSoundCache[key]) {
    puzzleSoundCache[key] = new Audio(PUZZLE_SOUNDS[key])
    puzzleSoundCache[key].preload = 'auto'
  }
  return puzzleSoundCache[key]
}

// Preload all puzzle sounds
Object.keys(PUZZLE_SOUNDS).forEach(preloadPuzzleSound)

// Play a puzzle sound
const playPuzzleSound = (key) => {
  const audio = preloadPuzzleSound(key)
  audio.currentTime = 0 // Reset to start
  audio.play().catch(error => console.warn('Failed to play sound:', error))
}

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
// ANIMATION COLORS (dynamic based on streak)
// ============================================
// Streak color values (matching CSS variables)
const STREAK_COLORS = {
  green: '#81B64C',      // --color-green-400 / text-win (first point)
  lowest: '#E3AA24',     // --color-streak-lowest (gold, 2 correct)
  low: '#E89B3C',        // --color-streak-low (light orange, 3-4 correct)
  medium: '#E07A3C',     // --color-streak-medium (orange, 5-6 correct)
  high: '#DC4C3C',       // --color-streak-high (red, 7+ correct)
}

// Get animation color based on streak (called BEFORE streak is incremented)
const getAnimationColor = (currentStreak) => {
  // After this move, streak will be currentStreak + 1
  const newStreak = currentStreak + 1
  if (newStreak <= 1) return STREAK_COLORS.green
  if (newStreak === 2) return STREAK_COLORS.lowest
  if (newStreak <= 4) return STREAK_COLORS.low
  if (newStreak <= 6) return STREAK_COLORS.medium
  return STREAK_COLORS.high
}

// Current animation color (reactive) - starts with green
const animationColor = ref(STREAK_COLORS.green)

// Brilliant colors (fixed)
const BRILLIANT_COLORS = {
  overlay: '#26C2A3',      // Teal overlay
  coin: '#26C2A3',         // Teal coin/pill
}

// Animation colors object for CSS v-bind (used in style section)
const ANIMATION_COLORS = {
  skill: {
    textColor: '#81B64C',  // Green text on white pill
  },
  brilliant: {
    overlay: '#26C2A3',    // Teal overlay
    coin: '#26C2A3',       // Teal coin
    textColor: '#1a9a82',  // Darker teal for text
  },
  checkmate: {
    overlay: '#FA412D',    // --color-red-300 (bg-loss)
    coin: '#FA412D',
    textColor: '#E02828',  // --color-red-400 for text
  },
}

// ============================================
// PUZZLE DATA
// ============================================
const puzzle = {
  title: 'Clear the Decks',
  date: 'March 19, 2024',
  solvedByText: 'Solved by Erik, drRittman, asma_abdel, and 1,269,372 more!',
  initialFEN: '6kb/7p/p1n3bP/1p4P1/4Bp2/BPq5/P1P2P2/4R3 w - - 0 1',
  hint: 'Look at the bishop on e4',
  moves: [
    { from: 'e4', to: 'd5', piece: 'B', notation: 'Bd5' },
    { from: 'g6', to: 'f7', piece: 'b', notation: 'Bf7', isComputer: true },
    { from: 'e1', to: 'e8', piece: 'R', notation: 'Re8', isCheckmate: true, kingSquare: 'g8' },
  ],
  results: {
    title: 'Awesome!',
    subtitle: 'You solved this puzzle in 3 minutes.\nYou are in the top 10% fastest!',
    totalSolved: 145,
    currentStreak: 26,
    bestRecord: 35,
    totalLives: 5,
    videoTitle: 'Learn more about this puzzle',
    videoInstructor: 'GM Fiona Steil-Antoni · 3min',
  },
}

// Player moves only (for progress tracking)
const playerMoveIndices = puzzle.moves
  .map((m, i) => m.isComputer ? -1 : i)
  .filter(i => i !== -1)
const totalPlayerMoves = playerMoveIndices.length // 2

// ============================================
// GAME STATE
// ============================================
const currentMoveIndex = ref(0) // Index into puzzle.moves for the next expected move
const puzzlePhase = ref('intro') // 'intro', 'playing', 'solved'
const moveState = ref('awaiting') // 'awaiting', 'wrong', 'hint', 'correct', 'computer-moving'
const streak = ref(0)
const selectedSquare = ref(null)
const lastMove = ref(null) // { from, to }
const checkpointPieces = ref([]) // Saved board state for retry after wrong move
const lives = ref(puzzle.results.totalLives) // Hearts / lives remaining
const timerSeconds = ref(0) // Puzzle timer in seconds
let timerInterval = null

// Format timer as M:SS
const timerDisplay = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60)
  const seconds = timerSeconds.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Start the puzzle timer
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timerSeconds.value++
  }, 1000)
}

// Stop the puzzle timer
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Lose a life on wrong move
const loseLife = () => {
  if (lives.value > 0) lives.value--
}

// Drag state
const isDragging = ref(false)
const draggedPiece = ref(null) // { type, square }
const draggedFrom = ref(null)
const dragPosition = ref({ x: 0, y: 0 })
const boardRef = ref(null)

// Animation state
const skillHighlight = ref(null)      // Square to highlight with skill animation (e.g., 'd6')
const skillHighlightLabel = ref(null) // Label text for skill highlight (e.g., 'Correct!')
const showExplosion = ref(false)      // Show the explosion circle at progress bar

// Piece movement animation state
const movingPiece = ref(null)  // { type, fromSquare, toSquare, startPos, endPos }
const brilliantHighlight = ref(null)  // Square to highlight with brilliant animation
const checkmateHighlight = ref(null)  // Square for checkmate animation (on checkmated king)
const checkmateKingColor = ref('black')  // 'black' or 'white' - color of the checkmated king icon

// Refs for animation target positioning
const progressBarRef = ref(null)      // Reference to progress bar element
const explosionTop = ref(168)         // Y position for explosion, updated dynamically

// Computed
const currentExpectedMove = computed(() => puzzle.moves[currentMoveIndex.value])
const totalChallenges = computed(() => totalPlayerMoves)
const completedPlayerMoves = computed(() => {
  return playerMoveIndices.filter(i => i < currentMoveIndex.value).length
    + (moveState.value === 'correct' && currentExpectedMove.value && !currentExpectedMove.value.isComputer ? 1 : 0)
})
const currentChallenge = computed(() => Math.min(completedPlayerMoves.value + 1, totalPlayerMoves))
// Actual progress (internal)
const actualProgress = computed(() => {
  return (completedPlayerMoves.value / totalPlayerMoves) * 100
})
// Displayed progress (synced with explosion animation at 1350ms)
const displayedProgress = ref(0)
const displayedStreak = ref(0)

// Coach header text (overrides state-based header)
const coachHeaderText = computed(() => {
  if (puzzlePhase.value === 'intro') {
    return puzzle.title
  }
  return '' // Let CoachBubble derive from state
})

// Coach message based on state
const coachMessage = computed(() => {
  if (puzzlePhase.value === 'intro') {
    return '26 days in a row — that\'s a chess marathon! Ready to solve another?'
  }
  if (puzzlePhase.value === 'solved') {
    return puzzle.results.title + ' Puzzle complete!'
  }
  switch (moveState.value) {
    case 'awaiting':
      return currentMoveIndex.value === 0
        ? 'Find the best move for white.'
        : 'Find the next move!'
    case 'wrong':
      return "That's not the right move. Try again!"
    case 'hint':
      return puzzle.hint
    case 'correct': {
      const move = currentExpectedMove.value
      if (move?.isCheckmate) return `${move.notation}# Checkmate!`
      return `${move?.notation} is correct!`
    }
    case 'computer-moving':
      return 'Black responds...'
    default:
      return ''
  }
})

// Coach bubble state based on puzzle state
const coachState = computed(() => {
  if (puzzlePhase.value === 'intro') return 'white-to-move'
  if (puzzlePhase.value === 'solved') return 'correct'
  switch (moveState.value) {
    case 'wrong': return 'incorrect'
    case 'correct': return 'correct'
    case 'computer-moving': return 'black-to-move'
    default: return 'white-to-move'
  }
})

// Move notation for correct/incorrect states
const moveNotation = computed(() => {
  if (!lastMove.value) return ''
  if (moveState.value === 'correct') {
    const move = puzzle.moves.find(m => m.from === lastMove.value.from && m.to === lastMove.value.to)
    return move ? move.notation : lastMove.value.to
  }
  if (moveState.value === 'wrong') {
    return lastMove.value.to
  }
  return ''
})

// Coach bubble fade animation (match Skills app behavior)
const showCoachBubble = ref(true)
let coachBubblePendingShow = false

watch([coachMessage, coachHeaderText, coachState, moveNotation], () => {
  if (showCoachBubble.value) {
    coachBubblePendingShow = true
    showCoachBubble.value = false
  } else {
    coachBubblePendingShow = true
  }
})

function onCoachBubbleLeave() {
  if (coachBubblePendingShow) {
    coachBubblePendingShow = false
    showCoachBubble.value = true
  }
}

// Streak color logic
// 0-1 = green (text-win), 2 = lowest, 3-4 = low, 5-6 = medium, 7+ = high
// Streak color uses displayedStreak (synced with explosion animation)
const streakColor = computed(() => {
  const s = displayedStreak.value
  if (s <= 1) return 'var(--color-text-win, #81b64c)'
  if (s === 2) return 'var(--color-streak-lowest)'
  if (s <= 4) return 'var(--color-streak-low)'
  if (s <= 6) return 'var(--color-streak-medium)'
  return 'var(--color-streak-high)'
})

// Progress bar color (synced with explosion)
const progressBarColor = computed(() => {
  const s = displayedStreak.value
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

// Board size in rem (680px at 62.5% font-size = 68rem)
const BOARD_SIZE = 680 // pixels
const SQUARE_SIZE = BOARD_SIZE / 8
const GAP_SIZE = 32 // gap between board and panel (3.2rem)

// Calculate coin fall position for a given square (as CSS values)
// Target: start of the progress bar in the sidebar
const getCoinFallPosition = (square) => {
  if (!square) return { x: '800%', y: '100%' }
  
  const fileIndex = files.indexOf(square[0])
  const rankIndex = 8 - parseInt(square[1], 10) // 0 = top row (rank 8)
  
  // Square's position on the board
  const squareLeft = fileIndex * SQUARE_SIZE
  const squareTop = rankIndex * SQUARE_SIZE
  
  // Target position: start of progress bar in sidebar
  // Board (680px) + Gap (32px) + Panel padding (24px) + small offset = ~750px from board left
  // Progress bar is roughly 240px from top of layout (header 48px + padding 24px + coach ~120px + gap 16px + label 20px)
  const targetX = BOARD_SIZE + GAP_SIZE + 40 // Start of progress bar
  const targetY = 240 // Approximate Y position of progress bar
  
  // Final position relative to square (for CSS left/top)
  const finalLeft = targetX - squareLeft
  const finalTop = targetY - squareTop
  
  // Convert to percentage of square size
  return {
    x: (finalLeft / SQUARE_SIZE) * 100,
    y: (finalTop / SQUARE_SIZE) * 100
  }
}

// Get CSS custom properties for the skill highlight square
const getSkillHighlightStyle = computed(() => {
  if (!skillHighlight.value) return {}
  const pos = getCoinFallPosition(skillHighlight.value)
  return {
    '--coin-fall-x': `${pos.x}%`,
    '--coin-fall-y': `${pos.y}%`
  }
})

// Check if square has skill highlight
const hasSkillHighlight = (square) => skillHighlight.value === square

// Check if square has brilliant highlight
const hasBrilliantHighlight = (square) => brilliantHighlight.value === square

// Check if square has checkmate highlight
const hasCheckmateHighlight = (square) => checkmateHighlight.value === square

// Computed: Checkmate king icon name (same as queen: piece-fill-king)
const checkmateKingIcon = computed(() => 'piece-fill-king')

// Computed: Checkmate icon color (matches the checkmated king's color)
// Use hex values since CcIcon doesn't interpret 'black'/'white' strings properly
const checkmateIconColor = computed(() => {
  return checkmateKingColor.value === 'black' ? '#262421' : '#ffffff'
})

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

// Save board state checkpoint (for retry after wrong move)
const saveCheckpoint = () => {
  checkpointPieces.value = JSON.parse(JSON.stringify(pieces.value))
}

// Restore board state from checkpoint
const restoreCheckpoint = () => {
  pieces.value = JSON.parse(JSON.stringify(checkpointPieces.value))
  selectedSquare.value = null
  lastMove.value = null
  checkmateHighlight.value = null
  moveState.value = 'awaiting'
}

// Load initial puzzle position
const loadPuzzle = () => {
  pieces.value = parseFEN(puzzle.initialFEN)
  saveCheckpoint()
  currentMoveIndex.value = 0
  puzzlePhase.value = 'intro'
  moveState.value = 'awaiting'
  selectedSquare.value = null
  lastMove.value = null
  checkmateHighlight.value = null
}

// Reset the puzzle back to the intro screen
const resetPuzzle = () => {
  stopTimer()
  timerSeconds.value = 0
  lives.value = puzzle.results.totalLives
  streak.value = 0
  displayedProgress.value = 0
  displayedStreak.value = 0
  loadPuzzle()
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

// Check if square is part of last move (for correct moves)
const isLastMove = (square) => {
  if (!lastMove.value) return false
  if (moveState.value === 'wrong') return false // Don't show green for wrong moves
  return lastMove.value.from === square || lastMove.value.to === square
}

// Check if square is part of a wrong move (for red highlight)
const isWrongMove = (square) => {
  if (!lastMove.value) return false
  if (moveState.value !== 'wrong') return false
  return lastMove.value.from === square || lastMove.value.to === square
}

// ============================================
// MOVE HANDLING
// ============================================
const handleSquareClick = (square) => {
  // Only allow moves during playing phase, when awaiting input
  if (puzzlePhase.value !== 'playing') return
  if (moveState.value === 'correct' || moveState.value === 'computer-moving') return
  
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
  
  // Attempt move via tryMove
  const from = selectedSquare.value
  tryMove(from, square)
  selectedSquare.value = null
}

// Convert square notation to coordinates
const squareToCoords = (square) => {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0) // 0-7 for a-h
  const rank = parseInt(square[1]) - 1 // 0-7 for 1-8
  return { file, rank }
}

// Check if path is clear between two squares (for sliding pieces)
const isPathClear = (fromFile, fromRank, toFile, toRank) => {
  const dFile = Math.sign(toFile - fromFile)
  const dRank = Math.sign(toRank - fromRank)
  
  let file = fromFile + dFile
  let rank = fromRank + dRank
  
  while (file !== toFile || rank !== toRank) {
    const square = String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1)
    if (getPieceOnSquare(square)) return false
    file += dFile
    rank += dRank
  }
  
  return true
}

// Check if a move is legal according to chess rules
const isLegalMove = (from, to) => {
  const piece = getPieceOnSquare(from)
  if (!piece) return false
  
  const fromCoords = squareToCoords(from)
  const toCoords = squareToCoords(to)
  const dFile = toCoords.file - fromCoords.file
  const dRank = toCoords.rank - fromCoords.rank
  const absDFile = Math.abs(dFile)
  const absDRank = Math.abs(dRank)
  
  // Can't capture your own piece
  const targetPiece = getPieceOnSquare(to)
  if (targetPiece) {
    const isWhite = piece.type.startsWith('w')
    const targetIsWhite = targetPiece.type.startsWith('w')
    if (isWhite === targetIsWhite) return false
  }
  
  // Get piece type (second character: k, q, r, b, n, p)
  const pieceType = piece.type[1]
  const isWhite = piece.type.startsWith('w')
  
  switch (pieceType) {
    case 'p': { // Pawn
      const direction = isWhite ? 1 : -1
      const startRank = isWhite ? 1 : 6
      
      // Normal move forward (no capture)
      if (dFile === 0 && dRank === direction && !targetPiece) {
        return true
      }
      // Double move from starting position
      if (dFile === 0 && dRank === 2 * direction && fromCoords.rank === startRank && !targetPiece) {
        // Check path is clear
        const midSquare = String.fromCharCode('a'.charCodeAt(0) + fromCoords.file) + (fromCoords.rank + direction + 1)
        if (!getPieceOnSquare(midSquare)) return true
      }
      // Capture diagonally
      if (absDFile === 1 && dRank === direction && targetPiece) {
        return true
      }
      return false
    }
    case 'n': // Knight
      return (absDFile === 2 && absDRank === 1) || (absDFile === 1 && absDRank === 2)
    
    case 'b': // Bishop
      if (absDFile !== absDRank) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'r': // Rook
      if (dFile !== 0 && dRank !== 0) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'q': // Queen
      if (dFile !== 0 && dRank !== 0 && absDFile !== absDRank) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'k': // King
      // Normal king move
      if (absDFile <= 1 && absDRank <= 1) return true
      // Castling (simplified - just check distance)
      if (absDFile === 2 && dRank === 0) return true
      return false
    
    default:
      return false
  }
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

// Trigger a single skill animation on a square
// color: the color to use for the animation
// label: the text to show (e.g., "Correct!", "Streak 1")
// onExplosion: callback when explosion happens (for progress bar/streak updates)
// onComplete: callback when animation finishes
const triggerSingleAnimation = (square, color, label, onExplosion = null, onComplete = null) => {
  // Note: checkmateHighlight is NOT cleared here - checkmate coin stays visible
  
  animationColor.value = color
  skillHighlight.value = square
  skillHighlightLabel.value = label
  
  // Calculate explosion position based on progress bar
  if (progressBarRef.value) {
    const barRect = progressBarRef.value.getBoundingClientRect()
    const panelContent = progressBarRef.value.closest('.panel-content')
    if (panelContent) {
      const panelRect = panelContent.getBoundingClientRect()
      explosionTop.value = (barRect.top + barRect.height / 2) - panelRect.top
    }
  }
  
  // After 800ms (morph) + 50ms pause + 500ms (fall), show explosion
  setTimeout(() => {
    showExplosion.value = true
    
    // Play coin hit sound when coin lands
    const coinSounds = ['coinHit1', 'coinHit2', 'coinHit3']
    const randomCoin = coinSounds[Math.floor(Math.random() * coinSounds.length)]
    playPuzzleSound(randomCoin)
    
    if (onExplosion) onExplosion()
    
    // Clear explosion after 500ms
    setTimeout(() => {
      showExplosion.value = false
    }, 500)
  }, 1350)
  
  // Clear highlight after total animation duration
  setTimeout(() => {
    skillHighlight.value = null
    skillHighlightLabel.value = null
    // Use nextTick to ensure DOM updates before starting next animation
    // This allows v-if to remove the element before re-adding it
    if (onComplete) {
      nextTick(() => {
        onComplete()
      })
    }
  }, 1850)
}

// Trigger the full correct move animation sequence:
// 1. "Correct!" animation (always green) - grows progress bar
// 2. "Streak X" animation (streak-colored) - updates streak counter/color
const triggerCorrectMoveAnimations = (square, streakNumber) => {
  const greenColor = STREAK_COLORS.green // Always green for "Correct!"
  const streakColor = getAnimationColor(streakNumber - 1) // Color for this streak level
  
  // Animation 1: "Correct!" (green)
  triggerSingleAnimation(
    square,
    greenColor,
    'Correct!',
    () => {
      // On explosion: grow the progress bar
      displayedProgress.value = actualProgress.value
    },
    () => {
      // On complete: start the streak animation
      triggerSingleAnimation(
        square,
        streakColor,
        `Streak ${streakNumber}`,
        () => {
          // On explosion: update streak counter and color
          displayedStreak.value = streak.value
          
          // Play level up sound on streak milestones (5, 7, 10+)
          if (streak.value === 5 || streak.value === 7 || streak.value >= 10) {
            playPuzzleSound('levelUp')
          }
        },
        null
      )
    }
  )
}

// Legacy function for backwards compatibility (used by solution button, etc.)
const triggerSkillAnimation = (square, label = 'Correct!', setColor = true) => {
  const color = setColor ? getAnimationColor(streak.value) : animationColor.value
  triggerSingleAnimation(
    square,
    color,
    label,
    () => {
      displayedProgress.value = actualProgress.value
      displayedStreak.value = streak.value
    },
    null
  )
}

// Trigger brilliant highlight animation on a square
const triggerBrilliantAnimation = (square) => {
  brilliantHighlight.value = square
  
  // Clear after 800ms (no falling, stays on board briefly)
  setTimeout(() => {
    brilliantHighlight.value = null
  }, 1200)
}

// Trigger checkmate animation on the checkmated king's square
// The coin stays in place until replaced by the next animation
const triggerCheckmateAnimation = (kingSquare, isBlackKing, onComplete) => {
  checkmateHighlight.value = kingSquare
  checkmateKingColor.value = isBlackKing ? 'black' : 'white'
  
  // After animation completes (800ms), call onComplete for next animations
  // Don't clear checkmateHighlight here - it gets cleared when next animation starts
  setTimeout(() => {
    if (onComplete) nextTick(() => onComplete())
  }, 800)
}

// Schedule the next move after a correct player move
const scheduleNextMove = (afterDelay = 3800) => {
  setTimeout(() => {
    const nextIndex = currentMoveIndex.value + 1
    if (nextIndex >= puzzle.moves.length) {
      puzzlePhase.value = 'solved'
      stopTimer()
      playPuzzleSound('puzzleSolved')
      return
    }
    
    currentMoveIndex.value = nextIndex
    const nextMove = puzzle.moves[nextIndex]
    
    if (nextMove.isComputer) {
      // Computer auto-plays
      moveState.value = 'computer-moving'
      
      setTimeout(() => {
        const isCapture = getPieceOnSquare(nextMove.to) !== undefined
        makeMove(nextMove.from, nextMove.to)
        lastMove.value = { from: nextMove.from, to: nextMove.to }
        
        if (isCapture) {
          playSound('capture')
        } else {
          playSound('move')
        }
        
        // Advance past computer move after a short pause
        setTimeout(() => {
          currentMoveIndex.value = nextIndex + 1
          moveState.value = 'awaiting'
          saveCheckpoint()
        }, 600)
      }, 800) // Delay before computer plays
    } else {
      moveState.value = 'awaiting'
      saveCheckpoint()
    }
  }, afterDelay)
}

// Try to make a move (used by both click and drag)
const tryMove = (from, to) => {
  if (puzzlePhase.value !== 'playing') return false
  if (moveState.value === 'correct' || moveState.value === 'computer-moving') return false
  
  const movingPieceObj = getPieceOnSquare(from)
  if (!movingPieceObj || !movingPieceObj.type.startsWith('w')) return false
  
  // Check if move is legal according to chess rules
  if (!isLegalMove(from, to)) {
    return false // Illegal move - don't allow it
  }
  
  // Check if this is the correct move
  const expected = currentExpectedMove.value
  if (from === expected.from && to === expected.to) {
    // Check if it's a capture (piece on target square)
    const isCapture = getPieceOnSquare(to) !== undefined
    const isCheckmate = expected.isCheckmate === true
    const kingSquare = expected.kingSquare
    
    // Correct move!
    makeMove(from, to)
    streak.value++
    moveState.value = 'correct'
    lastMove.value = { from, to }
    
    // Play appropriate sound
    playPuzzleSound('correct')
    
    if (isCheckmate) {
      playSound('check')
    } else if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Trigger animations based on whether it's a checkmate
    if (isCheckmate) {
      const isBlackKing = true // White checkmates black king
      
      triggerCheckmateAnimation(kingSquare, isBlackKing, () => {
        triggerCorrectMoveAnimations(to, streak.value)
      })
      // After all animations, mark puzzle as solved
      setTimeout(() => {
        puzzlePhase.value = 'solved'
        stopTimer()
        playPuzzleSound('puzzleSolved')
      }, 5000)
    } else {
      // Regular two-animation sequence (Correct! then Streak X)
      triggerCorrectMoveAnimations(to, streak.value)
      // After animations complete, advance to next move
      scheduleNextMove()
    }
    
    return true
  } else {
    // Wrong move - still execute the move visually
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to }
    
    // Play incorrect sound for wrong move
    playPuzzleSound('incorrect')
    
    if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Reset streak, lose a life, and set wrong state
    streak.value = 0
    loseLife()
    moveState.value = 'wrong'
    return false
  }
}

// ============================================
// DRAG & DROP
// ============================================
const handleDragStart = (event, square) => {
  if (puzzlePhase.value !== 'playing') return
  if (moveState.value === 'correct' || moveState.value === 'computer-moving') return
  
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
  if (moveState.value === 'correct' || moveState.value === 'computer-moving') return
  streak.value = 0 // Reset streak on hint
  moveState.value = 'hint'
}

const showSolution = () => {
  // Restore board first (undo the wrong move), then play the correct move
  restoreCheckpoint()
  const expected = currentExpectedMove.value
  makeMove(expected.from, expected.to)
  moveState.value = 'correct'
  lastMove.value = { from: expected.from, to: expected.to }
  playSound('move')
  // Update progress immediately (no animation)
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
  
  if (expected.isCheckmate) {
    setTimeout(() => {
      puzzlePhase.value = 'solved'
    }, 1000)
  } else {
    scheduleNextMove(1500)
  }
}

const handleRetry = () => {
  restoreCheckpoint()
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

const openVideo = () => {
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')
}

const startPuzzle = () => {
  puzzlePhase.value = 'playing'
  moveState.value = 'awaiting'
  saveCheckpoint()
  startTimer()
}

// ============================================
// INITIALIZATION
// ============================================
// Load puzzle position immediately during setup (fixes HMR issues)
loadPuzzle()
displayedProgress.value = 0
displayedStreak.value = 0

// Add global event listeners for drag immediately
// (using document listeners that work even before mount)
document.addEventListener('mousemove', handleDragMove)
document.addEventListener('mouseup', handleDragEnd)
document.addEventListener('touchmove', handleDragMove, { passive: false })
document.addEventListener('touchend', handleDragEnd)

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
  // Clean up timer
  stopTimer()
})
</script>

<template>
  <div class="app dark-mode">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="board-wrapper">
          <div class="chessboard" ref="boardRef">
            <div 
              v-for="square in squares" 
              :key="square"
              class="square"
              :class="[
                isLightSquare(square) ? 'light' : 'dark',
                { 'selected': isSelected(square), 'last-move': isLastMove(square), 'wrong-move': isWrongMove(square) }
              ]"
              :data-square="square"
              @click="handleSquareClick(square)"
            >
              <!-- Skill Highlight Overlay -->
              <div 
                v-if="hasSkillHighlight(square)" 
                class="skill-highlight-overlay"
              ></div>
              
              <!-- Skill +1 Icon (same animation as original star) -->
              <div 
                v-if="hasSkillHighlight(square)" 
                class="skill-plus-icon" 
                :style="getSkillHighlightStyle"
              >+1</div>
              
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
              
              <!-- Brilliant Icon (exclamation double) - scaled 1.8x from 16 to 29 -->
              <div 
                v-if="hasBrilliantHighlight(square)" 
                class="brilliant-icon-wrapper"
              >
                <CcIcon name="move-exclamation-double" :size="51" color="white" class="brilliant-icon" />
              </div>
              
              <!-- Brilliant Label Bubble (teal, stays on board) -->
              <div 
                v-if="hasBrilliantHighlight(square)" 
                class="brilliant-label-bubble"
              >
                <span class="brilliant-label-text">Brilliant!</span>
              </div>

              <!-- Checkmate Highlight Overlay (red at 80% opacity) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-highlight-overlay"
              ></div>
              
              <!-- Checkmate Icon (Rotated King - defeated) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-icon-wrapper"
              >
                <CcIcon :name="checkmateKingIcon" :size="51" class="checkmate-king-icon" :style="{ color: checkmateIconColor, fill: checkmateIconColor }" />
              </div>
              
              <!-- Checkmate Label Bubble (red, stays on board) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-label-bubble"
              >
                <span class="checkmate-label-text">Checkmate</span>
              </div>

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
          <div class="header-icon-container" @click="resetPuzzle" style="cursor: pointer;">
            <CcIcon :name="icons.back" :size="20" />
          </div>
          <div class="header-title">
            <img 
              src="https://www.chess.com/bundles/web/images/color-icons/calendar-dailypuzzle.svg" 
              alt="Daily Puzzle" 
              class="lessons-icon"
            />
            <span>Daily Puzzle</span>
          </div>
          <div class="header-icon-container">
            <CcIcon :name="icons.sound" :size="20" />
          </div>
        </header>

        <!-- Content -->
        <div class="panel-content">
          <!-- Explosion Circle (appears at left edge as semicircle) -->
          <div 
            v-if="showExplosion" 
            class="explosion-circle"
          ></div>

          <!-- Date Picker -->
          <div class="date-picker">
            <CcIconButton
              :icon="{ name: 'arrow-chevron-left', variant: 'glyph' }"
              variant="hovered"
              size="small"
              tooltip="Previous day"
            />
            <CcDropdownButton
              :label="puzzle.date"
              variant="ghost"
              size="small"
            />
            <CcIconButton
              :icon="{ name: 'arrow-chevron-right', variant: 'glyph' }"
              variant="hovered"
              size="small"
              tooltip="Next day"
            />
          </div>

          <!-- Coach -->
          <div class="coach-container">
            <CoachBubble 
              :state="coachState"
              :header-text="coachHeaderText"
              :move-notation="moveNotation"
              :message="coachMessage"
              :show-tip="true"
              :visible="showCoachBubble"
              @after-leave="onCoachBubbleLeave"
            />
          </div>

          <!-- Hearts + Timer -->
          <div class="hearts-timer-row">
            <div class="hearts">
              <CcIcon 
                v-for="i in puzzle.results.totalLives" 
                :key="i"
                :name="i <= lives ? 'emote-heart-fill' : 'emote-heart-broken'" 
                :size="24" 
                class="heart-icon"
                :class="{ 'heart-lost': i > lives }"
              />
            </div>
            <div class="timer">
              <CcIcon name="time-clock-hollow-hand-left" :size="24" />
              <span class="timer-text">{{ timerDisplay }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <!-- Solved by text (intro only) -->
          <p v-if="puzzlePhase === 'intro'" class="solved-by-text">{{ puzzle.solvedByText }}</p>

          <div class="action-buttons">
            <!-- Intro state: Start button -->
            <template v-if="puzzlePhase === 'intro'">
              <CcButton 
                variant="primary" 
                size="large" 
                @click="startPuzzle"
                class="start-button"
              >
                Start
              </CcButton>
            </template>
            <!-- Solved state -->
            <template v-else-if="puzzlePhase === 'solved'">
              <CcButton 
                variant="primary" 
                size="large" 
                :icon="{ name: 'element-star-fill' }"
                class="complete-button"
              >
                Puzzle Complete!
              </CcButton>
            </template>
            <!-- Wrong move: Solution + Retry -->
            <template v-else-if="moveState === 'wrong'">
              <CcButton variant="secondary" size="large" :icon="{ name: 'circle-fill-question' }" @click="showSolution">Solution</CcButton>
              <CcButton variant="danger" size="large" :icon="{ name: 'arrow-spin-undo' }" @click="handleRetry">Retry</CcButton>
            </template>
            <!-- Correct move animating / computer moving: empty -->
            <template v-else-if="moveState === 'correct' || moveState === 'computer-moving'">
              <!-- Waiting for animation / computer response -->
            </template>
            <!-- Awaiting / hint: Video + Hint -->
            <template v-else>
              <CcButton variant="secondary" size="large" :icon="{ name: icons.video }" @click="openVideo">Video</CcButton>
              <CcButton variant="secondary" size="large" :icon="{ name: icons.hint }" @click="handleHint">Hint</CcButton>
            </template>
          </div>
          <div class="toolbar">
            <CcIcon :name="icons.settings" :size="24" class="toolbar-icon" />
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
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  user-select: none;
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
  overflow: visible; /* Allow animations to overflow */
}

.chessboard {
  width: 68rem;
  height: 68rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-radius: 3px;
  overflow: hidden; /* Clip corners */
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: visible; /* Allow animations to overflow */
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

.square.selected.light { background: #f6f669; }
.square.selected.dark { background: #bbcb44; }

/* Success move highlight - green-300 (#81B64C) at 50% opacity overlay */
.square.last-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(129, 182, 76, 0.5); /* green-300 at 50% */
  z-index: 1;
  pointer-events: none;
}

/* Wrong move highlight - red-200 (#FF6352) at 50% opacity overlay */
.square.wrong-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 99, 82, 0.5); /* red-200 at 50% */
  z-index: 1;
  pointer-events: none;
}

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
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
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
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
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
  position: relative; /* For explosion positioning */
  overflow: hidden; /* Clip left half of explosion to create semicircle */
}

.coach-container {
  max-height: 96px;
}

/* Date Picker */
.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

/* Hearts + Timer */
.hearts-timer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.hearts {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.heart-icon {
  color: var(--color-green-300, #81B64C);
}

.heart-icon.heart-lost {
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  opacity: 0.4;
}

.timer {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
}

.timer-text {
  /* text-large-bold monospace: 16px/20px, 600, system font + tabular nums */
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'lnum' 1, 'tnum' 1;
}

/* Solved By Text */
.solved-by-text {
  /* paragraph-medium-bold: 14px/20px, 600, system font */
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  text-align: center;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.progress-slash {
  font-weight: 800;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  overflow: visible; /* Allow explosion animation to overflow */
}

.progress-bar {
  flex: 1;
  height: 1.6rem;
  background: var(--color-bg-progress-track, rgba(255, 255, 255, 0.1));
  border-radius: 1rem;
  overflow: visible; /* Allow explosion to overflow */
  position: relative; /* For explosion positioning */
}

.progress-fill {
  height: 100%;
  border-radius: 99.9rem;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1), background 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* Keep fill corners rounded */
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

.action-buttons .complete-button :deep(button),
.action-buttons .start-button :deep(button) {
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

/* ========== BOARD WRAPPER ========== */
.board-wrapper {
  display: inline-block;
  position: relative;
  border-radius: 3px;
  overflow: visible; /* Allow animation elements to overflow */
}

/* ========== EXPLOSION CIRCLE ========== */
/* Positioned at left edge of panel-content as semicircle */
.explosion-circle {
  position: absolute;
  background: v-bind('animationColor');
  border-radius: 50%;
  /* Position at left edge, dynamically aligned with progress bar center */
  left: 0;
  top: v-bind("explosionTop + 'px'");
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  /* Animation: grow from 36px to 300px, fade out */
  animation: explosion-expand 500ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes explosion-expand {
  0% {
    width: 36px;
    height: 36px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

/* ========== SKILL HIGHLIGHT ANIMATIONS ========== */
/* Scaled 1.8x for 680px board (85px squares vs original 47px squares) */

/* Skill Highlight Overlay */
.skill-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('animationColor');
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

/* Skill +1 Icon - same animation as original star, scaled 1.8x */
.skill-plus-icon {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Total: 800ms morph + 50ms pause + 500ms fall = 1350ms */
  animation: skill-plus-animate 1350ms cubic-bezier(0.8, 0, 1, 1) forwards;
}

@keyframes skill-plus-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    font-size: 27px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 2 (300ms = 22.2%) - visible, larger - 51px (60% of 85px square) */
  22.2% {
    opacity: 1;
    width: 51px;
    height: 51px;
    font-size: 33px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    width: 51px;
    height: 51px;
    font-size: 33px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 3: shrink into coin position (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 4: fall to target position, rotate -90° (1350ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, -50%) rotate(-90deg);
  }
}

/* Skill Label Bubble (transforms from white pill to colored circle, then falls) - scaled 1.8x */
.skill-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  --coin-color: v-bind('animationColor');
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
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 22.2%) */
  22.2% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: colored circle (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
  /* State 4: fall to target position (1350ms = 100%) */
  100% {
    opacity: 1;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
}

/* Text inside the pill - fades out - scaled 1.8x */
.skill-label-text {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('animationColor');
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
/* Same as skill animation but with teal color and no falling - scaled 1.8x */

/* Brilliant Highlight Overlay (teal color) */
.brilliant-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('ANIMATION_COLORS.brilliant.overlay');
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

/* Brilliant Icon Wrapper - contains the CcIcon - scaled 1.8x */
.brilliant-icon-wrapper {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  /* 800ms animation - no falling, stays at final position */
  animation: brilliant-icon-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

/* Brilliant icon fills its container */
.brilliant-icon {
  width: 100% !important;
  height: 100% !important;
}
.brilliant-icon :deep(svg) {
  width: 100% !important;
  height: 100% !important;
}

@keyframes brilliant-icon-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 2 (300ms = 37.5%) - centered, visible, 51px (60% of 85px square) */
  37.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 3: in teal coin at top right (800ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%);
  }
}

/* Brilliant Label Bubble (white pill → teal circle, stays on board) - scaled 1.8x */
.brilliant-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
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
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 37.5%) */
  37.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: teal circle (800ms = 100%) - scaled from 20px to 36px */
  100% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: v-bind('ANIMATION_COLORS.brilliant.coin');
  }
}

/* Text inside the brilliant pill - fades out - scaled 1.8x */
.brilliant-label-text {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('ANIMATION_COLORS.brilliant.textColor');
  white-space: nowrap;
  animation: brilliant-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}

/* ============================================ */
/* CHECKMATE ANIMATION (copy of brilliant but red, stays on board) */
/* ============================================ */

/* Checkmate Highlight Overlay (red at 80% opacity) */
.checkmate-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('ANIMATION_COLORS.checkmate.overlay');
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: checkmate-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-overlay-animate {
  0% { opacity: 0; }
  37.5% { opacity: 0.8; }
  62.5% { opacity: 0.8; }
  100% { opacity: 0; }  /* Fades out like brilliant */
}

/* Checkmate Icon Wrapper - contains the king icon - scaled 1.8x */
.checkmate-icon-wrapper {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  /* 800ms animation - no falling, stays at final position */
  animation: checkmate-icon-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

/* Rotated king icon (defeated/fallen look) */
.checkmate-king-icon {
  transform: rotate(-90deg);
  width: 100% !important;
  height: 100% !important;
}

/* Force fill color on checkmate king SVG */
.checkmate-king-icon :deep(svg),
.checkmate-king-icon :deep(svg path),
.checkmate-king-icon :deep(svg *) {
  fill: v-bind('checkmateIconColor') !important;
  color: v-bind('checkmateIconColor') !important;
  width: 100% !important;
  height: 100% !important;
}

@keyframes checkmate-icon-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 2 (300ms = 37.5%) - centered, visible, 51px (60% of 85px square) */
  37.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 3: in red coin at top right (800ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%);
  }
}

/* Checkmate Label Bubble (white pill → red circle, stays on board) - scaled 1.8x */
.checkmate-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  /* 800ms animation - no falling, stays at final position */
  animation: checkmate-pill-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 37.5%) */
  37.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: red circle (800ms = 100%) - scaled from 20px to 36px */
  100% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: v-bind('ANIMATION_COLORS.checkmate.coin');
  }
}

/* Text inside the checkmate pill - fades out - scaled 1.8x */
.checkmate-label-text {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('ANIMATION_COLORS.checkmate.textColor');
  white-space: nowrap;
  animation: checkmate-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
