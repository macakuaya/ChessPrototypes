<script setup>
import { ref } from 'vue'
import { CcButton } from '@chesscom/design-system'

// State
const currentChallenge = ref(2)
const totalChallenges = ref(3)
const streak = ref(5)
const coachMessage = ref('Coach text placeholder')
const progressPercent = ref((2 / 3) * 100)
</script>

<template>
  <div class="app">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="chessboard">
          <template v-for="row in 8" :key="row">
            <div 
              v-for="col in 8" 
              :key="`${row}-${col}`"
              class="square"
              :class="(row + col) % 2 === 0 ? 'light' : 'dark'"
            />
          </template>
        </div>
        <div class="board-icon">⚙️</div>
      </div>

      <!-- Right: Panel -->
      <div class="review-panel">
        <!-- Header -->
        <header class="panel-header">
          <button class="icon-btn">←</button>
          <div class="header-title">📚 Evaluating Captures</div>
          <button class="icon-btn">🔊</button>
        </header>

        <!-- Content -->
        <div class="panel-content">
          <!-- Coach -->
          <div class="coach-section">
            <div class="coach-avatar"></div>
            <div class="coach-bubble">
              <p>{{ coachMessage }}</p>
            </div>
          </div>

          <!-- Progress -->
          <div class="progress-section">
            <div class="progress-label">Challenge {{ currentChallenge }}/{{ totalChallenges }}</div>
            <div class="progress-row">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="queen-badge">♕</div>
            </div>
            <div class="streak">🔥 {{ streak }}</div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="panel-footer">
          <div class="action-buttons">
            <CcButton variant="secondary" size="large">▶ Video</CcButton>
            <CcButton variant="secondary" size="large">💡 Hint</CcButton>
          </div>
          <div class="toolbar">
            <div class="toolbar-group">
              <button class="tool-btn">↗</button>
              <button class="tool-btn">⟳</button>
              <button class="tool-btn">↩</button>
            </div>
            <div class="toolbar-group">
              <button class="tool-btn">‹</button>
              <button class="tool-btn">›</button>
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
  color: var(--color-text-default, white);
  font-family: system-ui, sans-serif;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.layout {
  display: flex;
}

/* Board */
.board-section {
  display: flex;
}

.chessboard {
  width: 500px;
  height: 500px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-radius: 3px;
  overflow: hidden;
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

.board-icon {
  padding: 8px;
  opacity: 0.5;
}

/* Panel */
.review-panel {
  width: 400px;
  height: 500px;
  background: rgba(0,0,0,0.2);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  height: 48px;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-weight: 700;
  font-size: 17px;
}

.panel-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coach-section {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.coach-avatar {
  width: 80px;
  height: 80px;
  background: #262421;
  border-radius: 8px;
  flex-shrink: 0;
}

.coach-bubble {
  flex: 1;
  background: white;
  color: #312e2b;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 15px;
}

.coach-bubble p { margin: 0; }

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-label {
  font-weight: 700;
  font-size: 17px;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 16px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #81b64c;
  border-radius: 10px;
}

.queen-badge {
  width: 28px;
  height: 28px;
  background: #81b64c;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(30deg);
  box-shadow: 0 2px 0 #45753c;
  color: #ebffbd;
}

.streak {
  color: #fa742c;
  font-weight: 700;
  font-size: 17px;
}

.panel-footer {
  background: rgba(0,0,0,0.2);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons > :deep(button) {
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
}

.toolbar-group {
  display: flex;
  gap: 8px;
}

.tool-btn {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
}
</style>
