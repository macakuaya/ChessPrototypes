<script setup>
import { ref } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: true },
  showTabs: { type: Boolean, default: true }, // Hide tabs for FTUE
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

const activeTab = ref('tactics')
const isExpanded = ref(false)

// Drag state
const isDragging = ref(false)
const dragStartY = ref(0)
const dragCurrentY = ref(0)

const tabs = [
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
    <!-- Top Container: Handle + Title + Tabs -->
    <div 
      class="sheet-top"
      :class="{ 'no-tabs': !showTabs }"
      @mousedown.prevent="onDragStart"
      @mousemove="onDragMove"
      @touchstart.passive="onDragStart"
      @touchmove.passive="onDragMove"
    >
      <!-- Drag Handle -->
      <div class="drag-container" @click="onTapToggle">
        <div class="drag-handle"></div>
      </div>
      
      <!-- Title -->
      <div class="title-container">
        <h2 class="title">Skills</h2>
      </div>
      
      <!-- Tabs (hidden for FTUE) -->
      <div v-if="showTabs" class="tabs-container">
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
    </div>
    
    <!-- Skills List -->
    <div class="skills-container">
      <div class="skills-list">
        <div 
          v-for="skill in skills" 
          :key="skill.name"
          class="skill-item"
          :class="{ locked: skill.locked }"
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
    
    <!-- Home Indicator -->
    <div class="home-indicator-container">
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<style scoped>
.skills-bottom-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #262421;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
  transform: translateY(100%);
  transition: transform 150ms cubic-bezier(0, 0, 0.2, 1);
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

/* Top Container */
.sheet-top {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: grab;
  user-select: none;
}

.sheet-top.no-tabs {
  border-bottom: none;
}

.sheet-top:active {
  cursor: grabbing;
}

/* Drag Handle */
.drag-container {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}

.drag-handle {
  width: 60px;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
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
.tabs-container {
  display: flex;
  height: 56px;
  padding: 0;
}

.tab {
  flex: 1;
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
  transition: color 150ms ease, border-color 150ms ease;
}

.tab:hover {
  color: rgba(255, 255, 255, 0.85);
}

.tab.active {
  color: rgba(255, 255, 255, 0.85);
  border-bottom-color: #81b64c;
}

/* Skills Container */
.skills-container {
  padding: 0 12px;
  max-height: 212px; /* Fits exactly 3 skill items: 3*44px + 2*24px gaps + 32px padding */
  overflow: hidden;
  transition: max-height 150ms cubic-bezier(0, 0, 0.2, 1);
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
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
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
