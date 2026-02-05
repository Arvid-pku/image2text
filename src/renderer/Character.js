export class Character {
  constructor({ char, weight, col, row, originalColor, charWidth, charHeight }) {
    this.char = char
    this.originalChar = char
    this.weight = weight
    this.col = col
    this.row = row

    // Position (canvas coordinates)
    this.x = col * charWidth
    this.y = row * charHeight
    this.targetX = this.x
    this.targetY = this.y

    // Velocity for physics
    this.vx = 0
    this.vy = 0

    // Colors
    this.color = '#1a1a1a'
    this.originalColor = originalColor

    // Animation state
    this.scale = 1
    this.targetScale = 1
    this.opacity = 1

    // For effects
    this.disturbed = false
    this.disturbTime = 0
  }

  update(dt, easing = 0.1) {
    // Ease position toward target
    this.x += (this.targetX - this.x) * easing
    this.y += (this.targetY - this.y) * easing

    // Apply velocity
    this.x += this.vx * dt
    this.y += this.vy * dt

    // Dampen velocity
    this.vx *= 0.95
    this.vy *= 0.95

    // Ease scale
    this.scale += (this.targetScale - this.scale) * easing

    // Reset disturbed flag after a while
    if (this.disturbed) {
      this.disturbTime += dt
      if (this.disturbTime > 1000) {
        this.disturbed = false
        this.disturbTime = 0
      }
    }
  }

  reset() {
    this.targetX = this.col * this.charWidth
    this.targetY = this.row * this.charHeight
    this.char = this.originalChar
    this.vx = 0
    this.vy = 0
    this.scale = 1
    this.targetScale = 1
  }

  draw(ctx, charWidth, charHeight, colorMode = false) {
    ctx.save()

    const drawX = this.x + charWidth / 2
    const drawY = this.y + charHeight / 2

    ctx.translate(drawX, drawY)
    ctx.scale(this.scale, this.scale)

    ctx.fillStyle = colorMode ? this.originalColor : this.color
    ctx.globalAlpha = this.opacity
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.char, 0, 0)

    ctx.restore()
  }
}
