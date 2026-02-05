import { loadImage, imageToAscii } from './converter/index.js'
import { Renderer } from './renderer/index.js'
import { BreathingEffect } from './effects/breathing.js'
import { RippleEffect } from './effects/ripple.js'
import { GlitchEffect } from './effects/glitch.js'
import { SmearEffect } from './effects/smear.js'
import { Discovery } from './discovery/index.js'
import { HintsUI } from './ui/hints.js'
import { ModeSelector } from './ui/modeSelector.js'
import { SoundManager } from './sound/index.js'

// DOM elements
const canvas = document.getElementById('canvas')
const uploadInput = document.getElementById('upload')
const uploadBtn = document.getElementById('upload-btn')

// App state
const state = {
  renderer: new Renderer(canvas),
  lastTime: 0,
  running: false,
  effects: {
    breathing: new BreathingEffect(),
    ripple: new RippleEffect(),
    glitch: new GlitchEffect(),
    smear: new SmearEffect()
  },
  discovery: new Discovery(),
  hints: new HintsUI(),
  modeSelector: new ModeSelector(),
  sound: new SoundManager()
}

// Discovery complete handler
state.discovery.onComplete = () => {
  state.hints.hide()
  state.modeSelector.show()
}

// Mode change handler
state.modeSelector.onModeChange = (mode) => {
  // Disable all effects first
  state.effects.ripple.active = false
  state.effects.glitch.active = false
  state.effects.smear.active = false

  // Enable based on mode
  if (mode === 'ripple' || mode === 'chaos') state.effects.ripple.active = true
  if (mode === 'glitch' || mode === 'chaos') state.effects.glitch.active = true
  if (mode === 'smear' || mode === 'chaos') state.effects.smear.active = true
}

// Toggle change handler
state.modeSelector.onToggleChange = (name, value) => {
  if (name === 'color') state.renderer.colorMode = value
  if (name === 'sound') {
    if (value) state.sound.enable()
    else state.sound.disable()
  }
  // Drift will be added in next task
}

// Set initial canvas size
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.85
  const maxHeight = window.innerHeight * 0.85

  // Default aspect ratio before image load
  const aspect = state.renderer.cols > 0
    ? (state.renderer.cols * 10) / (state.renderer.rows * 18)
    : 4 / 3

  let width = maxWidth
  let height = width / aspect

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }

  state.renderer.resize(width, height)
}

// Animation loop
function animate(time) {
  if (!state.running) return

  const dt = time - state.lastTime
  state.lastTime = time

  // Apply effects
  state.effects.breathing.update(state.renderer.characters, dt)
  state.effects.ripple.update(
    state.renderer.characters,
    dt,
    state.renderer.charWidth,
    state.renderer.charHeight
  )
  state.effects.glitch.update(
    state.renderer.characters,
    dt,
    state.renderer.charWidth,
    state.renderer.charHeight,
    time
  )
  state.effects.smear.update(
    state.renderer.characters,
    dt,
    state.renderer.charWidth,
    state.renderer.charHeight
  )

  // Show next hint if not completed
  if (!state.discovery.state.completed) {
    const hint = state.discovery.getNextHint()
    if (hint) state.hints.show(hint)
  }

  state.renderer.update(dt)
  state.renderer.draw()

  requestAnimationFrame(animate)
}

// Handle image upload
async function handleUpload(file) {
  try {
    const imageData = await loadImage(file)
    const asciiData = imageToAscii(imageData, 100)

    state.renderer.setAsciiData(asciiData)
    resizeCanvas()

    if (!state.running) {
      state.running = true
      state.lastTime = performance.now()
      requestAnimationFrame(animate)
    }
  } catch (err) {
    console.error('Failed to process image:', err)
  }
}

// Mouse tracking for ripple effect and smear
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.ripple.setMousePosition(x, y)
  state.effects.smear.moveDrag(x, y)
  state.discovery.recordHover()

  // Play ripple sound when moving fast enough
  if (state.effects.ripple.active && state.effects.ripple.mouseSpeed > 5) {
    state.sound.playRipple(state.effects.ripple.mouseSpeed)
  }

  // Play smear sound when dragging
  if (state.effects.smear.isDragging) {
    const dx = state.effects.smear.dragX - state.effects.smear.prevDragX
    const dy = state.effects.smear.dragY - state.effects.smear.prevDragY
    state.sound.playSmear(dx, dy)
  }
})

// Mouse down handler for smear effect
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.smear.startDrag(x, y)
  state.discovery.recordDrag()
})

// Mouse up and leave handlers for smear effect
canvas.addEventListener('mouseup', () => {
  state.effects.smear.endDrag()
})

canvas.addEventListener('mouseleave', () => {
  state.effects.smear.endDrag()
})

// Click handler for glitch effect
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.glitch.trigger(x, y)
  state.sound.playGlitch()
  state.discovery.recordClick()
})

// Event listeners
uploadBtn.addEventListener('click', () => uploadInput.click())

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) handleUpload(file)
})

window.addEventListener('resize', resizeCanvas)

// Initial setup
resizeCanvas()
console.log('ASCII Art Installation ready')
