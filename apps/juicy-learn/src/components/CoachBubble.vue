<script setup>
import { computed } from 'vue'

const base = import.meta.env.BASE_URL

const props = defineProps({
  // State type: 'white-to-move', 'black-to-move', 'correct', 'incorrect', or custom header
  state: { type: String, default: '' },
  // Header text (can be auto-generated from state or custom)
  headerText: { type: String, default: '' },
  // Move notation for correct/incorrect states (e.g., "e4", "Rxd6")
  moveNotation: { type: String, default: '' },
  // Custom message
  message: { type: String, default: '' },
  // Show the tip pointing to avatar
  showTip: { type: Boolean, default: true },
})

// Compute the header title based on state
const displayHeaderText = computed(() => {
  if (props.headerText) return props.headerText
  
  switch (props.state) {
    case 'white-to-move':
      return 'White to move'
    case 'black-to-move':
      return 'Black to move'
    case 'correct':
      return props.moveNotation ? `${props.moveNotation} is correct` : 'Correct!'
    case 'incorrect':
      return props.moveNotation ? `${props.moveNotation} is incorrect` : 'Incorrect'
    default:
      return ''
  }
})

// Determine if we should show an icon/indicator based on state
const showStateIndicator = computed(() => {
  return ['white-to-move', 'black-to-move', 'correct', 'incorrect'].includes(props.state)
})

const avatarSrc = `${base}icons/misc/coach-avatar.png`
const tipSrc = `${base}icons/misc/bubble-tip.svg`
</script>

<template>
  <div class="coach-container">
    <!-- Coach Avatar -->
    <div class="coach-avatar">
      <img :src="avatarSrc" alt="Coach" />
    </div>
    
    <!-- Speech Bubble -->
    <div class="bubble">
      <!-- Tip pointing to avatar -->
      <div v-if="showTip" class="tip">
        <img :src="tipSrc" alt="" />
      </div>
      
      <div class="bubble-content">
        <!-- Header with state indicator -->
        <div v-if="showStateIndicator || displayHeaderText" class="bubble-header">
          <div class="classification">
            <!-- White to move: white square with gray border -->
            <div v-if="state === 'white-to-move'" class="color-indicator white-indicator"></div>
            
            <!-- Black to move: black square with gray border -->
            <div v-if="state === 'black-to-move'" class="color-indicator black-indicator"></div>
            
            <!-- Correct: green checkmark circle -->
            <svg v-if="state === 'correct'" class="state-icon correct-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#81B64C"/>
              <path d="M7 12.5L10.5 16L17 9" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            
            <!-- Incorrect: red X circle -->
            <svg v-if="state === 'incorrect'" class="state-icon incorrect-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#E02828"/>
              <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            
            <span class="classification-text">{{ displayHeaderText }}</span>
          </div>
        </div>
        
        <!-- Coach message -->
        <p v-if="message" class="coach-message">{{ message }}</p>
        
        <!-- Fallback for empty -->
        <p v-if="!showStateIndicator && !displayHeaderText && !message" class="empty">No message</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coach-container {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0;
  width: 100%;
  min-height: 128px;
}

.coach-avatar {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 5px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  position: relative;
  flex: 1;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  margin-left: -6px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
}

.tip {
  position: absolute;
  left: -13px;
  bottom: 20px;
  width: 14px;
  height: 22px;
  z-index: 1;
}

.tip img {
  width: 100%;
  height: 100%;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  min-height: 64px;
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.classification {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

/* Color indicator squares (White/Black to move) */
.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 2px solid #8b8987;
  flex-shrink: 0;
}

.white-indicator {
  background: white;
}

.black-indicator {
  background: black;
}

/* State icons (Correct/Incorrect) */
.state-icon {
  flex-shrink: 0;
}

.correct-icon {
  color: #81B64C;
}

.incorrect-icon {
  color: #E02828;
}

/* text-large-bold: 16px / 20px / 600 */
.classification-text {
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

/* paragraph-medium-bold: 14px / 20px / 600 */
.coach-message {
  margin: 0;
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.empty {
  margin: 0;
  color: #9a9a9a;
  font-size: 14px;
}
</style>
