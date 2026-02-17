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
// Animation colors for brilliant and checkmate highlights (used in CSS v-bind)
const ANIMATION_COLORS = {
  brilliant: {
    overlay: '#26C2A3',    // Teal overlay
    coin: '#26C2A3',       // Teal coin
    textColor: '#1a9a82',  // Darker teal for text
  },
}

// Asset URLs (use BASE_URL for correct resolution in both dev and build)
const fionaAvatarUrl = import.meta.env.BASE_URL + 'images/fiona.png'

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

// Hint state
const hintHighlightSquare = ref(null)  // square to highlight with blue overlay (piece to move)
const lastCorrectMessage = ref('')     // Persists the correct message through computer-moving/awaiting
const lastCorrectNotation = ref('')    // Persists the move notation through computer-moving/awaiting
const showMoveArrow = ref(false)       // whether the hint arrow is visible
const checkpointPieces = ref([]) // Saved board state for retry after wrong move

// Replay navigation (solved state)
const replayPly = ref(-1) // -1 means not replaying, 0 = initial, 1..n = after move n
const replayPositions = ref([]) // Array of board snapshots: [initial, after move 0, after move 1, ...]

// Build replay positions by replaying all moves from initial FEN
const buildReplayPositions = () => {
  const positions = []
  const boardState = parseFEN(puzzle.initialFEN)
  positions.push({ pieces: JSON.parse(JSON.stringify(boardState)), lastMove: null })
  
  for (const move of puzzle.moves) {
    // Remove captured piece
    const idx = boardState.findIndex(p => p.square === move.to)
    if (idx !== -1) boardState.splice(idx, 1)
    // Move the piece
    const piece = boardState.find(p => p.square === move.from)
    if (piece) piece.square = move.to
    positions.push({ pieces: JSON.parse(JSON.stringify(boardState)), lastMove: { from: move.from, to: move.to } })
  }
  replayPositions.value = positions
}

// Navigate to a specific replay ply
const replayGoTo = (ply) => {
  if (replayPositions.value.length === 0) return
  const clamped = Math.max(0, Math.min(ply, replayPositions.value.length - 1))
  replayPly.value = clamped
  const snapshot = replayPositions.value[clamped]
  pieces.value = JSON.parse(JSON.stringify(snapshot.pieces))
  lastMove.value = snapshot.lastMove
  checkmateEffectSquares.value = {}
  checkmateEffectIcons.value = {}
  checkmateEffectLabels.value = {}
}

const replayBack = () => {
  if (replayPly.value === -1) {
    // First click: enter replay at the last ply minus 1
    buildReplayPositions()
    showCoachBubble.value = false
    coachBubblePendingShow = false
    replayGoTo(replayPositions.value.length - 2)
  } else if (replayPly.value > 0) {
    replayGoTo(replayPly.value - 1)
  }
}

const replayForward = () => {
  if (replayPly.value === -1) return
  if (replayPly.value < replayPositions.value.length - 1) {
    replayGoTo(replayPly.value + 1)
  }
  // If we're back at the final position, exit replay mode, restore checkmate highlight, and show coach again
  if (replayPly.value === replayPositions.value.length - 1) {
    replayPly.value = -1
    const lastPuzzleMove = puzzle.moves[puzzle.moves.length - 1]
    if (lastPuzzleMove && lastPuzzleMove.isCheckmate && lastPuzzleMove.kingSquare) {
      // Re-show the checkmate effects (without animation — just the final state)
      const effects = {}
      const icons = {}
      const labels = {}
      effects[lastPuzzleMove.kingSquare] = 'checkmateblack'
      icons[lastPuzzleMove.kingSquare] = checkmateBlackIconSvg
      labels[lastPuzzleMove.kingSquare] = 'Checkmate'
      const winnerKing = pieces.value.find(p => p.type === 'wk')
      if (winnerKing) {
        effects[winnerKing.square] = 'winner'
        icons[winnerKing.square] = winnerIconSvg
        labels[winnerKing.square] = 'Winner'
      }
      checkmateEffectSquares.value = effects
      checkmateEffectIcons.value = icons
      checkmateEffectLabels.value = labels
    }
    showCoachBubble.value = true
  }
}
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
const movingPiece = ref(null)  // { type, fromSquare, toSquare, startPos, endPos }
const brilliantHighlight = ref(null)  // Square to highlight with brilliant animation

// Animated checkmate effect state (Chess.com chessboard style)
// Maps square -> effect type class name (e.g. 'checkmateblack', 'winner')
const checkmateEffectSquares = ref({})
const checkmateEffectIcons = ref({})    // Maps square -> SVG innerHTML for the icon
const checkmateEffectLabels = ref({})   // Maps square -> text label

