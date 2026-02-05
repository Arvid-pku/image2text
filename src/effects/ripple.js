export class RippleEffect {
  constructor() {
    this.active = true
    this.intensity = 1.0 // Can be reduced in chaos mode
    this.mouseX = 0
    this.mouseY = 0
    this.prevMouseX = 0
    this.prevMouseY = 0
    this.mouseSpeed = 0
    this.radius = 80
  }

  setMousePosition(x, y) {
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.mouseX = x
    this.mouseY = y

    // Calculate mouse speed
    const dx = x - this.prevMouseX
    const dy = y - this.prevMouseY
    this.mouseSpeed = Math.sqrt(dx * dx + dy * dy)
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) return

    const effectRadius = (this.radius + this.mouseSpeed * 0.5) * this.intensity
    const strength = (0.3 + this.mouseSpeed * 0.02) * this.intensity

    characters.forEach(char => {
      const cx = char.col * charWidth + charWidth / 2
      const cy = char.row * charHeight + charHeight / 2

      const dx = cx - this.mouseX
      const dy = cy - this.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < effectRadius && dist > 0) {
        // Ripple pushes outward, strength decreases with distance
        const factor = (1 - dist / effectRadius) * strength
        const angle = Math.atan2(dy, dx)

        char.targetX = char.col * charWidth + Math.cos(angle) * factor * charWidth
        char.targetY = char.row * charHeight + Math.sin(angle) * factor * charHeight
        char.disturbed = true
        char.disturbTime = 0
      } else if (!char.disturbed) {
        // Return to original position when not disturbed
        char.targetX = char.col * charWidth
        char.targetY = char.row * charHeight
      }
    })
  }
}
