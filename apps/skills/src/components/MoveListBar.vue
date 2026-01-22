<script setup>
import { ref, watch, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  moves: { type: Array, default: () => [] },
  activePly: { type: Number, default: -1 },
  showIcons: { type: Boolean, default: true },
  revealedPlies: { type: Array, default: () => [] }, // Plies where skill has been revealed
  brilliantRevealedPlies: { type: Array, default: () => [] }, // Plies where brilliant has been revealed (after skill)
})

const emit = defineEmits(['update:activePly'])

// Refs for scrolling
const plyRefs = ref({})

// Helper to check if a ply is selected
// activePly: 0 = starting position (no move), 1 = after first white, 2 = after first black, etc.
const isWhiteSelected = (moveIndex) => props.activePly === moveIndex * 2 + 1
const isBlackSelected = (moveIndex) => props.activePly === moveIndex * 2 + 2

// Helper to check if a ply's skill has been revealed
const isWhitePlyRevealed = (moveIndex) => props.revealedPlies.includes(moveIndex * 2 + 1)

// Helper to check if a ply's brilliant status has been revealed (after skill)
const isWhiteBrilliantRevealed = (moveIndex) => props.brilliantRevealedPlies.includes(moveIndex * 2 + 1)

// Calculate total plies (each move has white + optionally black)
const getTotalPlies = () => {
  return props.moves.reduce((total, move) => {
    return total + 1 + (move.black ? 1 : 0)
  }, 0)
}

// Navigation handlers
const goToPreviousPly = () => {
  if (props.activePly > 0) {
    emit('update:activePly', props.activePly - 1)
  }
}

const goToNextPly = () => {
  const totalPlies = getTotalPlies()
  if (props.activePly < totalPlies) {
    emit('update:activePly', props.activePly + 1)
  }
}

// Check if navigation is possible
const canGoBack = () => props.activePly > 0
const canGoForward = () => props.activePly < getTotalPlies()

// Click to select a ply
const selectWhite = (moveIndex) => {
  emit('update:activePly', moveIndex * 2 + 1)
}

const selectBlack = (moveIndex) => {
  emit('update:activePly', moveIndex * 2 + 2)
}

// Store ref for a ply element
const setPlyRef = (plyIndex, el) => {
  if (el) {
    plyRefs.value[plyIndex] = el
  }
}

// Scroll to center the active ply
const scrollToActivePly = () => {
  const plyEl = plyRefs.value[props.activePly]
  
  if (!plyEl) return
  
  // Use scrollIntoView which handles rapid updates better
  plyEl.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  })
}

// Watch for activePly changes and scroll to center
watch(() => props.activePly, () => {
  nextTick(() => {
    scrollToActivePly()
  })
}, { immediate: true })
</script>

