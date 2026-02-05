import { loadImage, imageToAscii } from './converter/index.js'
import { Renderer } from './renderer/index.js'
import { BreathingEffect } from './effects/breathing.js'
import { RippleEffect } from './effects/ripple.js'

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
    ripple: new RippleEffect()
  }
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

// Mouse tracking for ripple effect
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.ripple.setMousePosition(x, y)
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
