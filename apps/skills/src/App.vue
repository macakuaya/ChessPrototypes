<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { CcButton, CcIcon } from '@chesscom/design-system'
import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'
import EvalBar from './components/EvalBar.vue'
import CoachBubble from './components/CoachBubble.vue'
import Board from './components/Board.vue'
import MoveListBar from './components/MoveListBar.vue'
import SkillsBottomSheet from './components/SkillsBottomSheet.vue'
import PrototypeMenu from './components/PrototypeMenu.vue'
import { BoardCelebration, SkillEarned, SkillUnlockedModal, playSound } from '@chess/components'
import { parsePGN, calculatePositions, boardToPieces, markBrilliantMoves } from './utils/chess.js'

const activePly = ref(0)
const showSkillsSheet = ref(false)
const showPrototypeMenu = ref(false)
const selectedPrototype = ref(localStorage.getItem('selectedPrototype') || 'skill-point-earned')

// Persist selected prototype to localStorage
watch(selectedPrototype, (newVal) => {
  localStorage.setItem('selectedPrototype', newVal)
})

// Skill earned animation state
const showMoveList = ref(true)
const showSkillEarned = ref(false)
const skillHighlightSquare = ref(null) // Square to highlight on board (e.g., 'd6')
const showExplosion = ref(false) // Show explosion circle after coin falls
const rookSacrificeCount = ref(0) // Track rook sacrifice skill count (starts at 0)
const queenSacrificeCount = ref(0) // Track queen sacrifice skill count (starts at 0)
const revealedSkillPlies = ref([]) // Track which skill plies have been revealed

// FTUE skill counters
const captureCount = ref(0)
const checkCount = ref(0)
const checkmateCount = ref(0)

// Board celebration state
const showBoardCelebration = ref(false)
const boardCelebrationData = ref({
  image: '',
  title: 'You Earned a Skill Point',
  subtitle: 'Keep reviewing until you master every skill'
})
const hasShownFirstSkillCelebration = ref(false) // Track if we've shown the first skill celebration
const showContinueButton = ref(false) // Show Continue button during celebration
const endOfFtueCompleted = ref(false) // Track if End of FTUE celebration has been completed
const allSkillsMasteredCompleted = ref(false) // Track if All Skills Mastered celebration has been completed

// Skill Unlocked Modal state
const showSkillUnlockedModal = ref(false)
const skillUnlockedData = ref({
  skillName: 'Queen Sacrifice',
  skillDescription: 'A tactical move where you deliberately give up your queen to gain a decisive advantage, often leading to checkmate or winning material back.',
  skillImage: '',
  showShareButton: false
})

// Brilliant animation state (triggers after skill animation)
const brilliantHighlightSquare = ref(null) // Square to highlight with brilliant animation
const brilliantRevealedPlies = ref([]) // Track which plies have been brilliant-revealed

// Skill earned data - set at trigger time, not reactive during animation
const skillEarnedData = ref({
  skillName: 'Rook Sacrifice',
  current: 0,
  max: 10,
  iconSrc: `${import.meta.env.BASE_URL}icons/skills/white_rook.png`
})

// Skills list for bottom sheet (reactive to earned skills)
// Only Royal Fork, Queen Sacrifice, Rook Sacrifice are active - rest are locked
const skillsList = computed(() => [
  { name: 'Royal Fork', current: 9, max: 10, icon: 'royal-fork' },
  { name: 'Queen Sacrifice', current: queenSacrificeCount.value, max: 10, icon: 'queen-sacrifice' },
  { name: 'Rook Sacrifice', current: rookSacrificeCount.value, max: 10, icon: 'rook-sacrifice' },
  { name: 'Skewer', current: 0, max: 10, icon: null, locked: true },
  { name: 'Knight Fork', current: 0, max: 10, icon: null, locked: true },
  { name: 'Fork', current: 0, max: 10, icon: null, locked: true },
  { name: 'Defend Piece', current: 0, max: 10, icon: null, locked: true },
  { name: 'Check', current: 0, max: 10, icon: null, locked: true },
  { name: 'Capture', current: 0, max: 10, icon: null, locked: true },
])

// FTUE skills list - basic skills for first time user (only first 3 visible)
const ftueSkillsList = computed(() => [
  { name: 'Capture', current: captureCount.value, max: 10, icon: 'capturing-dark-bishop' },
  { name: 'Check', current: checkCount.value, max: 10, icon: 'check' },
  { name: 'Checkmate', current: checkmateCount.value, max: 10, icon: 'checkmate-dark' },
])

// End of FTUE skills list - Checkmate first (in progress), then completed skills
const endOfFtueSkillsList = computed(() => [
  { name: 'Checkmate', current: checkmateCount.value, max: 10, icon: 'checkmate-dark' },
  { name: 'Capture', current: 10, max: 10, icon: 'capturing-dark-bishop', completed: true },
  { name: 'Check', current: 10, max: 10, icon: 'check', completed: true },
])

// End of FTUE skills list AFTER celebration - new skills unlocked with tabs
const endOfFtueAfterCelebrationSkillsList = computed(() => [
  { name: 'Recapture', current: 0, max: 10, icon: 'capturing-dark-bishop' },
  { name: 'Winning Capture', current: 0, max: 10, icon: 'capturing-dark-bishop' },
  { name: 'Blocks Attack', current: 0, max: 10, icon: 'check' },
  { name: 'Skewer', current: 0, max: 10, icon: null, locked: true },
  { name: 'Knight Fork', current: 0, max: 10, icon: null, locked: true },
  { name: 'Fork', current: 0, max: 10, icon: null, locked: true },
  { name: 'Defend Piece', current: 0, max: 10, icon: null, locked: true },
  { name: 'Royal Fork', current: 0, max: 10, icon: null, locked: true },
  { name: 'Pin', current: 0, max: 10, icon: null, locked: true },
])

