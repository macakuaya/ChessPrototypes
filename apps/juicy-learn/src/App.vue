<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { CcButton, CcIconButton, CcIcon } from '@chesscom/design-system'
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
// LESSON DATA
// ============================================
const lessons = [
  {
    name: 'The Goals of Chess',
    introduction: "Let's review the key moves in chess: captures, check, and checkmate. This is how you build a lead and win the game!",
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
        kingSquare: 'g8',  // Checkmated king's square
        intro: 'White can check with the queen or with the rook. Which one is checkmate?',
        wrong: "There's a possible checkmate, but that's not it. Look at your checks and try again.",
        hint: "Find a way to check so that the black king can't capture the piece that attacks it.",
        solution: "Nice work! That's checkmate!",
      },
      {
        fen: '3k4/R7/1R6/8/8/7P/3q2PK/8 w - - 0 1',
        correctMove: { from: 'b6', to: 'b8', piece: 'R' }, // Rb8#
        kingSquare: 'd8',  // Checkmated king's square
        intro: 'White has several checks, but only one is mate. Can you find it?',
        wrong: "There's a checkmate, but that's not it. Look at your checks and try again.",
        hint: "Look at your checks. See if you can find one that Black can't escape.",
        solution: 'Checkmate! Well done!',
      },
    ],
  },
  {
    name: 'Evaluating Captures',
    introduction: "Each piece has a numerical value that can help you evaluate whether exchanging it makes sense. Pawns are 1 point, knights are 3 points, bishops are 3 points, rooks are 5 points, queens are 9 points, kings are the whole game! Let's work on evaluating captures and making the right choices.",
    questions: [
      {
        fen: '3q2k1/2p2npp/4p3/5p2/3Q3B/4P3/5P2/6K1 w - - 0 1',
        correctMove: { from: 'h4', to: 'd8', piece: 'B' }, // Bxd8
        intro: "What is White's best capture?",
        wrong: "There's a better move. Try again and look for the strongest capture.",
        hint: "Find the safest way to capture Black's queen.",
        solution: 'Good work! White wins the queen and soon wins the game.',
      },
      {
        fen: '2r4k/p5pp/1b3n2/3Np3/P3Pp2/2r2B1P/5PP1/R4RK1 w - - 0 1',
        correctMove: { from: 'd5', to: 'c3', piece: 'N' }, // Nxc3
        intro: 'Which move wins material for White?',
        wrong: 'This move does not gain material for White. Try again!',
        hint: 'Which black piece can be captured that is a greater value than the white knight?',
        solution: "Nice work! White traded a knight (3 points) for Black's rook (5 points).",
      },
      {
        fen: '5rk1/1p3pb1/4p3/8/p2n4/6B1/1P1R1P2/3R2K1 w - - 0 1',
        correctMove: { from: 'd2', to: 'd4', piece: 'R' }, // Rxd4
        intro: 'How can White win material?',
        wrong: "There's a better move. Try again and look for a strong capture.",
        hint: 'Winning a knight and bishop, but losing a rook, would be a good trade.',
        solution: "Great move! What's next?",
        continuation: {
          opponentMove: { from: 'g7', to: 'd4' }, // Bxd4 auto-played
          correctMove: { from: 'd1', to: 'd4', piece: 'R' }, // Rxd4
          intro: 'Black recaptured with the bishop. Can you find the next strong capture?',
          wrong: "There's a better move. Try again and look for a strong capture.",
          hint: 'Capture an undefended piece.',
          solution: 'Well played! White emerges with an extra bishop and good chances to win the game.',
        },
      },
      {
        fen: 'r2rn1k1/3nqp1p/pp2p1p1/2p3N1/2P2P2/1P4P1/P1Q2PBP/2RR2K1 w - - 0 2',
        correctMove: { from: 'g2', to: 'a8', piece: 'B' }, // Bxa8
        intro: 'With White to move, can you find a way to win material?',
        wrong: 'This move does not gain material for White. Try again!',
        hint: 'Look at the long light-squared diagonal...',
        solution: "You got it! White trades a bishop (3 points) for Black's rook (5 points).",
      },
      {
        fen: '3r2k1/4np2/p5b1/1p5p/2pN2p1/P5P1/1P2PP1P/R1N3K1 w - - 0 1',
        correctMove: { from: 'e2', to: 'e3' }, // e3
        intro: "White's knight on d4 is in trouble. Should White capture the pawn on b5, or is there a stronger defense for White?",
        wrong: 'This move does not save the knight. Try again!',
        hint: 'Find a move that safely guards the knight on d4.',
        solution: 'Great defense! White protects the knight with a pawn, so if Black captures the knight with the rook, White gains material.',
      },
    ],
  },
  {
    name: 'The Value of the Pieces',
    introduction: "Each chess piece has a value to help decide which captures are best. A pawn is worth 1 point. A knight is worth 3. A bishop is also worth 3. A rook is worth 5. The queen is worth 9. And the king is worth the whole game!",
    questions: [
      {
        fen: '6k1/8/4b3/8/4Rq2/8/6P1/6K1 w - - 0 1',
        correctMove: { from: 'e4', to: 'f4', piece: 'R' }, // Rxf4
        intro: "Let's practice capturing the most valuable pieces. Your rook can capture the black queen (9 points) or the black bishop (3 points). Which capture is best?",
        wrong: "There's a better option. Try again and look for the strongest capture.",
        hint: 'Find the way to capture the most valuable piece that you can.',
        solution: 'Good choice! The queen is definitely worth more than the bishop.',
      },
      {
        fen: '6k1/6p1/n6p/5r2/8/P2B4/1PP5/2K5 w - - 0 0',
        correctMove: { from: 'd3', to: 'f5', piece: 'B' }, // Bxf5
        intro: 'Would you like to capture the knight (3 points) or the rook (5 points)?',
        wrong: "There's a better move. Look for your possible captures and try to select the best one.",
        hint: 'Your bishop can capture a rook or a knight. Capture the one that\'s most valuable.',
        solution: "That's a great move! White goes from behind to ahead in one move.",
      },
      {
        fen: '6k1/5pp1/5n1p/p4b2/3Np3/4P3/5P2/R3K3 w Q - 0 1',
        correctMove: { from: 'd4', to: 'f5', piece: 'N' }, // Nxf5
        intro: 'White has two possible captures here. Which one is best?',
        wrong: "There's a better move. Look at all of your possible captures and try again.",
        hint: 'Your rook can capture a pawn and your knight can capture a bishop. Which one makes the most sense?',
        solution: 'Well done! White wins material and has a great position!',
      },
      {
        fen: '1k6/2p4p/1p4q1/1r6/7P/3Q2P1/5P2/5RK1 w - - 0 1',
        correctMove: { from: 'd3', to: 'b5', piece: 'Q' }, // Qxb5
        intro: 'Do you want to capture the black queen or the black rook? Check to see if either piece is defended.',
        wrong: "There's a better move. Look at your possible captures and try again.",
        hint: 'Capture an undefended black piece so you get to keep your queen.',
        solution: 'Good choice! White wins a rook and should win the game.',
      },
      {
        fen: '8/3k2q1/8/P6p/8/2B5/3n2PP/6K1 w - - 0 1',
        correctMove: { from: 'c3', to: 'g7', piece: 'B' }, // Bxg7
        intro: 'White has two possible captures. Which one is best?',
        wrong: "There's a much stronger move. Try to find the strongest capture.",
        hint: 'A queen is better than a knight. Make the strongest capture.',
        solution: 'Well done! White has a great position.',
      },
    ],
  },
]

