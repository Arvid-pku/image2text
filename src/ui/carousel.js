export class Carousel {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'carousel'
    this.element.innerHTML = `
      <div class="carousel-dots"></div>
      <div class="carousel-nav">
        <span class="carousel-arrow prev">&lt;</span>
        <span class="carousel-counter">1/1</span>
        <span class="carousel-arrow next">&gt;</span>
      </div>
    `
    this.element.style.display = 'none'
    document.getElementById('app').appendChild(this.element)

    this.dotsContainer = this.element.querySelector('.carousel-dots')
    this.counter = this.element.querySelector('.carousel-counter')
    this.prevArrow = this.element.querySelector('.carousel-arrow.prev')
    this.nextArrow = this.element.querySelector('.carousel-arrow.next')

    this.count = 0
    this.currentIndex = 0
    this.onNavigate = null

    this.bindEvents()
  }

  bindEvents() {
    this.prevArrow.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('prev')
    })

    this.nextArrow.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('next')
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.count <= 1) return

      if (e.key === 'ArrowLeft') {
        if (this.onNavigate) this.onNavigate('prev')
      } else if (e.key === 'ArrowRight') {
        if (this.onNavigate) this.onNavigate('next')
      }
    })
  }

  update(currentIndex, totalCount) {
    this.currentIndex = currentIndex
    this.count = totalCount

    if (totalCount <= 1) {
      this.element.style.display = 'none'
      return
    }

    this.element.style.display = 'flex'
    this.counter.textContent = `${currentIndex + 1}/${totalCount}`

    // Update dots
    this.dotsContainer.innerHTML = ''
    for (let i = 0; i < totalCount; i++) {
      const dot = document.createElement('span')
      dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '')
      dot.addEventListener('click', () => {
        if (this.onNavigate && i !== this.currentIndex) {
          this.onNavigate(i > this.currentIndex ? 'next' : 'prev', i)
        }
      })
      this.dotsContainer.appendChild(dot)
    }
  }

  hide() {
    this.element.style.display = 'none'
  }

  show() {
    if (this.count > 1) {
      this.element.style.display = 'flex'
    }
  }
}
