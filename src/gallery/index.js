export class Gallery {
  constructor() {
    this.images = []      // Array of { asciiData, originalFile }
    this.currentIndex = 0
    this.maxImages = 8
    this.transitioning = false
    this.onNavigate = null
  }

  get count() {
    return this.images.length
  }

  get current() {
    return this.images[this.currentIndex] || null
  }

  add(asciiData, originalFile) {
    if (this.images.length >= this.maxImages) {
      // Remove oldest image
      this.images.shift()
      if (this.currentIndex > 0) this.currentIndex--
    }

    this.images.push({ asciiData, originalFile })
    this.currentIndex = this.images.length - 1

    return this.currentIndex
  }

  clear() {
    this.images = []
    this.currentIndex = 0
  }

  navigate(direction) {
    if (this.transitioning || this.images.length <= 1) return false

    const newIndex = direction === 'next'
      ? (this.currentIndex + 1) % this.images.length
      : (this.currentIndex - 1 + this.images.length) % this.images.length

    if (newIndex === this.currentIndex) return false

    const oldIndex = this.currentIndex
    this.currentIndex = newIndex

    if (this.onNavigate) {
      this.onNavigate(oldIndex, newIndex, direction)
    }

    return true
  }

  goTo(index) {
    if (this.transitioning || index < 0 || index >= this.images.length) return false
    if (index === this.currentIndex) return false

    const direction = index > this.currentIndex ? 'next' : 'prev'
    const oldIndex = this.currentIndex
    this.currentIndex = index

    if (this.onNavigate) {
      this.onNavigate(oldIndex, index, direction)
    }

    return true
  }
}
