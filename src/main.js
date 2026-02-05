import { loadImage, imageToAscii } from './converter/index.js'
import { setActiveCharset, getCharsetByName } from './converter/characters.js'
import { Renderer } from './renderer/index.js'
import { BreathingEffect } from './effects/breathing.js'
import { RippleEffect } from './effects/ripple.js'
import { GlitchEffect } from './effects/glitch.js'
import { SmearEffect } from './effects/smear.js'
import { DriftEffect } from './effects/drift.js'
import { MagneticEffect } from './effects/magnetic.js'
import { WindEffect } from './effects/wind.js'
import { Discovery } from './discovery/index.js'
import { HintsUI } from './ui/hints.js'
import { ModeSelector } from './ui/modeSelector.js'
import { SoundManager } from './sound/index.js'
import { ExportMenu } from './ui/exportMenu.js'
import { Gallery } from './gallery/index.js'
import { Carousel } from './ui/carousel.js'
import { WaveRevealEffect } from './effects/waveReveal.js'

// DOM elements
const canvas = document.getElementById('canvas')
const uploadInput = document.getElementById('upload')
const uploadBtn = document.getElementById('upload-btn')
const saveBtn = document.getElementById('save-btn')

// App state
const state = {
  renderer: new Renderer(canvas),
  lastTime: 0,
  running: false,
  effects: {
    breathing: new BreathingEffect(),
    ripple: new RippleEffect(),
    magnetic: new MagneticEffect(),
    wind: new WindEffect(),
    glitch: new GlitchEffect(),
    smear: new SmearEffect(),
    drift: new DriftEffect()
  },
  discovery: new Discovery(),
  hints: new HintsUI(),
  modeSelector: new ModeSelector(),
  sound: new SoundManager(),
  exportMenu: new ExportMenu(),
  gallery: new Gallery(),
  carousel: new Carousel(),
  waveReveal: new WaveRevealEffect()
}

// Discovery complete handler
state.discovery.onComplete = () => {
  state.hints.hide()
  state.modeSelector.show()
}

// Mode change handler
state.modeSelector.onModeChange = (mode) => {
  // Disable all effects first
  state.effects.breathing.active = false
  state.effects.ripple.active = false
  state.effects.magnetic.active = false
  state.effects.wind.active = false
  state.effects.glitch.active = false
  state.effects.smear.active = false

  // Reset intensities
  state.effects.ripple.intensity = 1.0
  state.effects.magnetic.intensity = 1.0
  state.effects.wind.intensity = 1.0
  state.effects.glitch.intensity = 1.0
  state.effects.smear.intensity = 1.0

  // Static mode: no animations at all, use HD by default
  if (mode === 'static') {
    // Reset all characters to default state
    state.renderer.characters.forEach(char => {
      char.targetScale = 1
      char.scale = 1
      char.opacity = 1
      char.offsetX = 0
      char.offsetY = 0
      char.char = char.originalChar
    })
    // Switch to HD density for static mode
    if (currentDensity !== 'hd') {
      currentDensity = 'hd'
      state.modeSelector.setDensityDisplay('hd')
      reprocessCurrentImage()
    }
  } else {
    // Enable breathing for all animated modes
    state.effects.breathing.active = true

    // Enable specific effects based on mode
    if (mode === 'ripple' || mode === 'chaos') state.effects.ripple.active = true
    if (mode === 'magnetic') state.effects.magnetic.active = true
    if (mode === 'wind') state.effects.wind.active = true
    if (mode === 'glitch' || mode === 'chaos') state.effects.glitch.active = true
    if (mode === 'smear' || mode === 'chaos') state.effects.smear.active = true

    // Reduce intensity in chaos mode so effects blend better
    if (mode === 'chaos') {
      state.effects.ripple.intensity = 0.5
      state.effects.glitch.intensity = 0.6
      state.effects.smear.intensity = 0.5
    }
  }

  // Visual feedback: pulse wave from center
  if (state.renderer.characters.length > 0) {
    state.renderer.pulse()
  }
}

