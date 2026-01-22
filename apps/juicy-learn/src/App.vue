<script setup>
import { CcButton } from '@chesscom/design-system'
import '@chesscom/design-system/dist/variables.css'
import '@chesscom/design-system/dist/cc-utils.css'
import '@chesscom/design-system/dist/style.css'

// Example: importing from shared chess components
// import { BoardCelebration, playSound } from '@chess/components'
</script>

<template>
  <div class="app">
    <div class="phone-frame">
      <header class="header">
        <h1>🎮 Juicy Learn</h1>
        <p class="subtitle">A new Chess.com prototype</p>
      </header>

      <main class="content">
        <div class="placeholder-board">
          <span>Board goes here</span>
        </div>
        
        <div class="actions">
          <CcButton variant="primary" size="large">Start Learning</CcButton>
        </div>
      </main>

      <footer class="footer">
        <p>Built with ❤️ for Chess.com</p>
      </footer>
    </div>
  </div>
</template>

<style>
@font-face {
  font-family: 'Chess Sans';
  src: url('/fonts/ChessSansVF.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
</style>

<style scoped>
.app {
  background: #1f1f1f;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'Chess Sans', system-ui, -apple-system, sans-serif;
}

.phone-frame {
  width: 375px;
  height: 812px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%),
    #312e2b;
  border-radius: 40px;
  box-shadow: 
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 12px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  color: #ffffff;
  overflow: hidden;
}

.header {
  padding: 60px 24px 24px;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  gap: 32px;
}

.placeholder-board {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.actions {
  display: flex;
  gap: 12px;
}

.footer {
  padding: 24px;
  text-align: center;
}

.footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}
</style>
