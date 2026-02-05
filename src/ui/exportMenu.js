export class ExportMenu {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'export-menu'
    this.element.innerHTML = `
      <div class="export-option" data-format="png">Save as PNG</div>
      <div class="export-option" data-format="txt">Save as Text</div>
    `
    document.getElementById('app').appendChild(this.element)

    this.visible = false
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