// Mastered Skill skills list - Rook Sacrifice starts at 8/10, will master after 2 sacrifices
const masteredSkillSkillsList = computed(() => [
  { name: 'Royal Fork', current: 9, max: 10, icon: 'royal-fork' },
  { name: 'Rook Sacrifice', current: rookSacrificeCount.value, max: 10, icon: 'rook-sacrifice' },
  { name: 'Skewer', current: 1, max: 10, icon: null },
])

// All Skills Mastered skills list - All skills completed except Queen Sacrifice at 9/10
const allSkillsMasteredSkillsList = computed(() => [
  { name: 'Queen Sacrifice', current: queenSacrificeCount.value, max: 10, icon: 'queen-sacrifice', completed: allSkillsMasteredCompleted.value },
  { name: 'Royal Fork', current: 10, max: 10, icon: 'royal-fork', completed: true },
  { name: 'Rook Sacrifice', current: 10, max: 10, icon: 'rook-sacrifice', completed: true },
  { name: 'Skewer', current: 10, max: 10, icon: 'skewer', completed: true },
  { name: 'Knight Fork', current: 10, max: 10, icon: 'knight-fork', completed: true },
  { name: 'Fork', current: 10, max: 10, icon: 'fork', completed: true },
  { name: 'Defend Piece', current: 10, max: 10, icon: 'defend-piece', completed: true },
  { name: 'Check', current: 10, max: 10, icon: 'check', completed: true },
  { name: 'Capture', current: 10, max: 10, icon: 'capturing-dark-bishop', completed: true },
])

// Get current skills list based on prototype
const currentSkillsList = computed(() => {
  if (selectedPrototype.value === 'ftue') return ftueSkillsList.value
  if (selectedPrototype.value === 'end-of-ftue') {
    // After celebration, show new unlocked skills with tabs
    if (endOfFtueCompleted.value) return endOfFtueAfterCelebrationSkillsList.value
    return endOfFtueSkillsList.value
  }
  if (selectedPrototype.value === 'mastered-skill') return masteredSkillSkillsList.value
  if (selectedPrototype.value === 'all-skills-mastered') return allSkillsMasteredSkillsList.value
  return skillsList.value
})

// Check if tabs should be shown (hidden for FTUE-style prototypes, but shown after End of FTUE celebration)
const showSkillsTabs = computed(() => {
  if (selectedPrototype.value === 'ftue') return false
  if (selectedPrototype.value === 'end-of-ftue') return endOfFtueCompleted.value
  return true
})

// Game data
const gameData = ref(null)
const positions = ref([])
const moveList = ref([])

// Evaluation data for The Immortal Game (in centipawns, positive = White advantage)
// Based on modern engine analysis
const immortalGameEvals = [
  0,      // Starting position
  0.3,    // 1. e4
  0.2,    // 1...e5
  0.2,    // 2. f4
  0.5,    // 2...exf4
  0.4,    // 3. Bc4
  0.8,    // 3...Qh4+
  0.6,    // 4. Kf1
  1.2,    // 4...b5
  0.8,    // 5. Bxb5
  0.9,    // 5...Nf6
  0.7,    // 6. Nf3
  1.5,    // 6...Qh6
  1.2,    // 7. d3
  1.8,    // 7...Nh5
  1.5,    // 8. Nh4
  2.0,    // 8...Qg5
  1.8,    // 9. Nf5
  2.2,    // 9...c6
  1.9,    // 10. g4
  2.5,    // 10...Nf6
  2.2,    // 11. Rg1
  2.8,    // 11...cxb5
  2.5,    // 12. h4
  3.0,    // 12...Qg6
  2.7,    // 13. h5
  3.2,    // 13...Qg5
  2.9,    // 14. Qf3
  3.5,    // 14...Ng8
  3.2,    // 15. Bxf4
  3.8,    // 15...Qf6
  3.5,    // 16. Nc3
  4.0,    // 16...Bc5
  3.7,    // 17. Nd5
  4.5,    // 17...Qxb2
  5.0,    // 18. Bd6!! (first rook sacrifice)
  6.0,    // 18...Bxg1 (Black takes rook)
  8.0,    // 19. e5!! (second rook sacrifice offered)
  7.0,    // 19...Qxa1+
  9.0,    // 20. Ke2
  8.5,    // 20...Na6
  12.0,   // 21. Nxg7+
  10.0,   // 21...Kd8
  'M3',   // 22. Qf6+!! (queen sacrifice!)
  'M2',   // 22...Nxf6
  'M1',   // 23. Be7# (checkmate)
]

// Computed pieces based on current ply
const pieces = computed(() => {
  if (!positions.value.length || activePly.value < 0) return []
  const posIndex = Math.min(activePly.value, positions.value.length - 1)
  return boardToPieces(positions.value[posIndex])
})

// Computed evaluation based on current ply
const currentEval = computed(() => {
  const evalIndex = Math.min(activePly.value, immortalGameEvals.length - 1)
  return immortalGameEvals[evalIndex] || 0
})

// Format eval text for display
const evalText = computed(() => {
  const ev = currentEval.value
  if (typeof ev === 'string') return ev // Already formatted (like 'M3')
  if (ev === 0) return '0.0'
  const sign = ev > 0 ? '+' : ''
  return `${sign}${ev.toFixed(1)}`
})

// Calculate bar widths based on evaluation
// Returns { blackWidth, whiteWidth } where total width is ~350px
const evalBarWidths = computed(() => {
  const ev = currentEval.value
  const maxWidth = 349 // Total bar width
  
  // Handle mate scores
  if (typeof ev === 'string' && ev.startsWith('M')) {
    return { blackWidth: 1, whiteWidth: maxWidth - 1 } // Almost all white for winning
  }
  
  // Convert centipawn eval to percentage (sigmoid-like curve)
  // At +3.0, white has ~90% of bar; at -3.0, black has ~90%
  const clampedEval = Math.max(-10, Math.min(10, ev))
  const whitePercent = 50 + (clampedEval * 5) // Simple linear scaling
  const clampedPercent = Math.max(5, Math.min(95, whitePercent))
  
  const whiteWidth = Math.round((clampedPercent / 100) * maxWidth)
  const blackWidth = maxWidth - whiteWidth
  
  return { blackWidth, whiteWidth }
})

