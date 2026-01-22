/**
 * Chess utility for parsing PGN and calculating board positions
 */

// Starting position
const INITIAL_POSITION = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
]

// Piece mappings for our board component
const PIECE_MAP = {
  'K': 'wk', 'Q': 'wq', 'R': 'wr', 'B': 'wb', 'N': 'wn', 'P': 'wp',
  'k': 'bk', 'q': 'bq', 'r': 'br', 'b': 'bb', 'n': 'bn', 'p': 'bp',
}

// File to column index
const fileToCol = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0)
// Rank to row index (8 = 0, 1 = 7)
const rankToRow = (rank) => 8 - parseInt(rank)

/**
 * Deep clone a board
 */
function cloneBoard(board) {
  return board.map(row => [...row])
}

/**
 * Find a piece on the board that can move to the target square
 */
function findPiece(board, piece, toCol, toRow, fromFile, fromRank, isWhite) {
  const targetPiece = isWhite ? piece.toUpperCase() : piece.toLowerCase()
  
  const candidates = []
  
  // Debug for bishop moves to row 1 (rank 7)
  const debugThis = piece === 'B' && toRow === 1
  if (debugThis) {
    console.log(`findPiece: Looking for ${targetPiece} that can reach ${String.fromCharCode(97 + toCol)}${8 - toRow}`)
  }
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === targetPiece) {
        if (debugThis) {
          console.log(`  Found ${targetPiece} at ${String.fromCharCode(97 + col)}${8 - row} (col=${col}, row=${row})`)
        }
        
        // Check file/rank hints
        if (fromFile !== null && col !== fromFile) continue
        if (fromRank !== null && row !== fromRank) continue
        
        // Check if this piece can legally reach the target
        const canReach = canPieceReach(board, piece, col, row, toCol, toRow, isWhite)
        if (debugThis) {
          console.log(`    canPieceReach from (${col},${row}) to (${toCol},${toRow}): ${canReach}`)
        }
        
        if (canReach) {
          candidates.push({ col, row })
        }
      }
    }
  }
  
  if (debugThis) {
    console.log(`  Candidates found: ${candidates.length}`)
  }
  
  return candidates[0] || null
}

/**
 * Check if a piece can reach a target square (simplified - doesn't check all rules)
 */
function canPieceReach(board, piece, fromCol, fromRow, toCol, toRow, isWhite) {
  const dCol = toCol - fromCol
  const dRow = toRow - fromRow
  
  switch (piece.toUpperCase()) {
    case 'P': {
      const direction = isWhite ? -1 : 1
      // Normal move (must be to empty square)
      if (dCol === 0 && dRow === direction && !board[toRow][toCol]) return true
      // Double move from starting position (must be to empty square, path clear)
      const startRow = isWhite ? 6 : 1
      if (dCol === 0 && fromRow === startRow && dRow === 2 * direction && 
          !board[toRow][toCol] && !board[fromRow + direction][fromCol]) return true
      // Capture (must have enemy piece on target square, or en passant)
      if (Math.abs(dCol) === 1 && dRow === direction) {
        const targetPiece = board[toRow][toCol]
        // Must have a piece to capture (enemy piece)
        if (targetPiece) {
          const isEnemyPiece = isWhite ? targetPiece === targetPiece.toLowerCase() : targetPiece === targetPiece.toUpperCase()
          return isEnemyPiece
        }
        // En passant: target square empty but there's an enemy pawn beside us
        // (simplified check - doesn't verify it was a double pawn push)
        const enPassantRow = isWhite ? 3 : 4
        if (fromRow === enPassantRow) {
          const adjacentPawn = board[fromRow][toCol]
          if (adjacentPawn) {
            const isEnemyPawn = isWhite ? adjacentPawn === 'p' : adjacentPawn === 'P'
            return isEnemyPawn
          }
        }
        return false
      }
      return false
    }
    case 'N':
      return (Math.abs(dCol) === 2 && Math.abs(dRow) === 1) ||
             (Math.abs(dCol) === 1 && Math.abs(dRow) === 2)
    case 'B': {
      const isDiagonal = Math.abs(dCol) === Math.abs(dRow)
      if (!isDiagonal) {
        console.log(`    Bishop: Not diagonal (dCol=${dCol}, dRow=${dRow})`)
        return false
      }
      const pathClear = isPathClear(board, fromCol, fromRow, toCol, toRow)
      if (!pathClear) {
        console.log(`    Bishop: Path not clear from (${fromCol},${fromRow}) to (${toCol},${toRow})`)
      }
      return pathClear
    }
    case 'R':
      if (dCol !== 0 && dRow !== 0) return false
      return isPathClear(board, fromCol, fromRow, toCol, toRow)
    case 'Q':
      if (dCol !== 0 && dRow !== 0 && Math.abs(dCol) !== Math.abs(dRow)) return false
      return isPathClear(board, fromCol, fromRow, toCol, toRow)
    case 'K':
      // Normal king move
      if (Math.abs(dCol) <= 1 && Math.abs(dRow) <= 1) return true
      // Castling
      if (Math.abs(dCol) === 2 && dRow === 0) return true
      return false
    default:
      return false
  }
}

