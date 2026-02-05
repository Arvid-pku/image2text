import { CHARACTERS } from '../converter/characters.js'

export class GlitchEffect {
  constructor() {
    this.active = true
    this.intensity = 1.0 // Can be reduced in chaos mode
    this.glitchRadius = 60
    this.glitchDuration = 300 // ms
    this.activeGlitches = [] // { x, y, startTime }
  }

  trigger(x, y) {
    if (!this.active) return
    this.activeGlitches.push({
      x,
      y,
      startTime: performance.now()
    })
  }

  update(characters, dt, charWidth, charHeight, currentTime) {
    if (!this.active) return

    // Process active glitches
    this.activeGlitches = this.activeGlitches.filter(glitch => {
      const elapsed = currentTime - glitch.startTime

      if (elapsed > this.glitchDuration) {
        // Glitch ended, restore characters
        characters.forEach(char => {
          const cx = char.col * charWidth + charWidth / 2
          const cy = char.row * charHeight + charHeight / 2
          const dist = Math.sqrt((cx - glitch.x) ** 2 + (cy - glitch.y) ** 2)

          if (dist < this.glitchRadius) {
            char.char = char.originalChar
          }
        })
        return false
      }

      // Glitch in progress - scramble characters
      const progress = elapsed / this.glitchDuration
      const intensity = (1 - progress) * this.intensity // Fade out, scaled by intensity

      characters.forEach(char => {
        const cx = char.col * charWidth + charWidth / 2
        const cy = char.row * charHeight + charHeight / 2
        const dist = Math.sqrt((cx - glitch.x) ** 2 + (cy - glitch.y) ** 2)

        if (dist < this.glitchRadius) {
          // Random chance to scramble based on intensity
          if (Math.random() < intensity * 0.3) {
            const randomIdx = Math.floor(Math.random() * CHARACTERS.length)
            char.char = CHARACTERS[randomIdx].char
          }

          // Add jitter to position
          char.targetX = char.col * charWidth + (Math.random() - 0.5) * intensity * 10
          char.targetY = char.row * charHeight + (Math.random() - 0.5) * intensity * 10
          char.disturbed = true
          char.disturbTime = 0
        }
      })

      return true
    })
  }
}