// Skill moves for different prototypes
const skillPointEarnedMoves = [18, 19, 22] // Rook sac #1, Rook sac #2, Queen sac
const ftueMoves = [5, 21, 23] // First capture (Bxb5), First check (Nxg7+), Checkmate (Be7#)
const endOfFtueMoves = [23] // Only Checkmate (Be7#)
const masteredSkillMoves = [18, 19] // Rook sac #1, Rook sac #2 (mastery on second)
const allSkillsMasteredMoves = [22] // Only Queen sac (completing all skills)

// Get skill moves based on prototype
function getSkillMoves() {
  if (selectedPrototype.value === 'ftue') return ftueMoves
  if (selectedPrototype.value === 'end-of-ftue') return endOfFtueMoves
  if (selectedPrototype.value === 'mastered-skill') return masteredSkillMoves
  if (selectedPrototype.value === 'all-skills-mastered') return allSkillsMasteredMoves
  return skillPointEarnedMoves
}

// Load PGN file
async function loadGame(pgnPath) {
  try {
    const response = await fetch(pgnPath)
    const pgnText = await response.text()
    
    // Parse PGN
    gameData.value = parsePGN(pgnText)
    
    // Mark skill moves based on selected prototype
    moveList.value = markBrilliantMoves(gameData.value.moves, getSkillMoves())
    
    // Calculate all positions
    positions.value = calculatePositions(gameData.value.moves)
    
    // Initialize counters based on current prototype (important for page reload)
    initializePrototypeState(selectedPrototype.value)
  } catch (error) {
    console.error('Failed to load PGN:', error)
  }
}

// Load The Immortal Game on mount
onMounted(() => {
  // Use base URL for GitHub Pages compatibility
  const baseUrl = import.meta.env.BASE_URL
  loadGame(`${baseUrl}games/immortal-game-1851.pgn`)
  
  // Listen for keyboard events
  window.addEventListener('keydown', handleKeydown)
})

// Auto-play until a classified move is found
const isPlaying = ref(false)
let playInterval = null

function getMoveClassificationAtPly(ply) {
  if (ply <= 0) return null
  // ply 1 = white's first move (moveList[0].white)
  // ply 2 = black's first move (moveList[0].black)
  const moveIndex = Math.floor((ply - 1) / 2)
  const isBlackMove = (ply - 1) % 2 === 1
  
  if (moveIndex >= moveList.value.length) return null
  
  const move = moveList.value[moveIndex]
  // Only white moves have classifications in this game
  if (!isBlackMove && move.classification) {
    return move.classification
  }
  return null
}

function playNextMoves() {
  if (isPlaying.value) return // Already playing
  
  const totalPlies = positions.value.length - 1
  if (activePly.value >= totalPlies) return // Already at end
  
  isPlaying.value = true
  
  playInterval = setInterval(() => {
    activePly.value++
    
    // Check if current move has a classification
    const classification = getMoveClassificationAtPly(activePly.value)
    
    // Stop if we found a classified move or reached the end
    if (classification || activePly.value >= totalPlies) {
      clearInterval(playInterval)
      playInterval = null
      isPlaying.value = false
    }
  }, 100)
}

const coachMessages = [
  { id: 'm1', text: 'Nice find! That move wins material.' },
  { id: 'm2', text: 'Now convert carefully.' },
]

const skillProgress = {
  name: 'Skewer',
  value: 40,
  max: 100,
  counter: 10,
}

const baseUrl = import.meta.env.BASE_URL

// Design system glyph names (from Figma)
const glyphs = {
  back: 'arrow-line-left',
  search: 'tool-magnifier-checker-1',
  settings: 'utility-cogwheel',
  tabSkills: 'element-star-fill',
  tabShow: 'hand-pawn',
  tabBest: 'tool-magnifier-star',
}

// Legacy icons (not in design system)
const navIcons = {
  statusRight: `${baseUrl}icons/misc/status-right.svg`,
  brilliant: `${baseUrl}icons/move-classifications/brilliant.svg`,
}

// playSound imported from @chess/components

// Play sound based on move notation
function playMoveSound(moveStr) {
  if (!moveStr) return
  
  console.log('Playing sound for move:', moveStr)
  
  // Priority: checkmate/check > castle > capture > promote > normal move
  if (moveStr.includes('#') || moveStr.includes('+')) {
    playSound('check')
  } else if (moveStr === 'O-O' || moveStr === 'O-O-O' || moveStr === '0-0' || moveStr === '0-0-0') {
    playSound('castle')
  } else if (moveStr.includes('x')) {
    playSound('capture')
  } else if (moveStr.includes('=')) {
    playSound('promote')
  } else {
    playSound('move')
  }
}

// Get move notation at a given ply
function getMoveAtPly(ply) {
  if (ply <= 0) return null
  const moveIndex = Math.floor((ply - 1) / 2)
  const isBlackMove = (ply - 1) % 2 === 1
  
  if (moveIndex >= moveList.value.length) return null
  
  const move = moveList.value[moveIndex]
  return isBlackMove ? move.black : move.white
}

// Watch for prototype changes to update skill moves
// Initialize counters based on selected prototype
function initializePrototypeState(prototype) {
  // Reset animation states
  revealedSkillPlies.value = []
  brilliantRevealedPlies.value = []
  rookSacrificeCount.value = 0
  queenSacrificeCount.value = 0
  captureCount.value = 0
  checkCount.value = 0
  checkmateCount.value = 0
  hasShownFirstSkillCelebration.value = false
  showBoardCelebration.value = false
  showContinueButton.value = false
  showSkillUnlockedModal.value = false
  endOfFtueCompleted.value = false
  allSkillsMasteredCompleted.value = false
  activePly.value = 0
  
  // Set initial state for specific prototypes
  if (prototype === 'end-of-ftue') {
    checkmateCount.value = 9 // Start at 9/10
  } else if (prototype === 'mastered-skill') {
    rookSacrificeCount.value = 8 // Start at 8/10, will master after 2 sacrifices
  } else if (prototype === 'all-skills-mastered') {
    queenSacrificeCount.value = 9 // Start at 9/10, completing this masters ALL skills
  }
}

