export class DriftEffect {
  constructor() {
    this.active = false
    this.idleTime = 0
    this.idleThreshold = 60000 // 1 minute before drift starts
    this.driftStrength = 0
    this.maxDrift = 0.5
  }

  recordActivity() {
    this.idleTime = 0
    this.driftStrength = Math.max(0, this.driftStrength - 0.01)
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) {
      this.driftStrength = 0
      return
    }

    this.idleTime += dt

    // Gradually increase drift after idle threshold
    if (this.idleTime > this.idleThreshold) {
      this.driftStrength = Math.min(
        this.maxDrift,
        this.driftStrength + dt * 0.00001
      )
    }

    if (this.driftStrength < 0.01) return

    characters.forEach(char => {
      // Random wandering
      if (Math.random() < 0.01 * this.driftStrength) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * charWidth * this.driftStrength * 2

        char.targetX = char.col * charWidth + Math.cos(angle) * dist
        char.targetY = char.row * charHeight + Math.sin(angle) * dist
      }
    })
  }
}