// Animated effect SVG icons (from Chess.com chessboard library)
const checkmateBlackIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon slide" width="70%" height="70%" viewBox="0 0 18 19"><g id="mate"><path d="m 9.9742023,6.6728298 2.42e-5,-2.42e-5 -0.00213,-0.00204 C 9.7700909,6.4784115 9.5898002,6.3078138 9.4249699,6.1860933 9.2615451,6.0654149 9.0947034,5.9782259 8.9192108,5.9782259 c -0.25168,0 -0.4344667,0.1056058 -0.549814,0.2695152 -0.1111793,0.1579967 -0.1529321,0.3598302 -0.1529321,0.5495475 0,0.3631985 0.1493457,0.7186669 0.3948949,1.0255973 l 0.036373,0.045485 h 0.058231 1.8222934 0.121163 V 7.7472074 c 0,-0.062738 0.0045,-0.1263489 0.0094,-0.192189 l 6.79e-4,-0.00921 c 0.0046,-0.061284 0.0093,-0.1257673 0.0093,-0.1863246 V 7.30329 l -0.04289,-0.0363 C 10.37581,7.055366 10.165155,6.8638071 9.9742023,6.6728298 Z M 8.7059637,10.223781 h -0.058231 l -0.036373,0.04546 c -0.2455492,0.306954 -0.3948949,0.662399 -0.3948949,1.025621 0,0.189718 0.041753,0.391551 0.1529321,0.549524 0.1153473,0.163909 0.298134,0.269539 0.549814,0.269539 0.1754926,0 0.3423343,-0.08719 0.5057591,-0.207867 0.1648303,-0.121721 0.345121,-0.292319 0.5471241,-0.484677 l 2.43e-5,2.4e-5 0.00208,-0.0021 c 0.1909566,-0.19096 0.4016116,-0.382519 0.6517156,-0.594143 l 0.04289,-0.0363 v -0.0562 c 0,-0.06056 -0.0048,-0.125041 -0.0093,-0.186349 l -6.79e-4,-0.0092 c -0.0049,-0.06584 -0.0094,-0.12945 -0.0094,-0.192188 V 10.223781 H 10.528257 Z M 14.663966,4.902295 h 0.208401 v 0.2084006 9.93e-5 l 0.0065,7.8706591 v 9.7e-5 0.208304 H 14.670436 14.55412 c -0.512351,0 -0.925154,-0.0027 -1.261842,-0.179928 l -0.0024,-0.0013 -0.0024,-0.0011 c -0.294717,-0.138683 -0.506995,-0.38084 -0.634046,-0.780096 l -0.04771,-0.149976 -0.132794,0.0845 c -0.389055,0.247585 -0.730662,0.573344 -1.056979,0.884515 -0.04173,0.03979 -0.08319,0.07931 -0.124459,0.118425 l -2.4e-5,-2.4e-5 -0.0023,0.0023 -0.02246,0.02249 c -0.696009,0.69613 -1.3763643,1.376606 -2.4702007,1.376606 -1.5837231,0 -2.7092072,-1.111695 -2.7092072,-2.631662 0,-0.757682 0.1705492,-1.383417 0.3033682,-1.762875 L 6.435997,10.042013 6.3016271,10.013224 5.7588163,9.8969076 5.6122817,9.8655021 v 0.1498789 0.770597 H 5.4038811 4.2794826 4.0904681 V 9.9378365 9.8166734 H 3.969305 3.3101776 3.1211632 V 9.6082728 8.4838791 8.2754786 H 3.3101776 3.969305 4.0904681 V 8.1543154 7.3061736 H 4.2794826 5.4038811 5.6122817 V 8.076771 8.2255594 L 5.7579924,8.195414 6.3201893,8.0790974 6.4618774,8.0498001 6.4081295,7.9154545 C 6.2579357,7.5399458 6.0872411,6.9154711 6.0872411,6.1575473 c 0,-1.5199695 1.1254841,-2.6316648 2.7092072,-2.6316648 0.9968332,0 1.6502897,0.5651455 2.2851117,1.1922446 h -0.0173 l 0.220735,0.2091227 c 0.04129,0.039104 0.08276,0.078642 0.124459,0.1184175 0.326317,0.3111784 0.667924,0.6369448 1.057003,0.8845295 l 0.13277,0.084499 0.04774,-0.1499757 C 12.773991,5.465466 12.986269,5.2233118 13.280986,5.0846237 l 0.0024,-0.00115 0.0024,-0.00126 C 13.622521,4.9050091 14.035323,4.902295 14.547649,4.902295 Z" fill="black" stroke="black" style="fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.242326;stroke-opacity:1" /></g></svg>`

const winnerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon slide" width="70%" height="70%" viewBox="0 0 18 19"><g id="winner"><path d="m 24.4334,39.6517 c 15.9034,0 22.8584,-4.7017 22.8584,-4.7017 l 0.975,-23.6167 c 0,-2.16663 -1.495,-2.79497 -3.25,-1.4083 L 34.1834,17.53 26.6868,2.66667 C 26.0151,0.911667 25.1484,0.5 24.5201,0.5 23.8918,0.5 22.9384,0.955 22.3534,2.66667 L 14.6834,17.53 3.85008,9.925 C 2.09508,8.53833 0.513416,9.16667 0.600083,11.3333 L 1.57508,34.95 c 0,0 6.955,4.55 22.85832,4.7017 z" fill="white" style="fill:#ffffff;fill-opacity:1" transform="matrix(0.25173118,0,0,0.25173118,2.8497971,2.8741344)" /></g></svg>`

