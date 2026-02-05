export class ExportMenu {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'export-menu'
    this.element.innerHTML = `
      <div class="export-option image-only" data-format="png">Save as PNG</div>
      <div class="export-option image-only" data-format="txt">Save as Text</div>
      <div class="export-option image-only" data-format="copy">Copy to Clipboard</div>
      <div class="export-option video-only" data-format="webm" style="display: none;">Save as WebM (fast)</div>
      <div class="export-option video-only" data-format="mp4" style="display: none;">Save as MP4 (compatible)</div>
    `
    document.getElementById('app').appendChild(this.element)

    this.visible = false
    this.mode = 'image' // 'image' or 'video'
    this.onExport = null

    this.bindEvents()
  }

  bindEvents() {
    this.element.querySelectorAll('.export-option').forEach(el => {
      el.addEventListener('click', () => {
        const format = el.dataset.format
        this.hide()
        if (this.onExport) this.onExport(format)
      })
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.visible && !this.element.contains(e.target) && e.target.id !== 'save-btn') {
        this.hide()
      }
    })
  }

  setMode(mode) {
    this.mode = mode
    this.element.querySelectorAll('.image-only').forEach(el => {
      el.style.display = mode === 'image' ? 'block' : 'none'
    })
    this.element.querySelectorAll('.video-only').forEach(el => {
      el.style.display = mode === 'video' ? 'block' : 'none'
    })
  }

  toggle() {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  show() {
    this.visible = true
    this.element.classList.add('visible')
  }

  hide() {
    this.visible = false
    this.element.classList.remove('visible')
  }
}