watch(selectedPrototype, (newPrototype) => {
  if (gameData.value) {
    moveList.value = markBrilliantMoves(gameData.value.moves, getSkillMoves())
    initializePrototypeState(newPrototype)
  }
})

// Watch for ply changes to play sounds
watch(activePly, (newPly, oldPly) => {
  if (newPly === oldPly) return
  
  // Play sound for the move at the new position
  // When going forward: play the move we just made
  // When going backward: play the move we landed on (or just a move sound)
  if (newPly > oldPly) {
    // Moving forward - play the sound of the move just made
    const moveNotation = getMoveAtPly(newPly)
    playMoveSound(moveNotation)
    
    if (selectedPrototype.value === 'ftue') {
      // FTUE triggers
      // 5. Bxb5 (ply 9) - Capture
      if (newPly === 9 && captureCount.value === 0 && !showSkillEarned.value) {
        triggerSkillEarned('b5', 9, 'capture')
      }
      // 21. Nxg7+ (ply 41) - Check
      if (newPly === 41 && checkCount.value === 0 && !showSkillEarned.value) {
        triggerSkillEarned('g7', 41, 'check')
      }
      // 23. Be7# (ply 45) - Checkmate
      if (newPly === 45 && checkmateCount.value === 0 && !showSkillEarned.value) {
        triggerSkillEarned('e7', 45, 'checkmate')
      }
    } else if (selectedPrototype.value === 'end-of-ftue') {
      // End of FTUE - only checkmate trigger
      // 23. Be7# (ply 45) - Checkmate (starts at 9/10, goes to 10/10)
      if (newPly === 45 && checkmateCount.value === 9 && !showSkillEarned.value) {
        triggerSkillEarned('e7', 45, 'checkmate')
      }
    } else if (selectedPrototype.value === 'mastered-skill') {
      // Mastered Skill - rook sacrifices starting at 8/10
      // 18. Bd6 (ply 35) - first rook sacrifice (8 → 9)
      if (newPly === 35 && rookSacrificeCount.value === 8 && !showSkillEarned.value) {
        triggerSkillEarned('d6', 35, 'rook')
      }
      // 19. e5 (ply 37) - second rook sacrifice (9 → 10, mastery!)
      if (newPly === 37 && rookSacrificeCount.value === 9 && !showSkillEarned.value) {
        triggerSkillEarned('e5', 37, 'rook')
      }
    } else if (selectedPrototype.value === 'all-skills-mastered') {
      // All Skills Mastered - only Queen Sacrifice at 9/10
      // 22. Qf6+ (ply 43) - queen sacrifice (9 → 10, completes ALL skills!)
      if (newPly === 43 && queenSacrificeCount.value === 9 && !showSkillEarned.value) {
        triggerSkillEarned('f6', 43, 'queen')
      }
    } else {
      // Skill Point Earned triggers
      // Check for skill earned trigger at move 18. Bd6 (ply 35) - first rook sacrifice
      if (newPly === 35 && rookSacrificeCount.value === 0 && !showSkillEarned.value) {
        triggerSkillEarned('d6', 35, 'rook')
      }
      
      // Check for skill earned trigger at move 19. e5 (ply 37) - second rook sacrifice
      if (newPly === 37 && rookSacrificeCount.value === 1 && !showSkillEarned.value) {
        triggerSkillEarned('e5', 37, 'rook')
      }
      
      // Check for skill earned trigger at move 22. Qf6+ (ply 43) - queen sacrifice
      if (newPly === 43 && queenSacrificeCount.value === 0 && !showSkillEarned.value) {
        triggerSkillEarned('f6', 43, 'queen')
      }
      // If already brilliant-revealed, replay the brilliant animation
      else if (newPly === 43 && brilliantRevealedPlies.value.includes(43)) {
        brilliantHighlightSquare.value = 'f6'
      }
      // Clear brilliant highlight when moving away from the brilliant move
      else if (newPly !== 43 && brilliantHighlightSquare.value) {
        brilliantHighlightSquare.value = null
      }
    }
  } else if (newPly > 0) {
    // Moving backward - play a simple move sound for the position we're at
    const moveNotation = getMoveAtPly(newPly)
    playMoveSound(moveNotation)
    
    // Reset skill animation state if going back before the trigger points
    // But DON'T reset revealedSkillPlies/brilliantRevealedPlies - once revealed, stays revealed
    
    // Helper to reset animation state (but not during celebration)
    const resetAnimationState = () => {
      if (showBoardCelebration.value) return // Don't reset during celebration
      showMoveList.value = true
      showSkillEarned.value = false
      skillHighlightSquare.value = null
      showExplosion.value = false
      brilliantHighlightSquare.value = null
    }
    
    if (selectedPrototype.value === 'ftue') {
      // FTUE skill plies: 9 (capture), 41 (check), 45 (checkmate)
      if (newPly < 9) {
        resetAnimationState()
      } else if (newPly < 41) {
        resetAnimationState()
      } else if (newPly < 45) {
        resetAnimationState()
      }
    } else if (selectedPrototype.value === 'end-of-ftue') {
      // End of FTUE skill plies: only 45 (checkmate)
      if (newPly < 45) {
        resetAnimationState()
      }
    } else if (selectedPrototype.value === 'mastered-skill') {
      // Mastered Skill plies: 35, 37
      if (newPly < 35) {
        resetAnimationState()
      } else if (newPly < 37) {
        resetAnimationState()
      }
    } else if (selectedPrototype.value === 'all-skills-mastered') {
      // All Skills Mastered plies: only 43 (queen sacrifice)
      if (newPly < 43) {
        resetAnimationState()
      }
    } else {
      // Skill Point Earned plies: 35, 37, 43
      if (newPly < 35) {
        resetAnimationState()
      } else if (newPly < 37) {
        resetAnimationState()
      } else if (newPly < 43) {
        resetAnimationState()
      } else if (newPly === 43 && brilliantRevealedPlies.value.includes(43)) {
        // Landing on brilliant move (going backward) - replay brilliant animation
        brilliantHighlightSquare.value = 'f6'
      }
    }
  } else {
    // Back to starting position - play a simple move sound
    playSound('move')
    if (!showBoardCelebration.value) {
      // Only reset if not in celebration mode
      showMoveList.value = true
      showSkillEarned.value = false
      skillHighlightSquare.value = null
      showExplosion.value = false
      brilliantHighlightSquare.value = null
    }
    // DON'T reset revealedSkillPlies/brilliantRevealedPlies - once revealed, stays revealed
  }
})

