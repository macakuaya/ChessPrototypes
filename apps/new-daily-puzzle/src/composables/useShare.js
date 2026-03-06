import { ref } from 'vue'

export function useShare(puzzle, parseFEN, lives, successTitle) {
  const panelShareCopied = ref(false)
  const dialogueShareCopied = ref(false)

  const generateShareMessage = () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null))
    const initialPieces = parseFEN(puzzle.initialFEN)

    for (const p of initialPieces) {
      const file = p.square.charCodeAt(0) - 'a'.charCodeAt(0)
      const rank = parseInt(p.square[1]) - 1
      const row = 7 - rank
      if (p.type === 'wk' || p.type === 'bk') {
        board[row][file] = 'king'
      } else {
        board[row][file] = p.type.startsWith('w') ? 'w' : 'b'
      }
    }

    const solutionSquares = new Set()
    for (const m of puzzle.moves) {
      solutionSquares.add(m.from)
      solutionSquares.add(m.to)
    }
    for (const sq of solutionSquares) {
      const file = sq.charCodeAt(0) - 'a'.charCodeAt(0)
      const rank = parseInt(sq[1]) - 1
      const row = 7 - rank
      if (board[row][file] !== 'b') board[row][file] = 'w'
    }

    const grid = board.map((row, r) =>
      row.map((cell, c) => {
        if (cell === 'king') return '👑'
        if (cell === 'b') return '⚫'
        if (cell === 'w') return '🟡'
        return (r + c) % 2 === 0 ? '⬜' : '🟩'
      }).join('')
    ).join('\n')

    const heartsLine = '💚'.repeat(lives.value) + '🖤'.repeat(puzzle.results.totalLives - lives.value)

    return [
      'Chess.com/daily',
      `\u201C${puzzle.title}\u201D`,
      `${heartsLine} ${successTitle.value}`,
      '',
      grid,
    ].join('\n')
  }

  const handlePanelShare = async () => {
    const message = generateShareMessage()
    try {
      await navigator.clipboard.writeText(message)
      panelShareCopied.value = true
      setTimeout(() => { panelShareCopied.value = false }, 2000)
    } catch (e) {
      console.warn('Clipboard copy failed:', e)
    }
  }

  const handleDialogueShare = async () => {
    const message = generateShareMessage()
    try {
      await navigator.clipboard.writeText(message)
      dialogueShareCopied.value = true
      setTimeout(() => { dialogueShareCopied.value = false }, 2000)
    } catch (e) {
      console.warn('Clipboard copy failed:', e)
    }
  }

  return { panelShareCopied, dialogueShareCopied, handlePanelShare, handleDialogueShare }
}
