export class SmearEffect {
  constructor() {
    this.active = true
    this.intensity = 1.0 // Can be reduced in chaos mode
    this.isDragging = false
    this.dragX = 0
    this.dragY = 0
    this.prevDragX = 0
    this.prevDragY = 0
    this.smearRadius = 50
    this.smearStrength = 0.8
  }

  startDrag(x, y) {
    if (!this.active) return
    this.isDragging = true
    this.dragX = x
    this.dragY = y
    this.prevDragX = x
    this.prevDragY = y
  }

  moveDrag(x, y) {
    if (!this.active || !this.isDragging) return
    this.prevDragX = this.dragX
    this.prevDragY = this.dragY
    this.dragX = x
    this.dragY = y
  }

  endDrag() {
    this.isDragging = false
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active || !this.isDragging) return

    const dx = this.dragX - this.prevDragX
    const dy = this.dragY - this.prevDragY
    const dragSpeed = Math.sqrt(dx * dx + dy * dy)

    if (dragSpeed < 1) return

    characters.forEach(char => {
      const cx = char.col * charWidth + charWidth / 2
      const cy = char.row * charHeight + charHeight / 2
      const dist = Math.sqrt((cx - this.dragX) ** 2 + (cy - this.dragY) ** 2)

      if (dist < this.smearRadius * this.intensity) {
        const factor = (1 - dist / (this.smearRadius * this.intensity)) * this.smearStrength * this.intensity

        // Push characters in drag direction
        char.vx += dx * factor * 0.5
        char.vy += dy * factor * 0.5
        char.disturbed = true
        char.disturbTime = 0
      }
    })
  }
}
