import { getSimilarCharacters } from '../converter/characters.js'

export class BreathingEffect {
  constructor() {
    this.time = 0
    this.active = true
  }

  update(characters, dt) {
    if (!this.active) return

    this.time += dt * 0.001 // Convert to seconds

    characters.forEach((char, idx) => {
      // Create wave pattern emanating from center
      const waveOffset = (char.col + char.row) * 0.1
      const breathPhase = Math.sin(this.time * 0.5 + waveOffset)

      // Only swap characters occasionally based on phase
      if (Math.random() < 0.001 && Math.abs(breathPhase) > 0.8) {
        const similar = getSimilarCharacters(char.originalChar)
        char.char = similar[Math.floor(Math.random() * similar.length)]
      }

      // Subtle scale pulsing
      const scalePulse = 1 + Math.sin(this.time * 0.3 + waveOffset) * 0.02
      if (!char.disturbed) {
        char.targetScale = scalePulse
      }
    })
  }
}
