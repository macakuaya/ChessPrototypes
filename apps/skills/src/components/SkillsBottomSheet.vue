<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { CcButton, CcIconButton } from '@chesscom/design-system'

const props = defineProps({
  open: { type: Boolean, default: true },
  showTabs: { type: Boolean, default: true },
  initialTab: { type: String, default: 'tactics' }, // Default active tab
  skills: { 
    type: Array, 
    default: () => [
      { name: 'Royal Fork', current: 9, max: 10, icon: 'royal-fork' },
      { name: 'Queen Sacrifice', current: 0, max: 10, icon: 'queen-sacrifice' },
      { name: 'Rook Sacrifice', current: 0, max: 10, icon: 'rook-sacrifice' },
      { name: 'Skewer', current: 0, max: 10, icon: null },
      { name: 'Knight Fork', current: 0, max: 10, icon: null },
      { name: 'Fork', current: 0, max: 10, icon: null },
      { name: 'Defend Piece', current: 0, max: 10, icon: null },
      { name: 'Check', current: 0, max: 10, icon: null },
      { name: 'Capture', current: 0, max: 10, icon: null },
    ]
  }
})

const emit = defineEmits(['close'])

const activeTab = ref(props.initialTab)
const isExpanded = ref(false)

// Selected skill for detail view (the actual data)
const selectedSkill = ref(null)

// Animation state - controls which view is visible
const showingDetail = ref(false)  // Which view to show
const isTransitioning = ref(false)  // Are we mid-transition?
const contentFaded = ref(false)  // Is content faded out?

// Refs for measuring heights
const contentWrapperRef = ref(null)
const skillsListRef = ref(null)
const skillDetailRef = ref(null)

// Animation timing (in ms)
const FADE_OUT_DURATION = 100
const PAUSE_DURATION = 50
const FADE_IN_DURATION = 150
const FADE_IN_BOARD_DURATION = 200
const HEIGHT_DURATION = 250

function onSkillClick(skill) {
  if (!skill.locked && !isTransitioning.value) {
    selectedSkill.value = skill
    startTransitionToDetail()
  }
}

function onBackToList() {
  if (!isTransitioning.value) {
    startTransitionToList()
  }
}

function startTransitionToDetail() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  
  const wrapper = contentWrapperRef.value
  const detailEl = skillDetailRef.value
  
  // Step 1: Lock current height
  if (wrapper) {
    wrapper.style.height = `${wrapper.offsetHeight}px`
  }
  
  // Step 2: Fade out content
  contentFaded.value = true
  
  // Step 3: After fade out, switch views and animate height
  setTimeout(() => {
    showingDetail.value = true
    
    // Measure target height and animate
    nextTick(() => {
      if (wrapper && detailEl) {
        const targetHeight = detailEl.offsetHeight
        wrapper.style.height = `${targetHeight}px`
      }
    })
    
    // Step 4: Pause, then fade in
    setTimeout(() => {
      contentFaded.value = false
      
      // Step 5: Clean up after all animations complete
      setTimeout(() => {
        if (wrapper) {
          wrapper.style.height = ''
        }
        isTransitioning.value = false
      }, Math.max(FADE_IN_DURATION, FADE_IN_BOARD_DURATION))
    }, PAUSE_DURATION)
  }, FADE_OUT_DURATION)
}

function startTransitionToList() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  
  const wrapper = contentWrapperRef.value
  const listEl = skillsListRef.value
  
  // Step 1: Lock current height
  if (wrapper) {
    wrapper.style.height = `${wrapper.offsetHeight}px`
  }
  
  // Step 2: Fade out content
  contentFaded.value = true
  
  // Step 3: After fade out, switch views and animate height
  setTimeout(() => {
    showingDetail.value = false
    selectedSkill.value = null
    
    // Measure target height and animate
    nextTick(() => {
      if (wrapper && listEl) {
        const targetHeight = listEl.offsetHeight
        wrapper.style.height = `${targetHeight}px`
      }
    })
    
    // Step 4: Pause, then fade in
    setTimeout(() => {
      contentFaded.value = false
      
      // Step 5: Clean up after all animations complete
      setTimeout(() => {
        if (wrapper) {
          wrapper.style.height = ''
        }
        isTransitioning.value = false
      }, FADE_IN_DURATION)
    }, PAUSE_DURATION)
  }, FADE_OUT_DURATION)
}