/**
 * Check if path is clear between two squares
 */
function isPathClear(board, fromCol, fromRow, toCol, toRow) {
  const dCol = Math.sign(toCol - fromCol)
  const dRow = Math.sign(toRow - fromRow)
  
  let col = fromCol + dCol
  let row = fromRow + dRow
  
  while (col !== toCol || row !== toRow) {
    if (board[row][col]) return false
    col += dCol
    row += dRow
  }
  
  return true
}

/**
 * Apply a move to the board and return new board state
 */
function applyMove(board, moveStr, isWhite) {
  const newBoard = cloneBoard(board)
  
  // Handle castling
  if (moveStr === 'O-O' || moveStr === '0-0') {
    const row = isWhite ? 7 : 0
    const king = isWhite ? 'K' : 'k'
    const rook = isWhite ? 'R' : 'r'
    newBoard[row][4] = null
    newBoard[row][7] = null
    newBoard[row][6] = king
    newBoard[row][5] = rook
    return newBoard
  }
  
  if (moveStr === 'O-O-O' || moveStr === '0-0-0') {
    const row = isWhite ? 7 : 0
    const king = isWhite ? 'K' : 'k'
    const rook = isWhite ? 'R' : 'r'
    newBoard[row][4] = null
    newBoard[row][0] = null
    newBoard[row][2] = king
    newBoard[row][3] = rook
    return newBoard
  }
  
  // Parse the move
  let move = moveStr.replace(/[+#!?]/g, '') // Remove check/mate/annotation symbols
  
  let piece = 'P'
  let fromFile = null
  let fromRank = null
  let toFile = null
  let toRank = null
  let promotion = null
  let isCapture = move.includes('x')
  
  move = move.replace('x', '')
  
  // Check for promotion
  if (move.includes('=')) {
    const parts = move.split('=')
    move = parts[0]
    promotion = parts[1]
  }
  
  // Determine piece type
  if (move[0] >= 'A' && move[0] <= 'Z' && move[0] !== 'O') {
    piece = move[0]
    move = move.slice(1)
  }
  
  // Parse destination (last two characters)
  toFile = fileToCol(move[move.length - 2])
  toRank = rankToRow(move[move.length - 1])
  
  // Parse disambiguation (if any)
  const disambig = move.slice(0, -2)
  if (disambig.length === 1) {
    if (disambig >= 'a' && disambig <= 'h') {
      fromFile = fileToCol(disambig)
    } else {
      fromRank = rankToRow(disambig)
    }
  } else if (disambig.length === 2) {
    fromFile = fileToCol(disambig[0])
    fromRank = rankToRow(disambig[1])
  }
  
  // For pawn captures, the first letter is the source file
  if (piece === 'P' && isCapture && fromFile === null) {
    fromFile = fileToCol(moveStr[0])
  }
  
  // Special debug for Be7 move
  if (moveStr.includes('Be7') || moveStr.includes('e7')) {
    console.log('=== DEBUG Be7 move ===')
    console.log('Looking for bishop to move to e7')
    console.log('Board state:')
    console.log('    a b c d e f g h')
    newBoard.forEach((row, i) => console.log(`${8-i}:  ${row.map(p => p || '.').join(' ')}`))
    
    // Check d6 specifically
    console.log(`d6 (col=3, row=2) contains: ${newBoard[2][3] || 'empty'}`)
    console.log(`e7 (col=4, row=1) contains: ${newBoard[1][4] || 'empty'}`)
  }
  
  // Find the piece that's moving
  const from = findPiece(newBoard, piece, toFile, toRank, fromFile, fromRank, isWhite)
  
  if (!from) {
    // Debug: print the board state to help diagnose
    console.warn(`Could not find ${isWhite ? 'white' : 'black'} ${piece} that can move to ${String.fromCharCode(97 + toFile)}${8 - toRank}`)
    console.warn('Move details:', { moveStr, piece, toFile, toRank, fromFile, fromRank })
    console.warn('Board state:')
    console.log('    a b c d e f g h')
    newBoard.forEach((row, i) => console.log(`${8-i}:  ${row.map(p => p || '.').join(' ')}`))
    
    // Also show where pieces of this type are
    const targetPiece = isWhite ? piece.toUpperCase() : piece.toLowerCase()
    console.warn(`Looking for ${targetPiece} pieces on the board:`)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (newBoard[r][c] === targetPiece) {
          console.log(`  Found ${targetPiece} at ${String.fromCharCode(97 + c)}${8 - r}`)
        }
      }
    }
  }
  
  if (from) {
    // Move the piece
    newBoard[from.row][from.col] = null
    
    // Handle en passant
    if (piece === 'P' && isCapture && !board[toRank][toFile]) {
      // En passant capture
      const captureRow = isWhite ? toRank + 1 : toRank - 1
      newBoard[captureRow][toFile] = null
    }
    
    // Place the piece (or promoted piece)
    if (promotion) {
      newBoard[toRank][toFile] = isWhite ? promotion.toUpperCase() : promotion.toLowerCase()
    } else {
      newBoard[toRank][toFile] = isWhite ? piece.toUpperCase() : piece.toLowerCase()
    }
  }
  
  return newBoard
}