// Track which ply triggered the current animation
const currentAnimatingPly = ref(null)
const currentSkillType = ref(null) // Track which skill type is animating

// Trigger skill earned animation
function triggerSkillEarned(square, ply, skillType = 'rook') {
  // Set skill data based on type
  if (skillType === 'queen') {
    skillEarnedData.value = {
      skillName: 'Queen Sacrifice',
      current: queenSacrificeCount.value,
      max: 10,
      iconSrc: `${baseUrl}icons/skills/white_queen.png`
    }
  } else if (skillType === 'rook') {
    skillEarnedData.value = {
      skillName: 'Rook Sacrifice',
      current: rookSacrificeCount.value,
      max: 10,
      iconSrc: `${baseUrl}icons/skills/white_rook.png`
    }
  } else if (skillType === 'capture') {
    skillEarnedData.value = {
      skillName: 'Capture',
      current: captureCount.value,
      max: 10,
      iconSrc: `${baseUrl}icons/skills/capturing-dark-bishop.png`
    }
  } else if (skillType === 'check') {
    skillEarnedData.value = {
      skillName: 'Check',
      current: checkCount.value,
      max: 10,
      iconSrc: `${baseUrl}icons/skills/check.png`
    }
  } else if (skillType === 'checkmate') {
    skillEarnedData.value = {
      skillName: 'Checkmate',
      current: checkmateCount.value,
      max: 10,
      iconSrc: `${baseUrl}icons/skills/checkmate-dark.png`
    }
  }
  
  currentAnimatingPly.value = ply
  currentSkillType.value = skillType
  
  // Highlight the skill square on the board
  skillHighlightSquare.value = square
  
  // After 200ms delay
  setTimeout(() => {
    // Fade out move list
    showMoveList.value = false
    
    // After move list fades out (100ms), show skill earned
    setTimeout(() => {
      showSkillEarned.value = true
    }, 100)
  }, 200)
  
  // Show explosion after coin animation completes (1350ms)
  setTimeout(() => {
    showExplosion.value = true
  }, 1350)
  
  // Auto-close after progress bar animation completes + brief pause
  // Timeline from trigger:
  // - 300ms: skill earned visible
  // - 1850ms: progress bar starts (300 + 1550)
  // - 2350ms: progress bar ends (1850 + 500)
  // - 2850ms: slide out
  setTimeout(() => {
    closeSkillEarned()
  }, 2850)
}

// Close skill earned and show move list
function closeSkillEarned() {
  // Don't close during celebration - wait for Continue button
  if (showBoardCelebration.value) return
  
  if (showSkillEarned.value) {
    const savedPly = currentAnimatingPly.value
    const savedSquare = skillHighlightSquare.value
    const savedSkillType = currentSkillType.value
    
    showSkillEarned.value = false
    skillHighlightSquare.value = null
    showExplosion.value = false
    
    // Wait for slide-out to finish (150ms), THEN update count and fade in move list
    setTimeout(() => {
      // Increment the correct counter based on skill type
      if (savedSkillType === 'queen') {
        queenSacrificeCount.value++
      } else if (savedSkillType === 'rook') {
        rookSacrificeCount.value++
      } else if (savedSkillType === 'capture') {
        captureCount.value++
      } else if (savedSkillType === 'check') {
        checkCount.value++
      } else if (savedSkillType === 'checkmate') {
        checkmateCount.value++
      }
      // Mark this ply as revealed (no more gold star) - use spread to trigger reactivity
      if (savedPly && !revealedSkillPlies.value.includes(savedPly)) {
        revealedSkillPlies.value = [...revealedSkillPlies.value, savedPly]
      }
      
      currentAnimatingPly.value = null
      currentSkillType.value = null
      showMoveList.value = true
      
      // Only trigger brilliant animation for Queen Sacrifice (Qf6+) - NOT for FTUE
      if (savedSkillType === 'queen' && selectedPrototype.value !== 'ftue') {
        // Mark as brilliant revealed (so move list shows teal glyph)
        if (savedPly && !brilliantRevealedPlies.value.includes(savedPly)) {
          brilliantRevealedPlies.value = [...brilliantRevealedPlies.value, savedPly]
        }
        
        // Start brilliant board animation after move list fades in (150ms)
        // Coin persists until user navigates away
        setTimeout(() => {
          brilliantHighlightSquare.value = savedSquare
        }, 150)
      }
    }, 150)
  }
}

// Close board celebration
function closeBoardCelebration() {
  showBoardCelebration.value = false
  showContinueButton.value = false
  showMoveList.value = true
}