// Current lesson index
const currentLessonIndex = ref(0)

// ============================================
// GAME STATE
// ============================================
const currentQuestionIndex = ref(0)
const lessonState = ref('lesson-intro') // 'lesson-intro' or 'playing'
const questionState = ref('intro') // 'intro', 'wrong', 'hint', 'solution'
const streak = ref(0)
const selectedSquare = ref(null)
const lastMove = ref(null) // { from, to }

// Multi-move continuation state
const continuationActive = ref(false)  // true when playing a continuation sub-move
const continuationData = ref(null)     // stores the continuation object from question data
const intermediateCorrectSquare = ref(null) // square for intermediate correct animation

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
const currentLesson = computed(() => lessons[currentLessonIndex.value])
const currentQuestion = computed(() => currentLesson.value.questions[currentQuestionIndex.value])
const totalChallenges = computed(() => currentLesson.value.questions.length)
const currentChallenge = computed(() => currentQuestionIndex.value + 1)

// Active move data: returns the continuation data when active, otherwise the question itself
const activeMoveData = computed(() => {
  if (continuationActive.value && continuationData.value) {
    return continuationData.value
  }
  return currentQuestion.value
})

// Whether the current question is fully solved (final move in solution state)
const isQuestionFullySolved = computed(() => {
  if (questionState.value !== 'solution') return false
  // If there's a continuation and it's not active yet, we're at an intermediate step
  if (currentQuestion.value.continuation && !continuationActive.value) return false
  return true
})

