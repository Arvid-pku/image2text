export class MagneticEffect {
  constructor() {
    this.active = false
    this.intensity = 1.0
    this.mouseX = 0
    this.mouseY = 0
    this.radius = 120
    this.attract = true // true = attract, false = repel
  }

  setMousePosition(x, y) {
    this.mouseX = x
    this.mouseY = y
  }

  togglePolarity() {
    this.attract = !this.attract
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) return

    const effectRadius = this.radius * this.intensity
    const strength = 0.15 * this.intensity
    const direction = this.attract ? -1 : 1 // -1 attracts, 1 repels

    characters.forEach(char => {
      const cx = char.col * charWidth + charWidth / 2
      const cy = char.row * charHeight + charHeight / 2

      const dx = cx - this.mouseX
      const dy = cy - this.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < effectRadius && dist > 5) {
        // Force decreases with distance squared (inverse square law)
        const forceFactor = (1 - dist / effectRadius) ** 2 * strength
        const angle = Math.atan2(dy, dx)

        // Apply force toward or away from cursor
        const forceX = Math.cos(angle) * forceFactor * direction * charWidth
        const forceY = Math.sin(angle) * forceFactor * direction * charHeight

        char.targetX = char.col * charWidth + forceX
        char.targetY = char.row * charHeight + forceY
        char.disturbed = true
        char.disturbTime = 0
      } else if (!char.disturbed) {
        char.targetX = char.col * charWidth
        char.targetY = char.row * charHeight
      }
    })
  }
}