// Reset state when sheet closes (after close animation finishes)
const SHEET_CLOSE_DURATION = 300 // Match CSS transition duration

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    // Delay reset until sheet close animation completes
    setTimeout(() => {
      selectedSkill.value = null
      showingDetail.value = false
      isTransitioning.value = false
      contentFaded.value = false
      if (contentWrapperRef.value) {
        contentWrapperRef.value.style.height = ''
      }
    }, SHEET_CLOSE_DURATION)
  }
})

// Reset active tab when initialTab prop changes
watch(() => props.initialTab, (newTab) => {
  activeTab.value = newTab
})

// Tabs scroll state
const tabsContainerRef = ref(null)
const isScrolledToEnd = ref(false)

function checkScrollEnd() {
  const container = tabsContainerRef.value
  if (!container) return
  
  const threshold = 10 // pixels from end to consider "at end"
  const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - threshold
  isScrolledToEnd.value = isAtEnd
}

function onTabsScroll() {
  checkScrollEnd()
}

// Check scroll position when component mounts and when tabs become visible
onMounted(() => {
  nextTick(() => {
    checkScrollEnd()
  })
})

watch(() => props.showTabs, (show) => {
  if (show) {
    nextTick(() => {
      checkScrollEnd()
    })
  }
})

// Drag state
const isDragging = ref(false)
const dragStartY = ref(0)
const dragCurrentY = ref(0)

const tabs = [
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'openings', label: 'Openings' },
  { id: 'tactics', label: 'Tactics' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'endgames', label: 'Endgames' },
]

// Skill icon paths
const baseUrl = import.meta.env.BASE_URL
const skillIcons = {
  'royal-fork': `${baseUrl}icons/skills/skill-fork.svg`,
  'queen-sacrifice': `${baseUrl}icons/skills/white_queen.png`,
  'rook-sacrifice': `${baseUrl}icons/skills/white_rook.png`,
  'capture': `${baseUrl}icons/skills/capture.png`,
  'capturing-dark-bishop': `${baseUrl}icons/skills/capturing-dark-bishop.png`,
  'check': `${baseUrl}icons/skills/check.png`,
  'checkmate': `${baseUrl}icons/skills/checkmate-dark.png`,
  'checkmate-dark': `${baseUrl}icons/skills/checkmate-dark.png`,
  'castle': `${baseUrl}icons/skills/castle.png`,
}

function getProgressPercent(current, max) {
  return Math.round((current / max) * 100)
}

// Drag handlers
function onDragStart(e) {
  isDragging.value = true
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  dragStartY.value = clientY
  dragCurrentY.value = clientY
}

function onDragMove(e) {
  if (!isDragging.value) return
  const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY
  dragCurrentY.value = clientY
}

function onDragEnd() {
  if (!isDragging.value) return
  
  const dragDistance = dragStartY.value - dragCurrentY.value
  const threshold = 30 // pixels
  
  if (dragDistance > threshold) {
    // Dragged up - expand
    isExpanded.value = true
  } else if (dragDistance < -threshold) {
    // Dragged down - collapse or close
    if (isExpanded.value) {
      isExpanded.value = false
    } else {
      emit('close')
    }
  }
  
  isDragging.value = false
}