/**
 * Parse PGN moves string into array of move objects
 */
export function parsePGN(pgn) {
  // Extract headers
  const headers = {}
  const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g
  let match
  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2]
  }
  
  // Extract moves (remove headers, comments, and result)
  let movesText = pgn
    .replace(/\[[^\]]+\]/g, '') // Remove headers
    .replace(/\{[^}]+\}/g, '')  // Remove comments
    .replace(/\([^)]+\)/g, '')  // Remove variations
    .replace(/\d+\.\.\./g, '')  // Remove "..." notation
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, '') // Remove result
    .replace(/\s+/g, ' ')  // Normalize whitespace (newlines to spaces)
    .trim()
  
  // Parse individual moves - improved regex
  const moveRegex = /(\d+)\.\s*([a-zA-Z][a-zA-Z0-9+#=\-]+)(?:\s+([a-zA-Z][a-zA-Z0-9+#=\-]+))?/g
  const moves = []
  
  while ((match = moveRegex.exec(movesText)) !== null) {
    const moveNum = parseInt(match[1])
    const whiteMove = match[2]
    // Make sure black's move isn't the next move number
    let blackMove = match[3] || null
    if (blackMove && /^\d+$/.test(blackMove)) {
      blackMove = null // It's actually the next move number, not a move
    }
    
    moves.push({
      index: moveNum,
      white: whiteMove,
      black: blackMove,
    })
  }
  
  return { headers, moves }
}

/**
 * Calculate all board positions from a list of moves
 * Returns array of positions, where index 0 is starting position,
 * index 1 is after white's first move, index 2 is after black's first move, etc.
 */
export function calculatePositions(moves) {
  const positions = [cloneBoard(INITIAL_POSITION)]
  let currentBoard = cloneBoard(INITIAL_POSITION)
  
  for (const move of moves) {
    // White's move
    if (move.white) {
      const prevBoard = cloneBoard(currentBoard)
      currentBoard = applyMove(currentBoard, move.white, true)
      // Debug: check if move was applied
      if (JSON.stringify(prevBoard) === JSON.stringify(currentBoard)) {
        console.error(`❌ Move ${move.index}. ${move.white} (white) FAILED - board unchanged`)
      } else {
        console.log(`✓ Move ${move.index}. ${move.white} (white) applied`)
      }
      positions.push(cloneBoard(currentBoard))
    }
    
    // Black's move
    if (move.black) {
      const prevBoard = cloneBoard(currentBoard)
      currentBoard = applyMove(currentBoard, move.black, false)
      // Debug: check if move was applied
      if (JSON.stringify(prevBoard) === JSON.stringify(currentBoard)) {
        console.error(`❌ Move ${move.index}... ${move.black} (black) FAILED - board unchanged`)
      } else {
        console.log(`✓ Move ${move.index}... ${move.black} (black) applied`)
      }
      positions.push(cloneBoard(currentBoard))
    }
  }
  
  console.log(`Calculated ${positions.length} positions for ${moves.length} moves`)
  
  // Debug: print final board state
  console.log('Final board state:')
  console.log('    a b c d e f g h')
  currentBoard.forEach((row, i) => console.log(`${8-i}:  ${row.map(p => p || '.').join(' ')}`))
  
  return positions
}

/**
 * Convert internal board representation to pieces array for Board component
 */
export function boardToPieces(board) {
  const pieces = []
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (piece) {
        const rank = 8 - row
        const file = files[col]
        pieces.push({
          type: PIECE_MAP[piece],
          square: `${file}${rank}`,
        })
      }
    }
  }
  
  return pieces
}

/**
 * Get the last move's from/to squares for highlighting
 */
export function getLastMoveSquares(moves, plyIndex) {
  if (plyIndex <= 0) return { from: null, to: null }
  
  // Determine which move and which ply (white or black)
  const moveIndex = Math.floor((plyIndex - 1) / 2)
  const isBlackMove = (plyIndex - 1) % 2 === 1
  
  if (moveIndex >= moves.length) return { from: null, to: null }
  
  const move = moves[moveIndex]
  const moveStr = isBlackMove ? move.black : move.white
  
  if (!moveStr) return { from: null, to: null }
  
  // Extract destination square from move notation
  const clean = moveStr.replace(/[+#!?x=]/g, '').replace(/[KQRBN]/g, '')
  const to = clean.slice(-2)
  
  return { from: null, to } // We don't track 'from' easily without full move history
}

/**
 * Mark brilliant/interesting moves
 */
export function markBrilliantMoves(moves, brilliantMoveNumbers) {
  return moves.map(move => ({
    ...move,
    classification: brilliantMoveNumbers.includes(move.index) ? 'brilliant' : null,
  }))
}