// Handle counter animation complete - show celebration for first skill or mastery
function onCounterComplete() {
  // Check for mastery celebration (skill reaches 10/10)
  if (selectedPrototype.value === 'mastered-skill' && currentSkillType.value === 'rook' && rookSacrificeCount.value === 9) {
    // This is the second rook sacrifice, will become 10/10 (mastery!)
    boardCelebrationData.value = {
      image: `${import.meta.env.BASE_URL}icons/skills/white_rook.png`,
      title: 'You mastered a Skill!',
      subtitle: ''
    }
    showBoardCelebration.value = true
    showContinueButton.value = true
  }
  // All Skills Mastered celebration (queen sacrifice completes ALL skills)
  else if (selectedPrototype.value === 'all-skills-mastered' && currentSkillType.value === 'queen' && queenSacrificeCount.value === 9) {
    boardCelebrationData.value = {
      image: `${import.meta.env.BASE_URL}icons/skills/white_queen.png`,
      title: 'You mastered a Skill!',
      subtitle: ''
    }
    showBoardCelebration.value = true
    showContinueButton.value = true
  }
  // End of FTUE celebration (checkmate completes the tutorial)
  else if (selectedPrototype.value === 'end-of-ftue' && currentSkillType.value === 'checkmate' && checkmateCount.value === 9) {
    boardCelebrationData.value = {
      image: 'https://www.chess.com/bundles/web/images/color-icons/commerce-gold.svg',
      title: 'New Skills Unlocked!',
      subtitle: ''
    }
    showBoardCelebration.value = true
    showContinueButton.value = true
  }
  // FTUE first skill celebration
  else if (!hasShownFirstSkillCelebration.value && selectedPrototype.value === 'ftue') {
    hasShownFirstSkillCelebration.value = true
    
    // Show board celebration and continue button
    boardCelebrationData.value = {
      image: `${import.meta.env.BASE_URL}icons/skills/skill-point-celebration.png`,
      title: 'You Earned a Skill Point',
      subtitle: 'Keep reviewing until you master every skill'
    }
    showBoardCelebration.value = true
    showContinueButton.value = true
  } else {
    // For subsequent skills or non-FTUE prototypes, auto-close after a short delay
    closeSkillEarned()
  }
}

// Handle Continue button click
function onContinueClick() {
  const savedPly = currentAnimatingPly.value
  const savedSquare = skillHighlightSquare.value
  const savedSkillType = currentSkillType.value
  
  // Check if this is a mastery celebration (mastered-skill prototype, second rook sacrifice)
  const isMasteryCelebration = selectedPrototype.value === 'mastered-skill' && 
    savedSkillType === 'rook' && 
    rookSacrificeCount.value === 9
  
  // Check if this is an "all skills mastered" celebration (queen sacrifice completes ALL skills)
  const isAllSkillsMastered = selectedPrototype.value === 'all-skills-mastered' && 
    savedSkillType === 'queen' && 
    queenSacrificeCount.value === 9
  
  // Check if this is an "end of FTUE" celebration (checkmate completes tutorial)
  const isEndOfFtue = selectedPrototype.value === 'end-of-ftue' && 
    savedSkillType === 'checkmate' && 
    checkmateCount.value === 9

  if (isEndOfFtue) {
    // Close celebration and return to normal state
    showSkillEarned.value = false
    skillHighlightSquare.value = null
    showExplosion.value = false
    showContinueButton.value = false
    showBoardCelebration.value = false
    
    // Update counter
    checkmateCount.value++
    
    // Mark End of FTUE as completed - this enables tabs and shows new skills
    endOfFtueCompleted.value = true
    
    // Mark ply as revealed
    if (savedPly && !revealedSkillPlies.value.includes(savedPly)) {
      revealedSkillPlies.value = [...revealedSkillPlies.value, savedPly]
    }
    
    currentAnimatingPly.value = null
    currentSkillType.value = null
    showMoveList.value = true
    
    return
  }

  if (isAllSkillsMastered) {
    // Go directly to the hero modal (no intermediate overlay)
    showSkillEarned.value = false
    skillHighlightSquare.value = null
    showExplosion.value = false
    showContinueButton.value = false
    
    // Update counter
    queenSacrificeCount.value++
    
    // Mark ply as revealed
    if (savedPly && !revealedSkillPlies.value.includes(savedPly)) {
      revealedSkillPlies.value = [...revealedSkillPlies.value, savedPly]
    }
    
    currentAnimatingPly.value = null
    currentSkillType.value = null
    
    // Show the hero modal with "Skills Complete" message and Share button
    skillUnlockedData.value = {
      skillName: 'Skills Complete',
      skillDescription: 'Impressive! You completed all the challenges. Now go show off your new skills.',
      skillImage: '',
      showShareButton: true
    }
    showSkillUnlockedModal.value = true
    
    // Hide board celebration after modal slide-in completes (250ms)
    setTimeout(() => {
      showBoardCelebration.value = false
    }, 250)
    
    return
  }
  
  if (isMasteryCelebration) {
    // Transition to "New Skill Unlocked" celebration
    boardCelebrationData.value = {
      image: `${import.meta.env.BASE_URL}icons/skills/white_queen.png`,
      title: 'New Skill Unlocked',
      subtitle: ''
    }
    // Keep buttons visible during transition
    // showContinueButton.value stays true
    
    // After 2000ms, show the hero modal
    setTimeout(() => {
      // Hide buttons but keep board celebration visible during modal slide-in
      showSkillEarned.value = false
      skillHighlightSquare.value = null
      showExplosion.value = false
      showContinueButton.value = false
      
      // Update counter
      rookSacrificeCount.value++
      
      // Mark ply as revealed
      if (savedPly && !revealedSkillPlies.value.includes(savedPly)) {
        revealedSkillPlies.value = [...revealedSkillPlies.value, savedPly]
      }
      
      currentAnimatingPly.value = null
      currentSkillType.value = null
      
      // Show the hero modal
      skillUnlockedData.value = {
        skillName: 'Queen Sacrifice',
        skillDescription: 'A tactical move where you deliberately give up your queen to gain a decisive advantage, often leading to checkmate or winning material back.',
        skillImage: '',
        showShareButton: false
      }
      showSkillUnlockedModal.value = true
      
      // Hide board celebration after modal slide-in completes (250ms)
      setTimeout(() => {
        showBoardCelebration.value = false
      }, 250)
    }, 2000)
    
    return
  }
  
  // Default behavior for other celebrations
  showBoardCelebration.value = false
  // Keep Share and Continue buttons visible
  showSkillEarned.value = false
  skillHighlightSquare.value = null
  showExplosion.value = false
  
  // Wait for animations to complete, then update state
  setTimeout(() => {
    // Increment the correct counter based on skill type
    if (savedSkillType === 'queen') {
      queenSacrificeCount.value++
    } else if (savedSkillType === 'rook') {
      rookSacrificeCount.value++
    } else if (savedSkillType === 'capture') {
      captureCount.value++
    } else if (savedSkillType === 'check') {
      checkCount.value++
    } else if (savedSkillType === 'checkmate') {
      checkmateCount.value++
    }
    
    // Mark this ply as revealed
    if (savedPly && !revealedSkillPlies.value.includes(savedPly)) {
      revealedSkillPlies.value = [...revealedSkillPlies.value, savedPly]
    }
    
    currentAnimatingPly.value = null
    currentSkillType.value = null
    showMoveList.value = true
  }, 150)
}