// Refs for animation target positioning
const progressBarRef = ref(null)      // Reference to progress bar element

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
  if (puzzlePhase.value === 'solved') {
    return 'Solved!'
  }
  return '' // Let CoachBubble derive from state
})

// Coach message based on state
const coachMessage = computed(() => {
  if (puzzlePhase.value === 'intro') {
    return '26 days in a row — that\'s a chess marathon! Ready to solve another?'
  }
  if (puzzlePhase.value === 'solved') {
    return 'Nice job! To learn a little more about this puzzle, watch the video.'
  }
  switch (moveState.value) {
    case 'awaiting':
      if (currentMoveIndex.value === 0) return 'Find the best move for white.'
      return lastCorrectMessage.value || '' // Keep showing correct message until next move
    case 'wrong':
      lastCorrectMessage.value = ''
      if (lives.value === 0) return "Out of hearts! See the solution or keep trying on your own."
      return "There's a better move, try again."
    case 'hint':
      return puzzle.hint
    case 'correct': {
      const move = currentExpectedMove.value
      if (move?.isCheckmate) {
        lastCorrectMessage.value = `${move.notation}# Checkmate!`
      } else {
        lastCorrectMessage.value = `${move?.notation} is correct!`
      }
      return lastCorrectMessage.value
    }
    case 'computer-moving':
      return lastCorrectMessage.value || '' // Keep correct message during computer's turn
    default:
      return ''
  }
})

// Coach bubble state based on puzzle state
const coachState = computed(() => {
  if (puzzlePhase.value === 'intro') return 'default'
  if (puzzlePhase.value === 'solved') return 'correct'
  switch (moveState.value) {
    case 'wrong': return 'incorrect'
    case 'correct': return 'correct'
    case 'computer-moving': return lastCorrectMessage.value ? 'correct' : 'black-to-move'
    case 'awaiting': return lastCorrectMessage.value ? 'correct' : 'white-to-move'
    default: return 'white-to-move'
  }
})

// Move notation for correct/incorrect states
const moveNotation = computed(() => {
  if (!lastMove.value) return lastCorrectNotation.value || ''
  if (puzzlePhase.value === 'solved' && lives.value === 0) return ''
  if (moveState.value === 'correct') {
    const move = puzzle.moves.find(m => m.from === lastMove.value.from && m.to === lastMove.value.to)
    const notation = move ? move.notation : lastMove.value.to
    lastCorrectNotation.value = notation
    return notation
  }
  if (moveState.value === 'computer-moving' || moveState.value === 'awaiting') {
    return lastCorrectNotation.value || ''
  }
  if (moveState.value === 'wrong') {
    lastCorrectNotation.value = ''
    const pieceLetters = { 'wr': 'R', 'wn': 'N', 'wb': 'B', 'wq': 'Q', 'wk': 'K', 'br': 'R', 'bn': 'N', 'bb': 'B', 'bq': 'Q', 'bk': 'K' }
    const pieceLetter = pieceLetters[lastMove.value.pieceType] || ''
    return `${pieceLetter}${lastMove.value.to}`
  }
  return ''
})

// Coach bubble fade animation (match Skills app behavior)
const showCoachBubble = ref(true)
let coachBubblePendingShow = false
let solutionPlaying = false

let prevCoachSnapshot = ''
watch([coachMessage, coachHeaderText, coachState, moveNotation], (newVals, oldVals) => {
  if (solutionPlaying) return
  if (replayPly.value !== -1) return // Suppress coach during replay navigation
  const newMsg = newVals[0]
  if (!newMsg) {
    // Message became empty — hide the bubble (fade out)
    if (showCoachBubble.value) {
      showCoachBubble.value = false
    }
    coachBubblePendingShow = false
    prevCoachSnapshot = ''
    return
  }
  // If nothing meaningful changed, don't re-animate the bubble
  const snapshot = newVals.join('|')
  if (snapshot === prevCoachSnapshot) return
  prevCoachSnapshot = snapshot

  if (showCoachBubble.value) {
    coachBubblePendingShow = true
    showCoachBubble.value = false
  } else {
    // Bubble is already hidden — show it directly (no leave transition to wait for)
    showCoachBubble.value = true
  }
})

