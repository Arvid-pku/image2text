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
      // Create layered wave pattern for more organic feel
      const waveOffset1 = (char.col + char.row) * 0.1
      const waveOffset2 = (char.col * 0.7 - char.row * 0.3) * 0.15

      // Multiple breath frequencies for complexity
      const breathPhase1 = Math.sin(this.time * 0.5 + waveOffset1)
      const breathPhase2 = Math.sin(this.time * 0.3 + waveOffset2)
      const combinedPhase = (breathPhase1 + breathPhase2) / 2

      // More frequent character swapping (was 0.001, now 0.005)
      if (Math.random() < 0.005 && Math.abs(combinedPhase) > 0.6) {
        const similar = getSimilarCharacters(char.originalChar)
        char.char = similar[Math.floor(Math.random() * similar.length)]
      }

      // More noticeable scale pulsing (was 0.02, now 0.05)
      const scalePulse = 1 + combinedPhase * 0.05
      if (!char.disturbed) {
        char.targetScale = scalePulse
        // Add subtle opacity pulsing for extra life
        char.opacity = 0.85 + combinedPhase * 0.15
      }
    })
  }
}