// Handle Skill Unlocked Modal continue
function onSkillUnlockedContinue() {
  showSkillUnlockedModal.value = false
  showMoveList.value = true
  
  // Mark All Skills Mastered as completed so Queen Sacrifice shows as completed
  if (selectedPrototype.value === 'all-skills-mastered') {
    allSkillsMasteredCompleted.value = true
  }
}

// Handle Skill Unlocked Modal close
function onSkillUnlockedClose() {
  showSkillUnlockedModal.value = false
  showMoveList.value = true
}

// Handle keyboard events
function handleKeydown(event) {
  if (event.key === 'Escape') {
    // Close skill earned overlay
    if (showSkillEarned.value) {
      closeSkillEarned()
      return
    }
    // Close skills bottom sheet
    if (showSkillsSheet.value) {
      showSkillsSheet.value = false
    }
  }
  
  // Arrow keys for move navigation
  if (event.key === 'ArrowRight') {
    // If celebration is showing, treat as Continue
    if (showBoardCelebration.value) {
      onContinueClick()
      return
    }
    const totalPlies = positions.value.length - 1
    if (activePly.value < totalPlies) {
      activePly.value++
    }
  }
  
  if (event.key === 'ArrowLeft') {
    // If celebration is showing, treat as Continue
    if (showBoardCelebration.value) {
      onContinueClick()
      return
    }
    if (activePly.value > 0) {
      activePly.value--
    }
  }
}

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="app">
    <div class="phone-frame">
      <header class="nav-bar">
        <div class="status-bar">
          <div class="status-right">
            <img alt="" :src="navIcons.statusRight" />
          </div>
        </div>
        <div class="nav-header">
          <div class="nav-icon-button nav-icon">
            <CcIcon :name="glyphs.back" :size="20" />
          </div>
          <div class="nav-title">Game Review</div>
          <div class="nav-actions">
            <div class="nav-icon-button nav-icon">
              <CcIcon :name="glyphs.search" :size="20" />
            </div>
            <div class="nav-icon-button nav-icon">
              <CcIcon :name="glyphs.settings" :size="20" />
            </div>
          </div>
        </div>
      </header>

      <section class="eval-section">
        <EvalBar :eval-text="evalText" :black-width="evalBarWidths.blackWidth" :white-width="evalBarWidths.whiteWidth" />
      </section>

      <section class="coach-area">
        <CoachBubble 
          :header-icon="navIcons.brilliant"
          header-text="The Immortal Game (1851)"
          eval-text=""
          message="Anderssen sacrificed a bishop, both rooks, and his queen to deliver checkmate!"
          :show-tip="true"
        />
      </section>

      <section class="board-area">
        <div class="board-container">
          <Board 
            :pieces="pieces" 
            :size="375" 
            :skill-highlight="skillHighlightSquare" 
            :skill-highlight-label="skillEarnedData.skillName" 
            :show-explosion="showExplosion"
            :brilliant-highlight="brilliantHighlightSquare"
          />
          
          <!-- Board Celebration Overlay -->
          <BoardCelebration
            :visible="showBoardCelebration"
            :image="boardCelebrationData.image"
            :title="boardCelebrationData.title"
            :subtitle="boardCelebrationData.subtitle"
          />
        </div>
      </section>

      <section class="content-area">
        <div class="move-list-wrapper" :class="{ 'visible': showMoveList }">
          <MoveListBar
            :moves="moveList"
            v-model:active-ply="activePly"
            :show-icons="true"
            :revealed-plies="revealedSkillPlies"
            :brilliant-revealed-plies="brilliantRevealedPlies"
          />
        </div>
        <SkillEarned
          class="skill-earned-overlay"
          :skill-name="skillEarnedData.skillName"
          :current="skillEarnedData.current"
          :max="skillEarnedData.max"
          :icon-src="skillEarnedData.iconSrc"
          :visible="showSkillEarned || showBoardCelebration"
          @counter-complete="onCounterComplete"
        />
      </section>

      <!-- Skills Bottom Sheet Overlay -->
      <Transition name="overlay">
        <div 
          v-if="showSkillsSheet" 
          class="sheet-overlay" 
          @click="showSkillsSheet = false"
        ></div>
      </Transition>
      
      <!-- Skills Bottom Sheet -->
      <SkillsBottomSheet 
        :open="showSkillsSheet" 
        :skills="currentSkillsList"
        :show-tabs="showSkillsTabs"
        class="skills-sheet"
        @close="showSkillsSheet = false"
      />

      <footer class="tab-bar">
        <div class="tabs-container">
          <!-- Normal tabs OR Continue button with fade transitions -->
          <Transition name="tabs-fade" mode="out-in">
            <div v-if="!showContinueButton" key="tabs" class="tabs-group">
              <div class="tab-item" @click="showSkillsSheet = !showSkillsSheet">
                <div class="tab-icon tab-icon-glyph">
                  <CcIcon :name="glyphs.tabSkills" :size="24" />
                </div>
                <span class="tab-label">Skills</span>
              </div>
              <div class="tab-item">
                <div class="tab-icon tab-icon-glyph">
                  <CcIcon :name="glyphs.tabShow" :size="24" />
                </div>
                <span class="tab-label">Show</span>
              </div>
              <div class="tab-item">
                <div class="tab-icon tab-icon-glyph">
                  <CcIcon :name="glyphs.tabBest" :size="24" />
                </div>
                <span class="tab-label">Best</span>
              </div>
              <CcButton variant="primary" size="x-large" class="tab-cta-ds" @click="playNextMoves">Next</CcButton>
            </div>
            <div v-else key="continue" class="continue-group">
              <cc-button v-if="selectedPrototype !== 'end-of-ftue'" variant="secondary" size="large">Share</cc-button>
              <cc-button variant="primary" size="large" @click="onContinueClick">Continue</cc-button>
            </div>
          </Transition>
        </div>
        
        <div class="home-indicator"></div>
      </footer>

      <!-- Skill Unlocked Hero Modal -->
      <SkillUnlockedModal
        :visible="showSkillUnlockedModal"
        :skill-name="skillUnlockedData.skillName"
        :skill-description="skillUnlockedData.skillDescription"
        :skill-image="skillUnlockedData.skillImage"
        :show-share-button="skillUnlockedData.showShareButton"
        @continue="onSkillUnlockedContinue"
        @close="onSkillUnlockedClose"
      />
    </div>

    <!-- Menu button top right -->
    <button class="menu-button" aria-label="Menu" @click="showPrototypeMenu = true">
      <CcIcon name="mark-menu" :size="24" />
    </button>

    <!-- Prototype Navigation Menu -->
    <PrototypeMenu
      :open="showPrototypeMenu"
      :selected-example="selectedPrototype"
      @close="showPrototypeMenu = false"
      @select="(id) => selectedPrototype = id"
    />
  </div>