// Toggle change handler
state.modeSelector.onToggleChange = (name, value) => {
  if (name === 'color') state.renderer.colorMode = value
  if (name === 'sound') {
    if (value) state.sound.enable()
    else state.sound.disable()
  }
  if (name === 'drift') state.effects.drift.active = value
  if (name === 'charset') {
    // value: true = unicode, false = ascii
    setActiveCharset(getCharsetByName(value ? 'unicode' : 'ascii'))
    state.renderer.transitionCharset(value)
  }
  if (name === 'density') {
    // value is the new density mode: 'standard', 'hd', or 'minimal'
    currentDensity = value
    // Re-process current image with new density
    reprocessCurrentImage()
  }
}

// Export handler
state.exportMenu.onExport = (format) => {
  if (format === 'png') {
    state.renderer.exportAsPNG()
  } else if (format === 'txt') {
    state.renderer.exportAsText()
  }
}

// Gallery navigation handler
state.gallery.onNavigate = (oldIndex, newIndex, direction) => {
  const toData = state.gallery.images[newIndex].asciiData
  state.gallery.transitioning = true

  // Check if dimensions differ - if so, reset renderer completely
  if (toData.cols !== state.renderer.cols || toData.rows !== state.renderer.rows) {
    state.renderer.setAsciiData(toData)
    resizeCanvas()
    state.gallery.transitioning = false
    state.carousel.update(newIndex, state.gallery.count)
    return
  }

  state.waveReveal.transition(
    state.renderer,
    null,
    toData,
    direction,
    () => {
      state.gallery.transitioning = false
      state.carousel.update(newIndex, state.gallery.count)
    }
  )
}

// Carousel navigation handler
state.carousel.onNavigate = (direction, targetIndex) => {
  if (targetIndex !== undefined) {
    state.gallery.goTo(targetIndex)
  } else {
    state.gallery.navigate(direction)
  }
}

// Apply default toggle settings
state.renderer.colorMode = true
state.sound.enable()

// Default mode: static (no animations, HD density)
// Disable all effects for static mode
state.effects.breathing.active = false
state.effects.ripple.active = false
state.effects.magnetic.active = false
state.effects.wind.active = false
state.effects.glitch.active = false
state.effects.smear.active = false
state.effects.drift.active = false

// Detect mobile device
const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window

// Density mode: target character counts
// Reduced on mobile for better performance
const DENSITY_TARGETS = isMobile ? {
  standard: 2500,
  hd: 5000,
  minimal: 1200
} : {
  standard: 5000,
  hd: 12000,
  minimal: 2000
}

// Current density mode (HD for static default)
let currentDensity = 'hd'

// Calculate columns based on target char count and image aspect ratio
function calculateCols(imageWidth, imageHeight, targetChars) {
  const imageAspect = imageWidth / imageHeight
  // Characters are ~2x taller than wide, so rows = cols / (2 * imageAspect)
  // totalChars = cols * rows = cols * cols / (2 * imageAspect)
  // cols = sqrt(totalChars * 2 * imageAspect)
  return Math.round(Math.sqrt(targetChars * 2 * imageAspect))
}

// Set canvas size based on character dimensions (no gaps)
// Fixed char size: 10px wide, 18px tall
const CHAR_WIDTH = 10
const CHAR_HEIGHT = 18