// Actual progress (internal)
const actualProgress = computed(() => {
  const completed = currentQuestionIndex.value + (isQuestionFullySolved.value ? 1 : 0)
  return (completed / totalChallenges.value) * 100
})
// Displayed progress (synced with explosion animation at 1350ms)
const displayedProgress = ref(0)
const displayedStreak = ref(0)
const lessonName = computed(() => currentLesson.value.name)

// Coach message based on state
const coachMessage = computed(() => {
  // Show lesson introduction text during lesson-intro state
  if (lessonState.value === 'lesson-intro') {
    return currentLesson.value.introduction
  }
  const q = activeMoveData.value
  switch (questionState.value) {
    case 'intro': return q.intro
    case 'wrong': return q.wrong
    case 'hint': return q.hint
    case 'solution': return q.solution
    default: return q.intro
  }
})

// Coach bubble state based on question state
const coachState = computed(() => {
  // During lesson intro, show neutral state based on first question's side to move
  if (lessonState.value === 'lesson-intro') {
    const fen = currentQuestion.value.fen
    const parts = fen.split(' ')
    const sideToMove = parts[1] || 'w'
    return sideToMove === 'w' ? 'white-to-move' : 'black-to-move'
  }
  switch (questionState.value) {
    case 'intro':
    case 'hint':
      // Determine which side to move from FEN (w = white, b = black)
      const fen = currentQuestion.value.fen
      const parts = fen.split(' ')
      const sideToMove = parts[1] || 'w' // Default to white if not specified
      return sideToMove === 'w' ? 'white-to-move' : 'black-to-move'
    case 'wrong':
      return 'incorrect'
    case 'solution':
      return 'correct'
    default:
      return 'white-to-move'
  }
})

// Move notation for correct/incorrect states
const moveNotation = computed(() => {
  if (!lastMove.value) return ''
  // Format: piece + destination square (e.g., "Rxd6", "Kg2", "e4")
  const correct = activeMoveData.value.correctMove
  const piece = correct.piece || ''
  const to = questionState.value === 'wrong' ? lastMove.value.to : correct.to
  // For non-pawn pieces, prepend the piece letter
  if (piece && piece !== 'P') {
    // Check if it's a capture (different source column)
    const solutionText = activeMoveData.value.solution || ''
    const isCapture = questionState.value === 'solution' && solutionText.toLowerCase().includes('capture')
    return isCapture ? `${piece}x${to}` : `${piece}${to}`
  }
  return to
})

// Coach bubble fade animation (match Skills app behavior)
const showCoachBubble = ref(true)
let coachBubblePendingShow = false

