export class HintsUI {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'hint'
    this.element.style.opacity = '0'
    document.getElementById('app').appendChild(this.element)

    this.currentHint = null
    this.hideTimeout = null
  }

  show(text) {
    if (text === this.currentHint) return

    this.currentHint = text
    this.element.textContent = text
    this.element.style.opacity = '1'

    // Auto-hide after 4 seconds
    clearTimeout(this.hideTimeout)
    this.hideTimeout = setTimeout(() => this.hide(), 4000)
  }

  hide() {
    this.element.style.opacity = '0'
    this.currentHint = null
  }

  destroy() {
    this.element.remove()
  }
}
