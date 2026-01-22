<script setup>
import { computed } from 'vue'

const props = defineProps({
  evalText: { type: String, default: '' },
  blackWidth: { type: Number, default: 50 },
  whiteWidth: { type: Number, default: 50 },
})

// Determine which side has the advantage
const whiteHasAdvantage = computed(() => props.whiteWidth > props.blackWidth)
</script>

<template>
  <div class="eval-bar-wrapper">
    <div class="eval-track">
      <div 
        class="eval-segment black" 
        :style="{ flex: props.blackWidth, minWidth: !whiteHasAdvantage ? '40px' : '4px' }"
      >
        <span v-if="!whiteHasAdvantage" class="eval-text black-text">{{ evalText || '—' }}</span>
      </div>
      <div 
        class="eval-segment white" 
        :style="{ flex: props.whiteWidth, minWidth: whiteHasAdvantage ? '40px' : '4px' }"
      >
        <span v-if="whiteHasAdvantage" class="eval-text white-text">{{ evalText || '—' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eval-bar-wrapper {
  width: 100%;
  padding: 12px 12px 0 12px;
}

.eval-track {
  width: 100%;
  height: 20px;
  display: flex;
  border-radius: 3px;
  overflow: hidden;
}

.eval-segment.black {
  background: #403d39;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 4px;
  overflow: hidden;
  transition: flex 0.3s ease-out;
}

.eval-segment.white {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 4px;
  overflow: hidden;
  transition: flex 0.3s ease-out;
}

.eval-text {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
  white-space: nowrap;
}

.eval-text.black-text {
  color: #ffffff;
}

.eval-text.white-text {
  color: #403d39;
}
</style>
