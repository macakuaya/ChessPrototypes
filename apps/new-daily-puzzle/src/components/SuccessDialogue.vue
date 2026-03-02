<script setup>
import { computed } from 'vue'
import { CcButton, CcIcon } from '@chesscom/design-system'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Perfect!' },
  subtitle: { type: String, default: '' },
  heartsRemaining: { type: Number, default: 5 },
  heartsTotal: { type: Number, default: 5 },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'share', 'more-puzzles'])

const subtitleLines = computed(() => props.subtitle.split('\n').filter(Boolean))

const hearts = computed(() => {
  const result = []
  for (let i = 0; i < props.heartsTotal; i++) {
    result.push(i < props.heartsRemaining)
  }
  return result
})
</script>

<template>
  <Transition name="dialogue-overlay">
    <div v-if="open" class="overlay" @click.self="emit('close')">
      <Transition name="dialogue-content" appear>
        <div v-if="open" class="dialogue">

          <!-- Close button -->
          <button class="close-btn" @click="emit('close')" aria-label="Close">
            <CcIcon name="mark-cross" :size="16" />
          </button>

          <!-- Main content (vertically centered, grows to fill) -->
          <div class="text-section">
            <div class="title-group">
              <h2 class="title">{{ title }}</h2>
              <p class="subtitle">
                <template v-for="(line, i) in subtitleLines" :key="i">
                  {{ line }}<br v-if="i < subtitleLines.length - 1" />
                </template>
              </p>
            </div>

            <!-- Hearts -->
            <div class="hearts">
              <CcIcon
                v-for="(alive, i) in hearts"
                :key="i"
                :name="alive ? 'emote-heart-fill' : 'emote-heart-broken'"
                :size="40"
                class="heart"
                :class="alive ? 'heart-alive' : 'heart-lost'"
              />
            </div>

            <!-- Share CTA -->
            <div class="cta">
              <CcButton
                variant="primary"
                size="xx-large"
                :full-width="true"
                @click="emit('share')"
              >
                Share Your Results
              </CcButton>
            </div>
          </div>

          <!-- Bottom: stats + secondary action -->
          <div class="bottom-section">
            <div class="stats">
              <div class="stat">
                <span class="stat-value">{{ currentStreak }}</span>
                <span class="stat-label">Streak</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ maxStreak }}</span>
                <span class="stat-label">Max Streak</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ totalSolved }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>

            <CcButton
              variant="ghost"
              size="large"
              :full-width="true"
              :icon="{ name: 'game-type-puzzle', variant: 'glyph' }"
              @click="emit('more-puzzles')"
            >
              Solve more Puzzles
            </CcButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* ===== OVERLAY ===== */
.overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-overlay);
  border-radius: 3px;
}

/* ===== DIALOGUE (centered card) ===== */
.dialogue {
  width: 400px;
  max-width: calc(100% - 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 12px 12px;
  position: relative;
  overflow: clip;

  background:
    linear-gradient(
      180deg,
      var(--color-bg-gradient-bottom, rgba(0, 0, 0, 0)) 0%,
      var(--color-bg-gradient-top, rgba(0, 0, 0, 0.3)) 100%
    ),
    #312E2B;
  border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
  border-radius: 10px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.65);
}

/* ===== CLOSE BUTTON ===== */
.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: none;
  border: none;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

/* ===== TEXT SECTION (grows to fill, centers content) ===== */
.text-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: 500px;
  width: 100%;
}

/* Title + Subtitle */
.title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  width: 100%;
}

.title {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-weight: 800;
  font-size: 28px;
  line-height: 32px;
  color: var(--color-text-boldest, white);
  margin: 0;
  font-feature-settings: 'liga' 0;
}

.subtitle {
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: var(--color-text-bolder, rgba(255, 255, 255, 0.85));
  margin: 0;
}

/* Hearts row */
.hearts {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heart-alive {
  color: var(--color-green-300, #81B64C);
}

.heart-lost {
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  opacity: 0.4;
}

/* Share CTA (full-width wrapper) */
.cta {
  width: 100%;
}

/* ===== BOTTOM SECTION ===== */
.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* Stats row */
.stats {
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 0;
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
  border-radius: 3px;
}

.stat-label {
  font-family: var(--font-family-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif);
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
  text-align: center;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.stat-value {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-weight: 800;
  font-size: 22px;
  line-height: 28px;
  color: var(--color-text-boldest, white);
  text-align: center;
  min-width: 100%;
  font-feature-settings: 'liga' 0;
}

/* ===== TRANSITIONS ===== */

/* Overlay: 100ms fade with ease-out-strong */
.dialogue-overlay-enter-active,
.dialogue-overlay-leave-active {
  transition: opacity 100ms var(--motion-ease-out-strong, cubic-bezier(0, 0, 0.4, 1));
}
.dialogue-overlay-enter-from,
.dialogue-overlay-leave-to {
  opacity: 0;
}

/* Content: scale + fade */
.dialogue-content-enter-active {
  transition:
    transform 350ms cubic-bezier(0, 0, 0.2, 1),
    opacity 200ms ease;
}
.dialogue-content-leave-active {
  transition:
    transform 200ms ease,
    opacity 150ms ease;
}
.dialogue-content-enter-from {
  transform: scale(0.92) translateY(12px);
  opacity: 0;
}
.dialogue-content-leave-to {
  transform: scale(0.96);
  opacity: 0;
}
</style>
