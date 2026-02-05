export class Discovery {
  constructor() {
    this.state = {
      hasHovered: false,
      hasClicked: false,
      hasDragged: false,
      completed: false
    }
    this.onComplete = null
  }

  recordHover() {
    if (!this.state.hasHovered) {
      this.state.hasHovered = true
      this.checkComplete()
    }
  }

  recordClick() {
    if (!this.state.hasClicked) {
      this.state.hasClicked = true
      this.checkComplete()
    }
  }

  recordDrag() {
    if (!this.state.hasDragged) {
      this.state.hasDragged = true
      this.checkComplete()
    }
  }

  checkComplete() {
    if (this.state.hasHovered && this.state.hasClicked && this.state.hasDragged) {
      this.state.completed = true
      if (this.onComplete) this.onComplete()
    }
  }

  getNextHint() {
    if (!this.state.hasHovered) return 'move your cursor over the art'
    if (!this.state.hasClicked) return 'try clicking'
    if (!this.state.hasDragged) return 'drag across the canvas'
    return null
  }
}