function onCoachBubbleLeave() {
  if (solutionPlaying) return
  if (replayPly.value !== -1) return // Don't re-show coach during replay
  if (coachBubblePendingShow && coachMessage.value) {
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

// Check if square has hint highlight (blue overlay on piece to move)
const hasHintHighlight = (square) => hintHighlightSquare.value === square

// Arrow data for hint move arrow (Chess.com style: single filled polygon with rectangular body + wide triangular head)
// Proportions from Chess.com's UniversalBoardDrawer: lineWidth=15, arrowheadWidth=55, arrowheadHeight=45, startOffset=20 per 100px square
const moveArrowData = computed(() => {
  if (!showMoveArrow.value) return null
  const expected = currentExpectedMove.value
  if (!expected) return null
  
  const toPixel = (sq) => {
    const file = sq.charCodeAt(0) - 'a'.charCodeAt(0)
    const rank = parseInt(sq[1]) - 1
    return {
      x: file * SQUARE_SIZE + SQUARE_SIZE / 2,
      y: (7 - rank) * SQUARE_SIZE + SQUARE_SIZE / 2
    }
  }
  
  const from = toPixel(expected.from)
  const to = toPixel(expected.to)
  
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return null
  
  const scale = SQUARE_SIZE / 100
  const bodyWidth = 15 * scale
  const headWidth = 55 * scale
  const headLength = 45 * scale
  const startOffset = 20 * scale
  
  const dirX = dx / len
  const dirY = dy / len
  const perpX = -dirY
  const perpY = dirX
  
  const neckDist = len - headLength
  
  const points = [
    { x: from.x + dirX * startOffset + perpX * bodyWidth / 2,
      y: from.y + dirY * startOffset + perpY * bodyWidth / 2 },
    { x: from.x + dirX * neckDist + perpX * bodyWidth / 2,
      y: from.y + dirY * neckDist + perpY * bodyWidth / 2 },
    { x: from.x + dirX * neckDist + perpX * headWidth / 2,
      y: from.y + dirY * neckDist + perpY * headWidth / 2 },
    { x: to.x, y: to.y },
    { x: from.x + dirX * neckDist - perpX * headWidth / 2,
      y: from.y + dirY * neckDist - perpY * headWidth / 2 },
    { x: from.x + dirX * neckDist - perpX * bodyWidth / 2,
      y: from.y + dirY * neckDist - perpY * bodyWidth / 2 },
    { x: from.x + dirX * startOffset - perpX * bodyWidth / 2,
      y: from.y + dirY * startOffset - perpY * bodyWidth / 2 },
  ]
  
  return {
    polygon: points.map(p => `${p.x},${p.y}`).join(' ')
  }
})

// Check if square has brilliant highlight
const hasBrilliantHighlight = (square) => brilliantHighlight.value === square

// Square size in pixels for animated effect (board is 68rem = 680px, 680/8 = 85px)
const squareSizePx = 85

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
  checkmateEffectSquares.value = {}
  checkmateEffectIcons.value = {}
  checkmateEffectLabels.value = {}
  hintHighlightSquare.value = null
  showMoveArrow.value = false
  moveState.value = 'awaiting'
  classificationSquare.value = null
  classificationType.value = null
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
  checkmateEffectSquares.value = {}
  checkmateEffectIcons.value = {}
  checkmateEffectLabels.value = {}
  hintHighlightSquare.value = null
  showMoveArrow.value = false
  replayPly.value = -1
  replayPositions.value = []
  lastCorrectMessage.value = ''
  lastCorrectNotation.value = ''
  classificationSquare.value = null
  classificationType.value = null
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

// Move classification effect on destination square (Chess.com board style)
const classificationSquare = ref(null)  // square to show classification on
const classificationType = ref(null)    // 'correct' or 'miss'

// Inline SVGs from Chess.com's chessboard library (viewBox 0 0 18 19)
const correctEffectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 19"><g id="correct"><g><path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path><path class="icon-background" fill="#81b64c" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path></g><g><path class="icon-component-shadow" opacity="0.2" d="M15.11,6.81,9.45,12.47,7.79,14.13a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.78a.39.39,0,0,1-.11-.28.39.39,0,0,1,.11-.27L4.28,7.85a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09l2.69,2.68,5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.81Z"></path><path class="icon-component" fill="#fff" d="M15.11,6.31,9.45,12,7.79,13.63a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.28A.39.39,0,0,1,2.78,9a.39.39,0,0,1,.11-.27L4.28,7.35a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09L7.52,10l5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.31Z"></path></g></g></svg>`

const missEffectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 19"><defs><style>.cls-1{fill:#f1f2f2;}.cls-2{fill:#FF7769;}.cls-3{opacity:.2;}.cls-4{opacity:.3;}</style></defs><g id="incorrect"><path class="cls-4" d="M9,.5C4.03,.5,0,4.53,0,9.5s4.03,9,9,9,9-4.03,9-9S13.97,.5,9,.5Z"/><path class="cls-2" d="M9,0C4.03,0,0,4.03,0,9s4.03,9,9,9,9-4.03,9-9S13.97,0,9,0Z"/><g class="cls-3"><path d="M13.99,12.51s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"/></g><path class="cls-1" d="M13.99,12.01s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"/></g></svg>`

// Edge detection for tucking effect icons (same as Chess.com's chessboard library)
const isEdgeTop = (square) => square.includes('8')
const isEdgeRight = (square) => square.includes('h')

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

// Trigger brilliant highlight animation on a square
const triggerBrilliantAnimation = (square) => {
  brilliantHighlight.value = square
  
  // Clear after 800ms (no falling, stays on board briefly)
  setTimeout(() => {
    brilliantHighlight.value = null
  }, 1200)
}

// Trigger animated checkmate effect (Chess.com chessboard library style)
// Shows effects on both the checkmated king (red/defeat) and the winning king (green/winner)
const triggerCheckmateAnimation = (loserKingSquare, isBlackKing, onComplete) => {
  // Find the winning king's square
  const winnerKingType = isBlackKing ? 'wk' : 'bk'
  const winnerKing = pieces.value.find(p => p.type === winnerKingType)
  const winnerKingSquare = winnerKing ? winnerKing.square : null
  
  // Set up effects on both squares
  const effects = {}
  const icons = {}
  const labels = {}
  
  // Loser king gets the checkmate effect (red)
  effects[loserKingSquare] = 'checkmateblack'
  icons[loserKingSquare] = checkmateBlackIconSvg
  labels[loserKingSquare] = 'Checkmate'
  
  // Winner king gets the winner effect (green crown)
  if (winnerKingSquare) {
    effects[winnerKingSquare] = 'winner'
    icons[winnerKingSquare] = winnerIconSvg
    labels[winnerKingSquare] = 'Winner'
  }
  
  checkmateEffectSquares.value = effects
  checkmateEffectIcons.value = icons
  checkmateEffectLabels.value = labels
  
  // Total animation: first-step (0.3s) + delay (0.7s) + second-step (0.3s) = 1.3s
  setTimeout(() => {
    if (onComplete) nextTick(() => onComplete())
  }, 1300)
}

// Schedule the next move after a correct player move
const scheduleNextMove = (afterDelay = 3800) => {
  setTimeout(() => {
    const nextIndex = currentMoveIndex.value + 1
    if (nextIndex >= puzzle.moves.length) {
      setTimeout(() => {
        puzzlePhase.value = 'solved'
        stopTimer()
        playPuzzleSound('puzzleSolved')
      }, 200)
      return
    }
    
    currentMoveIndex.value = nextIndex
    const nextMove = puzzle.moves[nextIndex]
    
    if (nextMove.isComputer) {
      // Computer auto-plays
      moveState.value = 'computer-moving'
      
      setTimeout(() => {
        classificationSquare.value = null
        classificationType.value = null
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
  classificationSquare.value = null
  classificationType.value = null
  
  const movingPieceObj = getPieceOnSquare(from)
  if (!movingPieceObj || !movingPieceObj.type.startsWith('w')) return false
  
  // Check if move is legal according to chess rules
  if (!isLegalMove(from, to)) {
    return false // Illegal move - don't allow it
  }
  
  // Clear hint visuals when user makes any move
  hintHighlightSquare.value = null
  showMoveArrow.value = false
  
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
    classificationSquare.value = to
    classificationType.value = 'correct'
    
    // Play appropriate sound
    playPuzzleSound('correct')
    
    if (isCheckmate) {
      playSound('check')
    } else if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Update progress immediately (no coin animation)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
    
    if (isCheckmate) {
      const isBlackKing = true // White checkmates black king
      triggerCheckmateAnimation(kingSquare, isBlackKing, () => {
        setTimeout(() => {
          puzzlePhase.value = 'solved'
          stopTimer()
          playPuzzleSound('puzzleSolved')
        }, 200)
      })
    } else {
      // Advance to next move after a short delay
      scheduleNextMove(1500)
    }
    
    return true
  } else {
    // Wrong move - still execute the move visually
    const wrongPiece = getPieceOnSquare(from)
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to, pieceType: wrongPiece?.type }
    classificationSquare.value = to
    classificationType.value = 'miss'
    
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
  if (moveState.value === 'hint') return // Already used hint
  streak.value = 0 // Reset streak on hint
  loseLife() // Lose a life (rightmost green heart becomes broken)
  moveState.value = 'hint'
  // Highlight the piece that needs to move with blue overlay
  const expected = currentExpectedMove.value
  if (expected) {
    hintHighlightSquare.value = expected.from
  }
}

const handleSolution = () => {
  // Lose all remaining lives
  lives.value = 0
  // Hide coach bubble during solution animation
  solutionPlaying = true
  showCoachBubble.value = false
  coachBubblePendingShow = false
  // Restore board (undo wrong move), then auto-play all remaining moves
  restoreCheckpoint()
  moveState.value = 'computer-moving'
  hintHighlightSquare.value = null
  showMoveArrow.value = false
  
  const remainingMoves = puzzle.moves.slice(currentMoveIndex.value)
  let delay = 400
  
  remainingMoves.forEach((move, i) => {
    setTimeout(() => {
      const isCapture = getPieceOnSquare(move.to) !== undefined
      makeMove(move.from, move.to)
      lastMove.value = { from: move.from, to: move.to }
      
      if (isCapture) {
        playSound('capture')
      } else {
        playSound('move')
      }
      
      currentMoveIndex.value = currentMoveIndex.value + 1
      displayedProgress.value = actualProgress.value
      displayedStreak.value = streak.value
      
      // After the last move, mark puzzle as solved
      if (i === remainingMoves.length - 1) {
        moveState.value = 'correct'
        setTimeout(() => {
          solutionPlaying = false
          puzzlePhase.value = 'solved'
          stopTimer()
          playPuzzleSound('puzzleSolved')
          // Show coach bubble after state has settled
          nextTick(() => {
            coachBubblePendingShow = false
            showCoachBubble.value = true
          })
        }, 1000)
      }
    }, delay)
    delay += 800
  })
}

const handleShowMoveArrow = () => {
  // Show the arrow pointing to where the piece should go and lose a life (from hint state)
  loseLife()
  showMoveArrow.value = true
}

const handleRetry = () => {
  restoreCheckpoint()
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

const openVideo = () => {
  // No-op for now
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
              <!-- Hint Highlight Overlay (blue, shows which piece to move) -->
              <div 
                v-if="hasHintHighlight(square)" 
                class="hint-highlight-overlay"
              ></div>

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

              <!-- Animated Checkmate Effect (Chess.com chessboard style) -->
              <div 
                v-if="checkmateEffectSquares[square]"
                class="animated-effect"
                :class="[
                  checkmateEffectSquares[square],
                  { 'tuck-top': isEdgeTop(square), 'tuck-right': isEdgeRight(square) }
                ]"
                :style="{ '--square-size': squareSizePx + 'px', '--target-icon-size': '18.75%', '--target-opacity': '1' }"
              >
                <div class="ae-square" :class="checkmateEffectSquares[square]"></div>
                <div class="ae-icon" v-html="checkmateEffectIcons[square]"></div>
                <div class="ae-icon-background" :class="checkmateEffectSquares[square]"></div>
                <div class="ae-text">{{ checkmateEffectLabels[square] }}</div>
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
              <!-- Move Classification Effect (Chess.com board style) -->
              <div 
                v-if="classificationSquare === square && classificationType"
                class="effect"
                :class="{ 'tuck-top': isEdgeTop(square), 'tuck-right': isEdgeRight(square) }"
                v-html="classificationType === 'correct' ? correctEffectSvg : missEffectSvg"
              ></div>

              <!-- File label (bottom row) -->
              <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
              <!-- Rank label (left column) -->
              <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
            </div>

            <!-- Hint Move Arrow (SVG overlay, Chess.com style) -->
            <svg v-if="showMoveArrow && moveArrowData" class="board-arrow-overlay" viewBox="0 0 680 680">
              <polygon
                :points="moveArrowData.polygon"
                fill="#F7A501" opacity="0.8"
              />
            </svg>

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

          <!-- Video Explanation Card (solved state) -->
          <div v-if="puzzlePhase === 'solved'" class="video-card">
            <img 
              class="video-card-avatar" 
              :src="fionaAvatarUrl" 
              alt="Fiona Steil-Antoni"
            />
            <div class="video-card-info">
              <p class="video-card-text">
                Learn more about this puzzle<br/>from <span class="video-card-title-badge">GM</span> <span class="video-card-name">{{ puzzle.results.videoInstructor.split('·')[0].trim().replace('GM ', '') }}</span>
              </p>
            </div>
            <CcButton variant="secondary" size="small" @click="openVideo">
              Watch Video
            </CcButton>
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
                variant="secondary" 
                size="large" 
                :icon="{ name: 'message-bubble-fill-pair' }"
              >
                Comments
              </CcButton>
              <CcButton 
                variant="primary" 
                size="large" 
                :icon="{ name: 'graph-nodes-share' }"
              >
                Share
              </CcButton>
            </template>
            <!-- Wrong move: Retry (has lives) / Solution + Keep Going (out of lives) -->
            <template v-else-if="moveState === 'wrong'">
              <template v-if="lives > 0">
                <CcButton variant="danger" size="large" :icon="{ name: 'arrow-spin-undo' }" @click="handleRetry">Retry</CcButton>
              </template>
              <template v-else>
                <CcButton variant="secondary" size="large" :icon="{ name: 'circle-fill-info' }" @click="handleSolution">Solution</CcButton>
                <CcButton variant="primary" size="large" :icon="{ name: 'arrow-line-right' }" @click="handleRetry">Keep Going</CcButton>
              </template>
            </template>
            <!-- Awaiting / hint / correct / computer-moving: Hint → Move flow -->
            <template v-else>
              <CcButton 
                variant="secondary" 
                size="large" 
                :icon="{ name: moveState === 'hint' ? 'circle-fill-question' : icons.hint }" 
                @click="moveState === 'hint' ? handleShowMoveArrow() : handleHint()"
              >
                {{ moveState === 'hint' ? 'Move' : 'Hint' }}
              </CcButton>
            </template>
          </div>
          <div class="toolbar">
            <div class="toolbar-left">
              <CcIconButton
                v-if="puzzlePhase === 'solved'"
                :icon="{ name: 'arrow-spin-undo', variant: 'glyph' }"
                variant="ghost"
                size="small"
                :iconSize="20"
                @click="resetPuzzle"
              />
              <CcIconButton
                v-else
                :icon="{ name: 'graph-nodes-share', variant: 'glyph' }"
                variant="ghost"
                size="small"
                :iconSize="20"
              />
              <CcIconButton
                v-if="puzzlePhase === 'solved'"
                :icon="{ name: 'tool-magnifier-checker-1', variant: 'glyph' }"
                variant="ghost"
                size="small"
                :iconSize="20"
              />
            </div>
            <div v-if="puzzlePhase === 'solved'" class="toolbar-nav">
              <CcIconButton
                :icon="{ name: 'arrow-chevron-left', variant: 'glyph' }"
                variant="ghost"
                size="small"
                :iconSize="20"
                :disabled="replayPly === 0"
                @click="replayBack"
              />
              <CcIconButton
                :icon="{ name: 'arrow-chevron-right', variant: 'glyph' }"
                variant="ghost"
                size="small"
                :iconSize="20"
                :disabled="replayPly === -1"
                @click="replayForward"
              />
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
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  user-select: none;
}

/* Fix: cc-button-small missing --fontSize and font-family in design system CSS */
.cc-button-small {
  --fontSize: 1.4rem;
  --borderRadius: var(--radius-5, .5rem);
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
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
  position: relative;
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

/* Correct move highlight - #acce59 at 50% (Chess.com puzzle classification) */
.square.last-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(172, 206, 89, 0.5); /* #acce59 at 50% */
  z-index: 1;
  pointer-events: none;
}

/* Incorrect move highlight - #c93430 at 50% (Chess.com puzzle classification) */
.square.wrong-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(201, 52, 48, 0.5); /* #c93430 at 50% */
  z-index: 1;
  pointer-events: none;
}

/* Move Classification Effect - exact Chess.com chessboard style */
/* Percentages converted from board-relative (12.5% = 1 square) to square-relative */
.effect {
  background-clip: content-box;
  border-radius: 50%;
  box-sizing: border-box;
  height: 100%;
  left: 44%;
  padding: 30%;
  pointer-events: none;
  position: absolute;
  top: -44%;
  width: 100%;
  z-index: 10;
}
.effect.tuck-right {
  margin-left: -16%;
}
.effect.tuck-top {
  margin-top: 16%;
}
.effect :deep(svg) {
  overflow: visible;
}

/* Hint highlight overlay - blue-200 (#009FD9) at 50% opacity */
.hint-highlight-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 159, 217, 0.5); /* blue-200 (#009FD9) at 50% */
  z-index: 1;
  pointer-events: none;
}

/* Hint move arrow - SVG overlay on the board */
.board-arrow-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
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
  padding: 1.6rem 2.4rem 2.4rem;
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

/* Video Explanation Card */
.video-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
  border-radius: 10px;
  width: 100%;
}

.video-card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 3px;
  object-fit: cover;
  flex-shrink: 0;
}

.video-card-info {
  flex: 1;
  min-width: 0;
  height: fit-content;
}

.video-card-text {
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--color-text-boldest, white);
  margin: 0;
}