// Simple tap to toggle
function onTapToggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div 
    class="skills-bottom-sheet" 
    :class="{ open, expanded: isExpanded }"
    @mouseup="onDragEnd"
    @mouseleave="onDragEnd"
    @touchend="onDragEnd"
  >
    <!-- Drag Handle (always visible) -->
    <div 
      class="drag-container" 
      @click="onTapToggle"
      @mousedown.prevent="onDragStart"
      @mousemove="onDragMove"
      @touchstart.passive="onDragStart"
      @touchmove.passive="onDragMove"
    >
      <div class="drag-handle"></div>
    </div>
    
    <!-- Close Button (shown on detail view, positioned at sheet top-right) -->
    <CcIconButton 
      v-if="showingDetail"
      :icon="{ name: 'mark-cross', variant: 'glyph' }"
      size="large"
      :icon-size="16"
      class="sheet-close-button"
      :custom-classes="{ icon: 'icon-subtle' }"
      @click="emit('close')"
    />
    
    <!-- Content Wrapper - controls height animation -->
    <div ref="contentWrapperRef" class="content-wrapper">
      
      <!-- LIST VIEW: Title + Tabs + Skills List -->
      <div 
        ref="skillsListRef"
        class="list-view" 
        :class="{ 'view-hidden': showingDetail, 'content-faded': contentFaded }"
      >
        <!-- Title -->
        <div class="title-container">
          <h2 class="title">Skills</h2>
        </div>
        
        <!-- Tabs -->
        <div v-if="showTabs" class="tabs-wrapper">
          <div 
            ref="tabsContainerRef"
            class="tabs-container"
            @scroll="onTabsScroll"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="tabs-fade-mask" :class="{ hidden: isScrolledToEnd }"></div>
        </div>
        
        <!-- Skills List -->
        <div class="skills-container">
          <div class="skills-list">
            <div 
              v-for="skill in skills" 
              :key="skill.name"
              class="skill-item"
              :class="{ locked: skill.locked, clickable: !skill.locked }"
              @click="onSkillClick(skill)"
            >
              <!-- Skill Icon -->
              <div class="skill-icon">
                <img v-if="skill.icon && skillIcons[skill.icon]" :src="skillIcons[skill.icon]" :alt="skill.name" />
                <div v-else class="skill-icon-placeholder">
                  <svg viewBox="0 0 44 44" fill="none">
                    <rect x="2" y="2" width="40" height="40" rx="2" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
                  </svg>
                </div>
              </div>
              
              <!-- Skill Info -->
              <div class="skill-info">
                <!-- Label + Counter (hidden for completed or locked skills) -->
                <div class="skill-header">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span v-if="!skill.completed && !skill.locked" class="skill-counter">
                    <span class="current">{{ skill.current }}</span>
                    <span class="separator">/</span>
                    <span class="max">{{ skill.max }}</span>
                  </span>
                </div>
                
                <!-- Progress Bar (hidden for completed or locked skills) -->
                <div v-if="!skill.completed && !skill.locked" class="progress-bar">
                  <div class="progress-bg"></div>
                  <div 
                    class="progress-fill" 
                    :style="{ width: getProgressPercent(skill.current, skill.max) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- DETAIL VIEW: Title + Board + Description + Button -->
      <div 
        ref="skillDetailRef"
        class="detail-view" 
        :class="{ 'view-hidden': !showingDetail, 'content-faded': contentFaded }"
      >
        <!-- Title -->
        <div class="title-container">
          <h2 class="title">{{ selectedSkill ? selectedSkill.name : '' }}</h2>
        </div>
        
        <!-- Mini Chessboard -->
        <div class="skill-detail-content">
          <div class="mini-board" :class="{ 'board-entering': showingDetail && !contentFaded }">
            <div 
              v-for="i in 64" 
              :key="i"
              class="mini-square"
              :class="{ 
                'light': ((Math.floor((i - 1) / 8) + (i - 1) % 8) % 2 === 1),
                'dark': ((Math.floor((i - 1) / 8) + (i - 1) % 8) % 2 === 0)
              }"
            ></div>
          </div>
          
          <!-- Skill Description -->
          <p class="skill-description">
            A tactical pattern where you attack two or more pieces at once, forcing your opponent to lose material since they can only save one piece.
          </p>
          
          <!-- Action Button -->
          <div class="skill-detail-action">
            <CcButton variant="primary" size="x-large" :full-width="true" @click="emit('close')">Ok, got it!</CcButton>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Home Indicator -->
    <div class="home-indicator-container">
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<style scoped>
.skills-bottom-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #262421;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform var(--motion-fast) var(--motion-ease-out-gentle);
}

.skills-bottom-sheet.open {
  transform: translateY(0);
}

.skills-bottom-sheet.expanded {
  max-height: 80%;
}

.skills-bottom-sheet.expanded .skills-container {
  overflow-y: auto;
}

/* Drag Handle */
.drag-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  cursor: grab;
}

.drag-container:active {
  cursor: grabbing;
}

.drag-handle {
  width: 60px;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
}

/* Content Wrapper - uses grid to stack views */
.content-wrapper {
  display: grid;
  overflow: hidden;
  transition: height var(--motion-moderate) linear;
}

/* Both views stack in the same grid cell */
.list-view,
.detail-view {
  grid-area: 1 / 1;
  transition: opacity var(--motion-fast) linear;
}

