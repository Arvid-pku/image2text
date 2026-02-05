import { Character } from './Character.js'

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.characters = []
    this.cols = 0
    this.rows = 0
    this.charWidth = 10
    this.charHeight = 18
    this.colorMode = false
    this.font = '14px "IBM Plex Mono"'
  }

  setAsciiData({ characters, cols, rows }) {
    this.cols = cols
    this.rows = rows

    // Calculate char size to fit canvas
    this.charWidth = this.canvas.width / cols
    this.charHeight = this.canvas.height / rows

    // Create Character objects
    this.characters = characters.map(data => new Character({
      ...data,
      charWidth: this.charWidth,
      charHeight: this.charHeight
    }))
  }

  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height

    if (this.cols > 0) {
      this.charWidth = width / this.cols
      this.charHeight = height / this.rows

      // Update character positions
      this.characters.forEach(char => {
        char.targetX = char.col * this.charWidth
        char.targetY = char.row * this.charHeight
        char.x = char.targetX
        char.y = char.targetY
      })
    }
  }

  update(dt) {
    this.characters.forEach(char => char.update(dt))
  }

  draw() {
    const { ctx, canvas, charWidth, charHeight, colorMode } = this

    // Clear canvas
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set font
    ctx.font = this.font

    // Draw all characters
    this.characters.forEach(char => {
      char.draw(ctx, charWidth, charHeight, colorMode)
    })
  }

  getCharacterAt(x, y) {
    const col = Math.floor(x / this.charWidth)
    const row = Math.floor(y / this.charHeight)
    const idx = row * this.cols + col
    return this.characters[idx] || null
  }

  getCharactersInRadius(x, y, radius) {
    return this.characters.filter(char => {
      const cx = char.x + this.charWidth / 2
      const cy = char.y + this.charHeight / 2
      const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2)
      return dist <= radius
    })
  }

  // Trigger a visual pulse wave from center for mode change feedback
  pulse() {
    const centerCol = this.cols / 2
    const centerRow = this.rows / 2

    this.characters.forEach(char => {
      const dist = Math.sqrt(
        (char.col - centerCol) ** 2 + (char.row - centerRow) ** 2
      )
      // Stagger the pulse based on distance from center
      const delay = dist * 20

      setTimeout(() => {
        char.targetScale = 1.3
        setTimeout(() => {
          char.targetScale = 1
        }, 150)
      }, delay)
    })
  }
}
