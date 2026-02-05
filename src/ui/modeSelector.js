export class ModeSelector {
  // Preset values for density
  static DENSITY_PRESETS = {
    minimal: 2000,
    standard: 5000,
    hd: 12000
  }

  // Display labels for density presets
  static DENSITY_LABELS = {
    standard: 'Standard',
    hd: 'HD',
    minimal: 'Minimal'
  }

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'mode-selector'
    this.element.innerHTML = `
      <div class="controls-primary">
        <span class="toggle-more">More</span>
        <span class="toggle active" data-toggle="color">Color</span>
        <span class="toggle active" data-toggle="charset">Unicode</span>
        <span class="toggle active" data-toggle="density" data-preset="hd">HD</span>
        <div class="density-slider-container">
          <input type="range" class="density-slider" min="1000" max="20000" value="12000" step="100">
          <span class="density-value">12000</span>
        </div>
      </div>
      <div class="controls-secondary">
        <div class="modes">
          <span class="mode active" data-mode="static">Static</span>
          <span class="mode" data-mode="ripple">Ripple</span>
          <span class="mode" data-mode="magnetic">Magnetic</span>
          <span class="mode" data-mode="wind">Wind</span>
          <span class="mode" data-mode="glitch">Glitch</span>
          <span class="mode" data-mode="smear">Smear</span>
          <span class="mode" data-mode="chaos">Chaos</span>
        </div>
        <div class="toggles-secondary">
          <span class="toggle active" data-toggle="sound">Sound</span>
          <span class="toggle" data-toggle="drift">Drift</span>
        </div>
      </div>
    `
    this.moreExpanded = false
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
    document.getElementById('app').appendChild(this.element)

    this.currentMode = 'static'
    this.toggles = { sound: true, color: true, drift: false, charset: true, density: 'hd' }
    this.densityValue = ModeSelector.DENSITY_PRESETS.hd
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

    // More button toggle (for mobile)
    const moreBtn = this.element.querySelector('.toggle-more')
    const secondary = this.element.querySelector('.controls-secondary')
    moreBtn.addEventListener('click', () => {
      this.moreExpanded = !this.moreExpanded
      secondary.classList.toggle('expanded', this.moreExpanded)
      moreBtn.textContent = this.moreExpanded ? 'Less' : 'More'
    })

    // Density slider event
    const slider = this.element.querySelector('.density-slider')
    const valueDisplay = this.element.querySelector('.density-value')

    slider.addEventListener('input', () => {
      const value = parseInt(slider.value, 10)
      this.densityValue = value
      valueDisplay.textContent = value
      this.updatePresetHighlight(value)
      if (this.onToggleChange) this.onToggleChange('density', value)
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
      // Density cycles through presets: standard -> hd -> minimal -> standard
      const modes = ['standard', 'hd', 'minimal']
      const currentIdx = modes.indexOf(this.toggles[name])
      const nextIdx = (currentIdx + 1) % modes.length
      const nextMode = modes[nextIdx]
      this.toggles[name] = nextMode
      el.textContent = ModeSelector.DENSITY_LABELS[nextMode]
      el.dataset.preset = nextMode
      el.classList.add('active')

      // Update slider to match preset
      const presetValue = ModeSelector.DENSITY_PRESETS[nextMode]
      this.setSliderValue(presetValue)

      // Pass numeric value to callback
      value = presetValue
    } else {
      this.toggles[name] = value
      el.classList.toggle('active', value)
    }

    if (this.onToggleChange) this.onToggleChange(name, value)
  }

  setSliderValue(value) {
    const slider = this.element.querySelector('.density-slider')
    const valueDisplay = this.element.querySelector('.density-value')
    slider.value = value
    valueDisplay.textContent = value
    this.densityValue = value
    this.updatePresetHighlight(value)
  }

  updatePresetHighlight(value) {
    const densityToggle = this.element.querySelector('[data-toggle="density"]')
    const presets = ModeSelector.DENSITY_PRESETS

    // Check if value matches any preset
    let matchedPreset = null
    for (const [name, presetValue] of Object.entries(presets)) {
      if (value === presetValue) {
        matchedPreset = name
        break
      }
    }

    if (matchedPreset) {
      // Highlight the preset
      densityToggle.textContent = ModeSelector.DENSITY_LABELS[matchedPreset]
      densityToggle.dataset.preset = matchedPreset
      densityToggle.classList.add('active')
      this.toggles.density = matchedPreset
    } else {
      // Custom value - show as custom
      densityToggle.textContent = 'Custom'
      densityToggle.dataset.preset = ''
      densityToggle.classList.remove('active')
      this.toggles.density = 'custom'
    }
  }

  setDensityDisplay(mode) {
    const el = this.element.querySelector('[data-toggle="density"]')
    this.toggles.density = mode
    el.textContent = ModeSelector.DENSITY_LABELS[mode]
    el.dataset.preset = mode
    el.classList.add('active')

    // Update slider to match preset
    const presetValue = ModeSelector.DENSITY_PRESETS[mode]
    if (presetValue) {
      this.setSliderValue(presetValue)
    }
  }

  getDensityValue() {
    return this.densityValue
  }

  show() {
    this.element.style.opacity = '1'
    this.element.style.pointerEvents = 'auto'
    this.element.querySelector('.controls-secondary').style.display = 'flex'
    this.element.querySelector('.density-slider-container').style.display = 'flex'
  }

  hide() {
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
  }

  showTogglesOnly() {
    this.element.style.opacity = '1'
    this.element.style.pointerEvents = 'auto'
    this.element.querySelector('.controls-secondary').style.display = 'none'
    this.element.querySelector('.density-slider-container').style.display = 'flex'
  }
}
