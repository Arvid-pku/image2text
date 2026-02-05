export class WindEffect {
  constructor() {
    this.active = false
    this.intensity = 1.0
    this.mouseX = 0
    this.mouseY = 0
    this.prevMouseX = 0
    this.prevMouseY = 0
    this.windX = 0
    this.windY = 0
    this.decay = 0.95 // Wind slowly dies down
  }

  setMousePosition(x, y) {
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.mouseX = x
    this.mouseY = y

    // Add mouse movement to wind direction
    const dx = x - this.prevMouseX
    const dy = y - this.prevMouseY
    this.windX += dx * 0.1
    this.windY += dy * 0.1

    // Clamp wind speed
    const maxWind = 5
    const windSpeed = Math.sqrt(this.windX ** 2 + this.windY ** 2)
    if (windSpeed > maxWind) {
      this.windX = (this.windX / windSpeed) * maxWind
      this.windY = (this.windY / windSpeed) * maxWind
    }
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) {
      this.windX = 0
      this.windY = 0
      return
    }

    // Apply decay to wind
    this.windX *= this.decay
    this.windY *= this.decay

    const windStrength = Math.sqrt(this.windX ** 2 + this.windY ** 2)
    if (windStrength < 0.1) return

    const strength = 0.3 * this.intensity

    characters.forEach(char => {
      // Add some turbulence based on position
      const turbulence = Math.sin(char.col * 0.3 + char.row * 0.2) * 0.3

      // Wind affects all characters but with slight variation
      const offsetX = this.windX * strength * (1 + turbulence)
      const offsetY = this.windY * strength * (1 + turbulence)

      char.targetX = char.col * charWidth + offsetX * charWidth
      char.targetY = char.row * charHeight + offsetY * charHeight

      // Mark as disturbed only if significant wind
      if (windStrength > 0.5) {
        char.disturbed = true
        char.disturbTime = 0
      }
    })
  }
}