watch([coachMessage, coachState, moveNotation], () => {
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

// Load question position
const loadQuestion = (index) => {
  const q = currentLesson.value.questions[index]
  pieces.value = parseFEN(q.fen)
  questionState.value = 'intro'
  selectedSquare.value = null
  lastMove.value = null
  // Clear checkmate highlight when loading new question
  checkmateHighlight.value = null
  // Reset continuation state
  continuationActive.value = false
  continuationData.value = null
  intermediateCorrectSquare.value = null
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
  if (questionState.value === 'wrong') return false // Don't show yellow for wrong moves
  return lastMove.value.from === square || lastMove.value.to === square
}

// Check if square is part of a wrong move (for red highlight)
const isWrongMove = (square) => {
  if (!lastMove.value) return false
  if (questionState.value !== 'wrong') return false
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
  
  // Attempt move via tryMove (handles both single and multi-move questions)
  const from = selectedSquare.value
  const to = square
  
  tryMove(from, to)
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/9dc99f67-e73d-4770-bc76-e927450ee409',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.vue:666',message:'triggerCheckmateAnimation',data:{kingSquare,isBlackKing,checkmateKingColorSet:isBlackKing?'black':'white'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  
  // After animation completes (800ms), call onComplete for next animations
  // Don't clear checkmateHighlight here - it gets cleared when next animation starts
  setTimeout(() => {
    if (onComplete) nextTick(() => onComplete())
  }, 800)
}

// Auto-play the opponent's response move after an intermediate correct move
const autoPlayOpponentMove = (continuation) => {
  const oppMove = continuation.opponentMove
  const isCapture = getPieceOnSquare(oppMove.to) !== undefined
  
  // Execute opponent move on the board
  makeMove(oppMove.from, oppMove.to)
  lastMove.value = { from: oppMove.from, to: oppMove.to }
  
  // Play move/capture sound
  if (isCapture) {
    playSound('capture')
  } else {
    playSound('move')
  }
  
  // Activate continuation state
  continuationActive.value = true
  continuationData.value = continuation
  
  // Set question state to intro for the next sub-move
  questionState.value = 'intro'
  selectedSquare.value = null
}

// Try to make a move (used by both click and drag)
const tryMove = (from, to) => {
  if (questionState.value === 'solution') return false
  
  const movingPiece = getPieceOnSquare(from)
  if (!movingPiece || !movingPiece.type.startsWith('w')) return false
  
  // Check if move is legal according to chess rules
  if (!isLegalMove(from, to)) {
    return false // Illegal move - don't allow it
  }
  
  // Check if this is the correct move (use active move data for continuation support)
  const correct = activeMoveData.value.correctMove
  const hasContinuation = !continuationActive.value && currentQuestion.value.continuation
  
  if (from === correct.from && to === correct.to) {
    // Check if it's a capture (piece on target square)
    const isCapture = getPieceOnSquare(to) !== undefined
    
    if (hasContinuation) {
      // ---- INTERMEDIATE CORRECT MOVE (has continuation) ----
      // Don't increment streak yet; save it for the final move
      makeMove(from, to)
      questionState.value = 'solution' // Shows intermediate solution text in coach bubble
      lastMove.value = { from, to }
      
      // Play correct sound + move/capture sound
      playPuzzleSound('correct')
      if (isCapture) {
        playSound('capture')
      } else {
        playSound('move')
      }
      
      // Show green checkmark badge on the square
      intermediateCorrectSquare.value = to
      
      // After 500ms, auto-play opponent response
      setTimeout(() => {
        intermediateCorrectSquare.value = null
        autoPlayOpponentMove(currentQuestion.value.continuation)
      }, 500)
      
      return true
    } else {
      // ---- FINAL CORRECT MOVE (no continuation, or already in continuation) ----
      // Check if it's checkmate (has kingSquare field in lesson data)
      const isCheckmate = currentQuestion.value.kingSquare != null
      const kingSquare = currentQuestion.value.kingSquare
      
      // Correct move!
      makeMove(from, to)
      streak.value++
      questionState.value = 'solution'
      lastMove.value = { from, to }
      
      // Play appropriate sound - use puzzle correct sound
      playPuzzleSound('correct')
      
      // Also play the move/capture/check sound for tactile feedback
      if (isCheckmate) {
        playSound('check')
      } else if (isCapture) {
        playSound('capture')
      } else {
        playSound('move')
      }
      
      // Trigger animations based on whether it's a checkmate
      if (isCheckmate) {
        // Determine king color based on side to move (FEN has 'w' = white to move, so black king is checkmated)
        const isBlackKing = currentQuestion.value.fen.includes(' w ')
        
        // Trigger checkmate animation first, then regular animations
        triggerCheckmateAnimation(kingSquare, isBlackKing, () => {
          triggerCorrectMoveAnimations(to, streak.value)
        })
      } else {
        // Regular two-animation sequence (Correct! then Streak X)
        triggerCorrectMoveAnimations(to, streak.value)
      }
      
      return true
    }
  } else {
    // Wrong move - still execute the move visually
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to }
    
    // Play incorrect sound for wrong move
    playPuzzleSound('incorrect')
    
    // Also play the move/capture sound for tactile feedback
    if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Reset streak and set wrong state
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

const showSolution = () => {
  if (continuationActive.value && continuationData.value) {
    // Show solution for the continuation move
    const correct = continuationData.value.correctMove
    makeMove(correct.from, correct.to)
    questionState.value = 'solution'
    lastMove.value = { from: correct.from, to: correct.to }
    playSound('move')
  } else if (currentQuestion.value.continuation) {
    // Show solution for intermediate move, then auto-play opponent and show final solution
    const correct = currentQuestion.value.correctMove
    makeMove(correct.from, correct.to)
    lastMove.value = { from: correct.from, to: correct.to }
    playSound('move')
    // Auto-play opponent move and show continuation solution
    const cont = currentQuestion.value.continuation
    setTimeout(() => {
      autoPlayOpponentMove(cont)
      // Now show the final solution
      const finalCorrect = cont.correctMove
      makeMove(finalCorrect.from, finalCorrect.to)
      questionState.value = 'solution'
      lastMove.value = { from: finalCorrect.from, to: finalCorrect.to }
      playSound('move')
    }, 500)
  } else {
    // Normal single-move solution
    const correct = currentQuestion.value.correctMove
    makeMove(correct.from, correct.to)
    questionState.value = 'solution'
    lastMove.value = { from: correct.from, to: correct.to }
    playSound('move')
  }
  // Update progress immediately (no animation)
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

const handleRetry = () => {
  if (continuationActive.value) {
    // Retry from the continuation position: re-parse original FEN,
    // replay the first correct move, then replay the opponent move
    const q = currentQuestion.value
    const cont = q.continuation
    pieces.value = parseFEN(q.fen)
    makeMove(q.correctMove.from, q.correctMove.to)
    makeMove(cont.opponentMove.from, cont.opponentMove.to)
    // Reset state for continuation retry
    questionState.value = 'intro'
    selectedSquare.value = null
    lastMove.value = { from: cont.opponentMove.from, to: cont.opponentMove.to }
    intermediateCorrectSquare.value = null
  } else {
    loadQuestion(currentQuestionIndex.value)
  }
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

const openVideo = () => {
  window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')
}

const startLesson = () => {
  lessonState.value = 'playing'
  questionState.value = 'intro'
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < totalChallenges.value - 1) {
    currentQuestionIndex.value++
    loadQuestion(currentQuestionIndex.value)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
  }
}

const handleComplete = () => {
  // Play puzzle solved / level up sound
  playPuzzleSound('puzzleSolved')
  
  if (currentLessonIndex.value < lessons.length - 1) {
    // Move to next lesson
    currentLessonIndex.value++
    currentQuestionIndex.value = 0
    loadQuestion(0)
    // Reset progress but keep streak
    displayedProgress.value = 0
    lessonState.value = 'lesson-intro' // Show intro for new lesson
    questionState.value = 'intro'
    // streak.value stays the same - maintained across lessons
  } else {
    // All lessons complete
    console.log('All lessons complete!')
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    // Go to previous question in current lesson
    currentQuestionIndex.value--
    loadQuestion(currentQuestionIndex.value)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
  } else if (lessonState.value === 'playing') {
    // Go back to lesson intro from first question
    lessonState.value = 'lesson-intro'
  } else if (currentLessonIndex.value > 0) {
    // Go to previous lesson (last question)
    currentLessonIndex.value--
    const lastQuestionIndex = currentLesson.value.questions.length - 1
    currentQuestionIndex.value = lastQuestionIndex
    loadQuestion(lastQuestionIndex)
    displayedProgress.value = 100 // Previous lesson was completed
    displayedStreak.value = streak.value
    lessonState.value = 'playing' // Make sure we're in playing state
  }
}

// ============================================
// INITIALIZATION
// ============================================
// Load first question immediately during setup (fixes HMR issues)
loadQuestion(0)
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

              <!-- Intermediate Correct Badge (green coin at top-right, same position as skill/brilliant coins) -->
              <div 
                v-if="intermediateCorrectSquare === square" 
                class="intermediate-correct-badge"
              >
                <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
                  <circle cx="14.5" cy="14.5" r="14.5" fill="#81B64C"/>
                  <path d="M8.5 15L12.5 19L20.5 11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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
          <!-- Explosion Circle (appears at left edge as semicircle) -->
          <div 
            v-if="showExplosion" 
            class="explosion-circle"
          ></div>
          <!-- Coach -->
          <div class="coach-container">
            <CoachBubble 
              :state="coachState"
              :move-notation="moveNotation"
              :message="coachMessage"
              :show-tip="true"
              :visible="showCoachBubble"
              @after-leave="onCoachBubbleLeave"
            />
          </div>

          <!-- Progress (hidden during lesson intro) -->
          <div v-if="lessonState !== 'lesson-intro'" class="progress-section">
            <div class="progress-header">
              <div class="progress-label">
                <span>Challenge</span>
                <span class="progress-numbers mono">
                  <span>{{ currentChallenge }}</span>
                  <span class="progress-slash">/</span>
                  <span>{{ totalChallenges }}</span>
                </span>
              </div>
              <div v-if="displayedStreak > 0" class="streak" :style="{ color: streakColor }">
                <CcIcon name="element-fire-blank" :size="16" class="fire-icon" />
                <span>{{ displayedStreak }}</span>
              </div>
            </div>
            <div class="progress-row">
              <div class="progress-bar" ref="progressBarRef">
                <div class="progress-fill" :style="{ width: displayedProgress + '%', background: progressBarColor }"></div>
              </div>
              <div class="queen-badge">
                <img :src="`${base}icons/misc/Diamond.svg`" alt="" class="queen-diamond" />
                <CcIcon name="piece-fill-queen" :size="16" class="queen-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <div class="action-buttons">
            <!-- Lesson intro state: only Start button -->
            <template v-if="lessonState === 'lesson-intro'">
              <CcButton 
                variant="primary" 
                size="large" 
                :icon="{ name: 'arrow-line-right' }"
                @click="startLesson"
                class="start-button"
              >
                Start
              </CcButton>
            </template>
            <!-- Complete state: only Complete button (fully solved, last question) -->
            <template v-else-if="isQuestionFullySolved && currentQuestionIndex >= totalChallenges - 1">
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
            <!-- Wrong state: Video, Solution, Retry -->
            <template v-else-if="questionState === 'wrong'">
              <CcButton variant="secondary" size="large" :icon="{ name: icons.video }" @click="openVideo">Video</CcButton>
              <CcButton variant="secondary" size="large" :icon="{ name: 'circle-fill-question' }" @click="showSolution">Solution</CcButton>
              <CcButton variant="danger" size="large" :icon="{ name: 'arrow-spin-undo' }" @click="handleRetry">Retry</CcButton>
            </template>
            <!-- Normal states (intro, hint, solution) -->
            <template v-else>
              <CcButton variant="secondary" size="large" :icon="{ name: icons.video }" @click="openVideo">Video</CcButton>
              <template v-if="isQuestionFullySolved">
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
            <div v-if="lessonState !== 'lesson-intro'" class="toolbar-nav">
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
  position: relative; /* For explosion positioning */
  overflow: hidden; /* Clip left half of explosion to create semicircle */
}

.coach-container {
  max-height: 128px;
}

/* Progress Section */
.progress-section {
  display: flex;
  flex-direction: column;
  max-width: 50rem;
  overflow: visible; /* Allow explosion animation to overflow */
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* ========== INTERMEDIATE CORRECT BADGE ========== */
/* Small green checkmark coin at top-right of square */

.intermediate-correct-badge {
  position: absolute;
  top: 7px;
  left: 90%;
  transform: translate(-50%, -50%);
  width: 29px;
  height: 29px;
  z-index: 5;
  pointer-events: none;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
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
  font-family: 'Chess Sans', system-ui, sans-serif;
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
  font-family: 'Chess Sans', system-ui, sans-serif;
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
  font-family: 'Chess Sans', system-ui, sans-serif;
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
  font-family: 'Chess Sans', system-ui, sans-serif;
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
