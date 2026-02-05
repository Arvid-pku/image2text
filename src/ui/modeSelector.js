export class ModeSelector {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'mode-selector'
    this.element.innerHTML = `
      <div class="modes">
        <span class="mode active" data-mode="ripple">Ripple</span>
        <span class="mode" data-mode="glitch">Glitch</span>
        <span class="mode" data-mode="smear">Smear</span>
        <span class="mode" data-mode="chaos">Chaos</span>
      </div>
      <div class="toggles">
        <span class="toggle active" data-toggle="sound">Sound</span>
        <span class="toggle active" data-toggle="color">Color</span>
        <span class="toggle active" data-toggle="drift">Drift</span>
      </div>
    `
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
    document.getElementById('app').appendChild(this.element)

    this.currentMode = 'ripple'
    this.toggles = { sound: true, color: true, drift: true }
    this.onModeChange = null
    this.onToggleChange = null

    this.bindEvents()
  }

  bindEvents() {
    this.element.querySelectorAll('.mode').forEach(el => {
      el.addEventListener('click', () => {
        this.setMode(el.dataset.mode)
      })
    })

    this.element.querySelectorAll('.toggle').forEach(el => {
      el.addEventListener('click', () => {
        this.setToggle(el.dataset.toggle, !this.toggles[el.dataset.toggle])
      })
    })
  }

  setMode(mode) {
    this.currentMode = mode
    this.element.querySelectorAll('.mode').forEach(el => {
      el.classList.toggle('active', el.dataset.mode === mode)
    })
    if (this.onModeChange) this.onModeChange(mode)
  }

  setToggle(name, value) {
    this.toggles[name] = value
    const el = this.element.querySelector(`[data-toggle="${name}"]`)
    el.classList.toggle('active', value)
    if (this.onToggleChange) this.onToggleChange(name, value)
  }

  show() {
    this.element.style.opacity = '1'
    this.element.style.pointerEvents = 'auto'
  }

  hide() {
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
  }
}