<template>
  <div class="move-list-bar">
    <!-- Left chevron -->
    <button class="nav-btn" :class="{ disabled: !canGoBack() }" @click="goToPreviousPly">
      <svg class="chevron" viewBox="0 0 11.345 20.105" fill="none">
        <path d="M10.4975 19.1875L10.4275 19.2575C9.2975 20.3875 8.8275 20.3875 7.6975 19.2575L1.2975 12.8875C-0.4325 11.1175 -0.4325 8.9875 1.2975 7.2175L7.6975 0.8475C8.8275 -0.2825 9.2975 -0.2825 10.4275 0.8475L10.4975 0.9175C11.6275 2.0475 11.6275 2.5175 10.4975 3.6475L4.1275 10.0475L10.4975 16.4475C11.6275 17.5775 11.6275 18.0475 10.4975 19.1775V19.1875Z" fill="white"/>
      </svg>
    </button>
    
    <!-- Moves scroll area -->
    <div class="moves-container">
      <div class="moves-scroll">
        <div
          v-for="(move, index) in moves"
          :key="`${move.index}-${index}`"
          class="move"
        >
          <span class="move-number">{{ move.index }}.</span>
          
          <!-- White's move -->
          <div class="ply-wrapper" @click="selectWhite(index)">
            <!-- Skill star for white's move (only show if NOT revealed) -->
            <svg v-if="move.classification && !isWhitePlyRevealed(index)" class="skill-star" viewBox="0 0 20 20" fill="none">
              <rect width="20" height="20" rx="10" fill="#E3AA24"/>
              <path d="M6.56624 15.6425C6.14456 15.9236 5.64255 15.5622 5.78311 15.0803L6.82729 11.1244L3.6546 8.55415C3.23291 8.21278 3.57427 7.65053 3.9558 7.61037L8.05219 7.38949L9.51805 3.57423C9.59837 3.37342 9.79917 3.23286 10.0201 3.23286C10.2209 3.23286 10.4217 3.35334 10.502 3.57423L11.9678 7.38949L16.0442 7.61037C16.5662 7.63045 16.6867 8.27302 16.3454 8.53407L13.1727 11.1244L14.2168 15.0803C14.3574 15.5823 13.7751 15.8634 13.4337 15.6425L9.99998 13.4337L6.56624 15.6425Z" fill="white"/>
            </svg>
            <!-- Brilliant badge (show after skill is revealed AND brilliant is revealed) -->
            <div v-if="move.classification && isWhitePlyRevealed(index) && isWhiteBrilliantRevealed(index)" class="brilliant-badge">
              <CcIcon name="move-exclamation-double" :size="12" color="white" />
            </div>
            <div 
              :ref="(el) => setPlyRef(index * 2 + 1, el)"
              class="ply-container" 
              :class="{ highlighted: isWhiteSelected(index) }"
            >
              <span 
                class="ply-text" 
                :class="{ 
                  'skill-text': move.classification && !isWhitePlyRevealed(index),
                  'brilliant-text': move.classification && isWhitePlyRevealed(index) && isWhiteBrilliantRevealed(index)
                }"
              >{{ move.white }}</span>
            </div>
          </div>
          
          <!-- Black's move -->
          <div v-if="move.black" class="ply-wrapper" @click="selectBlack(index)">
            <div 
              :ref="(el) => setPlyRef(index * 2 + 2, el)"
              class="ply-container" 
              :class="{ highlighted: isBlackSelected(index) }"
            >
              <span class="ply-text">{{ move.black }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right chevron -->
    <button class="nav-btn" :class="{ disabled: !canGoForward() }" @click="goToNextPly">
      <svg class="chevron" viewBox="0 0 11.345 20.105" fill="none">
        <path d="M0.8475 0.9175L0.917501 0.8475C2.0475 -0.2825 2.5175 -0.2825 3.6475 0.8475L10.0475 7.2175C11.7775 8.9875 11.7775 11.1175 10.0475 12.8875L3.6475 19.2575C2.5175 20.3875 2.0475 20.3875 0.917501 19.2575L0.8475 19.1875C-0.2825 18.0575 -0.2825 17.5875 0.8475 16.4575L7.2175 10.0575L0.8475 3.6575C-0.2825 2.5275 -0.2825 2.0575 0.8475 0.9275V0.9175Z" fill="white"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.move-list-bar {
  display: flex;
  align-items: center;
  height: 48px;
  width: 100%;
}

.nav-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.chevron {
  width: 11px;
  height: 20px;
  opacity: 0.5;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

.nav-btn:hover:not(.disabled) .chevron {
  opacity: 0.8;
}

.nav-btn.disabled {
  cursor: default;
  pointer-events: none;
}

.nav-btn.disabled .chevron {
  opacity: 0.2;
}

.moves-container {
  flex: 1;
  height: 48px;
  overflow: hidden;
  display: flex;
  align-items: center;
  position: relative;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 24px,
    black calc(100% - 24px),
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 24px,
    black calc(100% - 24px),
    transparent
  );
}

.moves-scroll {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.moves-scroll::-webkit-scrollbar {
  display: none;
}

.move {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.move-number {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
}

.ply-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  cursor: pointer;
}

.ply-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  border-radius: 2px;
}

.ply-container.highlighted {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 -2px 0 rgba(255, 255, 255, 0.5);
}

.ply-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #fff;
  white-space: nowrap;
}

.skill-star {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.skill-text {
  color: #e3aa24;
}

.brilliant-badge {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #26C2A3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brilliant-text {
  color: #26C2A3;
}
</style>