</template>

<style>
/* Chess Sans Variable Font */
@font-face {
  font-family: 'Chess Sans';
  src: url('/fonts/ChessSansVF.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

/* Design system button overrides */
button.cc-button-component.cc-button-secondary {
  color: rgba(255, 255, 255, 0.85);
}
</style>

<style scoped>
.app {
  background: #1f1f1f;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding: 24px;
  font-family: 'Chess Sans', system-ui, -apple-system, sans-serif;
  position: relative;
}

.menu-button {
  position: fixed;
  top: 4px;
  right: 4px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.15s ease;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.phone-frame {
  width: 375px;
  height: 812px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%),
    #312e2b;
  border-radius: 40px;
  /* Use inset box-shadow for border effect (doesn't affect layout) */
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 12px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

/* Skills Bottom Sheet Overlay */
.sheet-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  cursor: pointer;
}

/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 150ms cubic-bezier(0, 0, 0.4, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Skills Bottom Sheet */
.skills-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 70%;
}

.nav-bar {
  height: 87px;
  display: flex;
  flex-direction: column;
  font-weight: 700;
}

.status-bar {
  height: 47px;
  position: relative;
}

.status-right {
  position: absolute;
  right: 14.67px;
  top: 17.33px;
  width: 66.661px;
  height: 11.336px;
}

.status-right img {
  width: 100%;
  height: 100%;
  display: block;
}

.nav-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  backdrop-filter: blur(12px);
  position: relative;
}

.nav-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 215px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  line-height: 28px;
  color: #fff;
  pointer-events: none;
}

.nav-icon-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
}

.nav-actions {
  display: flex;
}

.nav-icon-button img {
  width: 20px;
  height: 20px;
  display: block;
  opacity: 0.5;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

.nav-icon {
  color: var(--color-icon-default);
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

.tab-icon-glyph {
  color: var(--color-icon-default);
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.14));
}

.eval-section {
  /* Component handles its own padding */
}

.coach-area {
  padding: 12px;
  display: flex;
  align-items: flex-end;
}

.coach-bubble {
  flex: 1;
  background: #f7f7ff;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  color: #333333;
}

.board-area {
  /* Hugs the board */
}

.board-container {
  position: relative;
  width: 375px;
  height: 375px;
}

.content-area {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Skill earned overlay - absolute positioned to not affect layout */
.skill-earned-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  z-index: 2;
}

/* Move list fade animation */
.move-list-wrapper {
  width: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms cubic-bezier(0, 0, 0.4, 1);
}

.move-list-wrapper.visible {
  opacity: 1;
  pointer-events: auto;
}

.marker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 12px;
}

.classification-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 12px;
}

.bottom-region {
  flex: 1;
  padding: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  display: grid;
  gap: 12px;
}

/* SkillEarned component handles its own styling */

.move-list-transition {
  display: grid;
  gap: 8px;
}

.bottom-sheet-overlay {
  position: relative;
}

.sheet-content {
  display: grid;
  gap: 12px;
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sheet-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.sheet-title {
  font-weight: 600;
  color: #2f2f2f;
}

.sheet-description {
  font-size: 12px;
  color: #6a6a6a;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 100ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

.fade-out {
  opacity: 1;
  animation: fadeOut 100ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

.slide-in {
  animation: slideIn 100ms cubic-bezier(0, 0, 0.4, 1);
  transform: translateY(24px);
  animation-fill-mode: forwards;
}

.slide-out {
  animation: slideOut 100ms cubic-bezier(0, 0, 0.4, 1);
  animation-fill-mode: forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-24px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.tab-bar {
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  position: relative;
  z-index: 5;
}

.tabs-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 12px;
  height: 56px;
}

.tabs-group {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}

.continue-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.continue-group :deep(button) {
  flex: 1;
}

/* Tabs/Continue fade transition */
.tabs-fade-enter-active {
  transition: opacity 150ms cubic-bezier(0, 0, 0.2, 1);
}

.tabs-fade-leave-active {
  transition: opacity 150ms cubic-bezier(0, 0, 0.2, 1);
}

.tabs-fade-enter-from,
.tabs-fade-leave-to {
  opacity: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 64px;
  height: 48px;
  cursor: pointer;
}

.tab-icon {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.14));
}

.tab-icon img {
  width: 100%;
  height: 100%;
}

.tab-label {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.14);
  text-align: center;
  white-space: nowrap;
}

.tab-cta-ds {
  flex: 1;
}

.home-indicator {
  height: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

.home-indicator::after {
  content: '';
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 100px;
}
</style>
