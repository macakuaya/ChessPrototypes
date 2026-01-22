<script setup>
import { computed } from 'vue'

const base = import.meta.env.BASE_URL

const props = defineProps({
  headerIcon: { type: String, default: '' },
  headerText: { type: String, default: '' },
  evalText: { type: String, default: '' },
  message: { type: String, default: '' },
  showTip: { type: Boolean, default: true },
})

// Default to brilliant icon if no icon specified
const iconSrc = computed(() => props.headerIcon || `${base}icons/move-classifications/brilliant.svg`)
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
        <!-- Header with classification + eval -->
        <div v-if="headerText" class="bubble-header">
          <div class="classification">
            <img v-if="iconSrc" :src="iconSrc" alt="" class="classification-icon" />
            <span class="classification-text">{{ headerText }}</span>
          </div>
          <div v-if="evalText" class="eval-badge">
            <span>{{ evalText }}</span>
          </div>
        </div>
        
        <!-- Coach message -->
        <p v-if="message" class="coach-message">{{ message }}</p>
        
        <!-- Fallback for empty -->
        <p v-if="!headerText && !message" class="empty">No message</p>
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
  min-height: 96px;
}

.coach-avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 3px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  position: relative;
  flex: 1;
  max-width: 275px;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  margin-left: -6px;
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
  padding: 12px;
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

.classification-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.classification-text {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.eval-badge {
  background: #4b4847;
  border-radius: 5px;
  padding: 4px 8px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  box-sizing: border-box;
}

.eval-badge span {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: #e7e6e5;
  white-space: nowrap;
}

.coach-message {
  margin: 0;
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: #312e2b;
}

.empty {
  margin: 0;
  color: #9a9a9a;
  font-size: 14px;
}
</style>
