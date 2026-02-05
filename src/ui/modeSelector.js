export class ModeSelector {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'mode-selector'
    this.element.innerHTML = `
      <div class="modes">
        <span class="mode" data-mode="static">Static</span>
        <span class="mode" data-mode="ripple">Ripple</span>
        <span class="mode" data-mode="magnetic">Magnetic</span>
        <span class="mode active" data-mode="wind">Wind</span>
        <span class="mode" data-mode="glitch">Glitch</span>
        <span class="mode" data-mode="smear">Smear</span>
        <span class="mode" data-mode="chaos">Chaos</span>
      </div>
      <div class="toggles">
        <span class="toggle active" data-toggle="sound">Sound</span>
        <span class="toggle active" data-toggle="color">Color</span>
        <span class="toggle active" data-toggle="drift">Drift</span>
        <span class="toggle active" data-toggle="charset">Unicode</span>
        <span class="toggle active" data-toggle="density">Standard</span>
      </div>
    `
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
    document.getElementById('app').appendChild(this.element)

    this.currentMode = 'wind'
    this.toggles = { sound: true, color: true, drift: true, charset: true, density: 'standard' }
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
    const el = this.element.querySelector(`[data-toggle="${name}"]`)

    if (name === 'charset') {
      // Charset toggle shows text instead of active/inactive
      this.toggles[name] = value
      el.textContent = value ? 'Unicode' : 'ASCII'
      el.classList.add('active')
    } else if (name === 'density') {
      // Density cycles through: standard -> hd -> minimal -> standard
      const modes = ['standard', 'hd', 'minimal']
      const labels = { standard: 'Standard', hd: 'HD', minimal: 'Minimal' }
      const currentIdx = modes.indexOf(this.toggles[name])
      const nextIdx = (currentIdx + 1) % modes.length
      this.toggles[name] = modes[nextIdx]
      el.textContent = labels[modes[nextIdx]]
      el.classList.add('active')
      value = modes[nextIdx] // Pass the new mode to callback
    } else {
      this.toggles[name] = value
      el.classList.toggle('active', value)
    }

    if (this.onToggleChange) this.onToggleChange(name, value)
  }

  setDensityDisplay(mode) {
    const labels = { standard: 'Standard', hd: 'HD', minimal: 'Minimal' }
    const el = this.element.querySelector('[data-toggle="density"]')
    this.toggles.density = mode
    el.textContent = labels[mode]
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