/* Faster fade out (100ms) */
.list-view.content-faded,
.detail-view.content-faded {
  opacity: 0;
  transition: opacity var(--motion-faster) linear;
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent grid overflow */
  overflow: hidden;
}

/* Detail View */
.detail-view {
  position: relative;
}

/* Hidden view - doesn't contribute to grid height */
.view-hidden {
  visibility: hidden;
  pointer-events: none;
  height: 0;
  min-height: 0;
  overflow: hidden;
}

/* Close Button - positioned top right */
.sheet-close-button {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.sheet-close-button :deep(.icon-subtle) {
  color: var(--color-icon-subtle);
}

/* Title */
.title-container {
  padding: 0 12px;
  height: 24px;
  display: flex;
  align-items: center;
}

.title {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  line-height: 28px;
  color: white;
  margin: 0;
}

/* Tabs */
.tabs-wrapper {
  position: relative;
  height: 56px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs-container {
  display: flex;
  height: 56px;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.tabs-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.tab {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 12px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  transition: color var(--motion-fast) var(--motion-ease-out-gentle), border-color var(--motion-fast) var(--motion-ease-out-gentle);
  white-space: nowrap;
}

.tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.tab.active {
  color: rgba(255, 255, 255, 0.85);
  border-bottom-color: #81b64c;
}

/* Fade mask to indicate scrollable content */
.tabs-fade-mask {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  background: linear-gradient(to right, transparent, #262421);
  pointer-events: none;
  opacity: 1;
  transition: opacity var(--motion-standard) var(--motion-ease-out-gentle);
}

.tabs-fade-mask.hidden {
  opacity: 0;
}

/* Mini Board - slower fade in (200ms) */
.mini-board {
  opacity: 0;
  transition: opacity var(--motion-standard) linear;
}

.board-entering {
  opacity: 1;
}

/* Skill Detail Content */
.skill-detail-content {
  padding: 0;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  gap: 24px;
}

/* Skill Description - uses text paragraph medium token */
.skill-description {
  width: 100%;
  margin: 0 12px;
  padding: 0 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--color-text-bolder);
  text-align: left;
}

/* Skill Detail Action Button */
.skill-detail-action {
  width: 100%;
  padding: 0 12px;
}

/* Mini Chessboard */
.mini-board {
  width: 200px;
  height: 200px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  flex-shrink: 0;
  border-radius: 3px;
  overflow: hidden;
}

.mini-square {
  aspect-ratio: 1;
}

.mini-square.dark {
  background: #779556;
}

.mini-square.light {
  background: #EBECD0;
}

/* Skills Container */
.skills-container {
  padding: 0 12px;
  max-height: 212px; /* Fits exactly 3 skill items: 3*44px + 2*24px gaps + 32px padding */
  overflow: hidden;
  transition: max-height var(--motion-fast) var(--motion-ease-out-gentle);
}

.skills-bottom-sheet.expanded .skills-container {
  max-height: 70vh;
  overflow-y: auto;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
  max-width: 500px;
}

/* Skill Item */
.skill-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-item.clickable {
  cursor: pointer;
}

.skill-item.clickable:active {
  opacity: 0.8;
}

.skill-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.skill-icon-placeholder {
  width: 44px;
  height: 44px;
}

.skill-icon-placeholder svg {
  width: 100%;
  height: 100%;
}

/* Locked/empty skill styles */
.skill-item.locked .skill-name {
  color: rgba(255, 255, 255, 0.5);
}

.skill-item.locked .skill-counter {
  color: rgba(255, 255, 255, 0.5);
}

.skill-item.locked .progress-bg {
  opacity: 0.5;
}

.skill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.skill-name {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  color: white;
}

.skill-counter {
  display: flex;
  align-items: center;
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  line-height: 20px;
  color: white;
}

.skill-counter .current {
  font-weight: 700;
}

.skill-counter .separator {
  font-weight: 800;
  margin: 0 1px;
}

.skill-counter .max {
  font-weight: 700;
}

/* Progress Bar */
.progress-bar {
  position: relative;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.progress-bg {
  position: absolute;
  inset: 0;
  background: #4b4847;
  border-radius: 8px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #81b64c;
  border-radius: 10px;
  transition: width var(--motion-steady) var(--motion-ease-out-gentle);
}

/* Home Indicator */
.home-indicator-container {
  height: 24px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
}

.home-indicator {
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 100px;
}
</style>