function resizeCanvas() {
  if (state.renderer.cols === 0) return

  const maxWidth = window.innerWidth * 0.85
  const maxHeight = window.innerHeight * 0.85

  // Calculate ideal canvas size based on character count
  let width = state.renderer.cols * CHAR_WIDTH
  let height = state.renderer.rows * CHAR_HEIGHT

  // Scale to fit viewport while maintaining aspect ratio
  const scale = Math.min(maxWidth / width, maxHeight / height, 1)
  width *= scale
  height *= scale

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
  state.effects.magnetic.update(
    state.renderer.characters,
    dt,
    state.renderer.charWidth,
    state.renderer.charHeight
  )
  state.effects.wind.update(
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
  state.effects.drift.update(
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

// Re-process current image with new density (without adding to gallery)
async function reprocessCurrentImage() {
  const current = state.gallery.current
  if (!current || !current.originalFile) return

  try {
    const imageData = await loadImage(current.originalFile)
    const targetChars = DENSITY_TARGETS[currentDensity]
    const cols = calculateCols(imageData.width, imageData.height, targetChars)
    const asciiData = imageToAscii(imageData, cols)

    // Update current gallery entry
    current.asciiData = asciiData

    // Update renderer
    state.renderer.setAsciiData(asciiData)
    resizeCanvas()
  } catch (err) {
    console.error('Failed to reprocess image:', err)
  }
}

// Handle image upload
async function handleUpload(file, clearGallery = false) {
  try {
    if (clearGallery) {
      state.gallery.clear()
    }

    const imageData = await loadImage(file)
    // Calculate columns based on density mode and image aspect ratio
    const targetChars = DENSITY_TARGETS[currentDensity]
    const cols = calculateCols(imageData.width, imageData.height, targetChars)
    const asciiData = imageToAscii(imageData, cols)

    // Add to gallery
    state.gallery.add(asciiData, file)

    // If this is the first image or clearGallery, set directly
    if (state.gallery.count === 1 || clearGallery) {
      state.renderer.setAsciiData(asciiData)
      resizeCanvas()
    } else {
      // Check if dimensions differ - if so, reset renderer completely
      if (asciiData.cols !== state.renderer.cols || asciiData.rows !== state.renderer.rows) {
        state.renderer.setAsciiData(asciiData)
        resizeCanvas()
      } else {
        // Same dimensions - use wave transition
        state.gallery.transitioning = true
        state.waveReveal.transition(
          state.renderer,
          null,
          asciiData,
          'next',
          () => {
            state.gallery.transitioning = false
          }
        )
      }
    }

    // Update carousel
    state.carousel.update(state.gallery.currentIndex, state.gallery.count)

    saveBtn.style.display = 'block'

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
  state.effects.magnetic.setMousePosition(x, y)
  state.effects.wind.setMousePosition(x, y)
  state.effects.smear.moveDrag(x, y)
  state.discovery.recordHover()
  state.effects.drift.recordActivity()

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
  state.effects.drift.recordActivity()
})

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  state.effects.smear.startDrag(x, y)
  state.effects.ripple.setMousePosition(x, y)
  state.effects.magnetic.setMousePosition(x, y)
  state.effects.wind.setMousePosition(x, y)
  state.discovery.recordHover()
})

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  state.effects.ripple.setMousePosition(x, y)
  state.effects.magnetic.setMousePosition(x, y)
  state.effects.wind.setMousePosition(x, y)
  state.effects.smear.moveDrag(x, y)
  state.effects.drift.recordActivity()
  state.discovery.recordDrag()
})

canvas.addEventListener('touchend', (e) => {
  e.preventDefault()
  state.effects.smear.endDrag()

  // Tap = click for glitch
  if (e.changedTouches.length === 1) {
    const touch = e.changedTouches[0]
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    state.effects.glitch.trigger(x, y)
    state.sound.playGlitch()
    state.discovery.recordClick()
  }
})

// Event listeners
uploadBtn.addEventListener('click', (e) => {
  uploadInput.shiftHeld = e.shiftKey
  uploadInput.click()
})
saveBtn.addEventListener('click', () => state.exportMenu.toggle())

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    // Check if shift was held (stored from click event)
    handleUpload(file, uploadInput.shiftHeld)
    uploadInput.shiftHeld = false
  }
})

window.addEventListener('resize', resizeCanvas)

// Initial setup
resizeCanvas()
console.log('ASCII Art Installation ready')

// Swipe support for gallery navigation
let touchStartX = 0
canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX
}, { passive: true })

canvas.addEventListener('touchend', (e) => {
  if (state.gallery.count <= 1) return

  const touchEndX = e.changedTouches[0].clientX
  const diff = touchEndX - touchStartX

  // Minimum swipe distance
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      state.gallery.navigate('prev')
    } else {
      state.gallery.navigate('next')
    }
  }
}, { passive: true })

// Load example image on startup
async function loadExampleImage() {
  try {
    const response = await fetch('./example.jpg')
    if (!response.ok) throw new Error('No example image')
    const blob = await response.blob()
    const file = new File([blob], 'example.jpg', { type: 'image/jpeg' })
    await handleUpload(file)
  } catch (err) {
    console.log('No example image found, waiting for upload')
  }
}

// Call after setup
loadExampleImage()