.video-card-title-badge {
  display: inline-block;
  background: var(--color-bg-chesstitle, #7c2929);
  color: white;
  font-size: 10px;
  line-height: 10px;
  font-weight: 600;
  padding: 2px 3px;
  border-radius: 3px;
  vertical-align: middle;
}

.video-card-name {
  font-weight: 600;
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
  gap: 1.2rem;
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

.toolbar-left {
  display: flex;
}

.toolbar-nav {
  display: flex;
}

/* ========== BOARD WRAPPER ========== */
.board-wrapper {
  display: inline-block;
  position: relative;
  border-radius: 3px;
  overflow: visible; /* Allow animation elements to overflow */
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

/* ========== ANIMATED CHECKMATE EFFECT (Chess.com chessboard style) ========== */
/* Adapted from @chesscom/chessboard library - board-relative → square-relative */

.animated-effect {
  --first-step-duration: 0.3s;
  --second-step-duration: 0.3s;
  --delay: 0.7s;
  --square-alpha: 0.8;
  --icon-bg-scale: 1.0;
  --y-position: calc(0% + var(--inset-y-factor));
  --x-position: calc(100% + var(--inset-x-factor));
  --text-x-position: var(--x-position);
  --text-y-position: var(--y-position);
  --text-line-height: calc(var(--line-height-ratio) * var(--square-size));
  --icon-starting-y: 62.5%;
  --text-translate-x: -50%;
  --text-translate-y: -50%;
  --icon-bg-translate-x: -50%;
  --icon-bg-translate-y: -50%;
  --icon-translate-x: -50%;
  --icon-translate-y: -50%;
  --text-transform-origin: center center;
  --inset-x-factor: -5%;
  --inset-y-factor: 5%;
  --font-size-ratio: calc(18 / 82.5);
  --line-height-ratio: calc(30 / 82.5);
  --padding-ratio: calc(14 / 82.5);
  background-clip: content-box;
  box-sizing: border-box;
  color: #000000;
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
}

/* Tuck adjustments for edge squares */
.animated-effect.tuck-top {
  --y-position: calc(0% + var(--target-icon-size));
  --inset-y-factor: 0%;
  --half-text-line-height: calc(var(--text-line-height) / 2);
  --text-y-position: calc(calc(var(--y-position) - var(--target-icon-size)) + var(--half-text-line-height));
}
.animated-effect.tuck-right {
  --x-position: calc(100% - var(--target-icon-size));
  --inset-x-factor: 0%;
  --text-translate-x: -100%;
  --text-transform-origin: 100% center;
  --text-x-position: calc(var(--x-position) + var(--target-icon-size));
}

/* Color classes */
.animated-effect.checkmateblack, .animated-effect.checkmatewhite {
  color: rgb(224, 40, 40);
}
.animated-effect.winner {
  color: rgb(131, 184, 79);
}

/* Square overlay - colored background that fades in then out */
.animated-effect .ae-square {
  animation-delay: 0s, calc(var(--first-step-duration) + var(--delay));
  animation-duration: var(--first-step-duration), var(--second-step-duration);
  animation-fill-mode: forwards;
  animation-name: ae-squarefadein, ae-squarefadeout;
  background-color: #000000;
  height: 100%;
  position: absolute;
  width: 100%;
}
.animated-effect .ae-square.checkmateblack,
.animated-effect .ae-square.checkmatewhite {
  background-color: rgba(224, 40, 40, var(--square-alpha));
}
.animated-effect .ae-square.winner {
  background-color: rgba(131, 184, 79, var(--square-alpha));
}

/* Icon wrapper - fills the animated-effect so SVG percentages resolve correctly */
.animated-effect .ae-icon {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
/* Icon SVG - fades in at center, then slides to corner */
/* :deep() needed because v-html content doesn't get scoped attributes */
.animated-effect .ae-icon :deep(svg) {
  animation-delay: 0s, calc(var(--first-step-duration) + var(--delay));
  animation-duration: var(--first-step-duration), var(--second-step-duration);
  animation-fill-mode: forwards;
  animation-name: ae-fadeingrow, ae-slidecorner;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.35));
  left: 50%;
  overflow: visible;
  position: absolute;
  top: var(--icon-starting-y);
  transform: translate(-50%, -50%);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1), cubic-bezier(0.42, 0, 0.58, 1);
  z-index: 2;
}

/* Icon background - circular bg that appears at final corner position */
.animated-effect .ae-icon-background {
  animation-delay: calc(var(--first-step-duration) + var(--delay));
  animation-duration: var(--second-step-duration);
  animation-fill-mode: forwards;
  animation-name: ae-iconbackground;
  background-color: currentColor;
  border-radius: 50%;
  box-shadow: 0 1px rgba(0, 0, 0, 0.35);
  left: var(--x-position);
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: var(--y-position);
  transform: translate(var(--icon-bg-translate-x), var(--icon-bg-translate-y)) scale(var(--icon-bg-scale));
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1), cubic-bezier(0.42, 0, 0.58, 1);
  z-index: 1;
}

