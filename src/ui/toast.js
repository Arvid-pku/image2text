export class Toast {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'toast'
    document.getElementById('app').appendChild(this.element)

    this.timeout = null
    this.defaultDuration = 2000
  }

  show(message, duration = this.defaultDuration) {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    // Set message and show
    this.element.textContent = message
    this.element.classList.add('visible')

    // Auto-hide after duration
    this.timeout = setTimeout(() => {
      this.hide()
    }, duration)
  }

  hide() {
    this.element.classList.remove('visible')
    this.timeout = null
  }
}