/* Text label - slides in, then shrinks away */
.animated-effect .ae-text {
  animation-delay: 0s, calc(var(--first-step-duration) + var(--delay));
  animation-duration: var(--first-step-duration), var(--second-step-duration);
  animation-fill-mode: forwards;
  animation-name: ae-slidein, ae-textshrink;
  background-color: white;
  border-radius: 500px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
  font-size: calc(var(--font-size-ratio) * var(--square-size));
  font-weight: bold;
  left: var(--text-x-position);
  line-height: var(--text-line-height);
  padding: 0 calc(var(--padding-ratio) * var(--square-size));
  pointer-events: none;
  position: absolute;
  transform: translate(var(--text-translate-x), var(--text-translate-y));
  transform-origin: var(--text-transform-origin);
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1), cubic-bezier(0.42, 0, 0.58, 1);
  white-space: nowrap;
  z-index: 1;
}

/* Keyframes - exact copies from Chess.com chessboard library */
@keyframes ae-fadeingrow {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes ae-slidecorner {
  from {
    left: 50%;
    top: var(--icon-starting-y);
    transform: translate(-50%, -50%);
  }
  to {
    left: var(--x-position);
    top: calc(var(--y-position) + 1%);
    transform: translate(var(--icon-translate-x), var(--icon-translate-y)) scale(0.55);
  }
}
@keyframes ae-slidein {
  from {
    opacity: 0;
    top: calc(var(--text-y-position) + 20%);
  }
  to {
    opacity: 1;
    top: var(--text-y-position);
  }
}
@keyframes ae-textshrink {
  from {
    opacity: 1;
    transform: translate(var(--text-translate-x), var(--text-translate-y));
  }
  to {
    opacity: 0;
    transform: translate(var(--text-translate-x), var(--text-translate-y)) scaleX(0);
  }
}
@keyframes ae-iconbackground {
  from {
    opacity: 0;
    padding: var(--target-icon-size) 40%;
  }
  to {
    opacity: 1;
    padding: var(--target-icon-size);
  }
}
@keyframes ae-squarefadein {
  from { opacity: 0; }
  to { opacity: var(--target-opacity); }
}
@keyframes ae-squarefadeout {
  from { opacity: var(--target-opacity); }
  to { opacity: 0; }
}
</style>
