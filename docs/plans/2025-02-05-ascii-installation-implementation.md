# ASCII Art Interactive Installation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based interactive ASCII art installation where images transform into living text art with physics, transformation, and generative effects.

**Architecture:** Single-page app using Vite + vanilla JS. Canvas-based rendering where each character is an object with position, velocity, and color. Effects modify character targets/velocities. Progressive discovery reveals UI after user exploration.

**Tech Stack:** Vite, vanilla JavaScript (ES modules), HTML Canvas, Web Audio API, CSS

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.js`
- Create: `src/style.css`

**Step 1: Initialize npm project**

Run:
```bash
cd .worktrees/ascii-installation
npm init -y
```

**Step 2: Install Vite**

Run:
```bash
npm install -D vite
```

**Step 3: Create vite.config.js**

```js
// vite.config.js
export default {
  root: '.',
  build: {
    outDir: 'dist'
  }
}
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASCII Art Installation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <div id="app">
    <canvas id="canvas"></canvas>
    <input type="file" id="upload" accept="image/*" hidden>
    <button id="upload-btn" class="upload-btn">New</button>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 5: Create src/style.css**

```css
/* src/style.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #fafafa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

#app {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#canvas {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.upload-btn {
  position: fixed;
  top: 24px;
  right: 24px;
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.upload-btn:hover {
  color: #1a1a1a;
}
```

**Step 6: Create src/main.js placeholder**

```js
// src/main.js
console.log('ASCII Art Installation loading...')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// Set initial canvas size
canvas.width = 800
canvas.height = 600

// Placeholder text
ctx.fillStyle = '#1a1a1a'
ctx.font = '14px "IBM Plex Mono"'
ctx.fillText('Upload an image to begin', 300, 300)
```

**Step 7: Update package.json scripts**

Add to package.json:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Step 8: Test dev server**

Run:
```bash
npm run dev
```
Expected: Server starts, page shows canvas with placeholder text

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: project setup with Vite and base HTML/CSS"
```

---

## Task 2: Image Converter Module

**Files:**
- Create: `src/converter/index.js`
- Create: `src/converter/characters.js`

**Step 1: Create character set with density weights**

```js
// src/converter/characters.js

// Unicode characters ordered by visual density (darkest to lightest)
export const CHARACTERS = [
  { char: '█', weight: 1.0 },
  { char: '▓', weight: 0.9 },
  { char: '▒', weight: 0.75 },
  { char: '░', weight: 0.6 },
  { char: '▄', weight: 0.55 },
  { char: '▀', weight: 0.55 },
  { char: '■', weight: 0.5 },
  { char: '●', weight: 0.45 },
  { char: '◐', weight: 0.4 },
  { char: '#', weight: 0.38 },
  { char: '@', weight: 0.35 },
  { char: '%', weight: 0.32 },
  { char: '&', weight: 0.3 },
  { char: '*', weight: 0.25 },
  { char: '+', weight: 0.2 },
  { char: '=', weight: 0.18 },
  { char: '~', weight: 0.15 },
  { char: '-', weight: 0.12 },
  { char: ':', weight: 0.1 },
  { char: ';', weight: 0.08 },
  { char: '\'', weight: 0.06 },
  { char: '"', weight: 0.05 },
  { char: '.', weight: 0.03 },
  { char: ' ', weight: 0.0 }
]

// Get character for a brightness value (0-255)
export function getCharForBrightness(brightness) {
  // Invert: 0 (black) = dense char, 255 (white) = sparse char
  const normalizedBrightness = 1 - (brightness / 255)

  // Find closest character by weight
  let closest = CHARACTERS[0]
  let minDiff = Math.abs(normalizedBrightness - closest.weight)

  for (const entry of CHARACTERS) {
    const diff = Math.abs(normalizedBrightness - entry.weight)
    if (diff < minDiff) {
      minDiff = diff
      closest = entry
    }
  }

  return closest
}

// Get similar characters for breathing effect
export function getSimilarCharacters(char) {
  const idx = CHARACTERS.findIndex(c => c.char === char)
  if (idx === -1) return [char]

  const similar = [CHARACTERS[idx].char]
  if (idx > 0) similar.push(CHARACTERS[idx - 1].char)
  if (idx < CHARACTERS.length - 1) similar.push(CHARACTERS[idx + 1].char)

  return similar
}
```

**Step 2: Create converter module**

```js
// src/converter/index.js
import { getCharForBrightness } from './characters.js'

export function imageToAscii(imageData, cols = 100) {
  const { width, height, data } = imageData

  // Calculate cell size and rows to maintain aspect ratio
  // Characters are typically ~2x taller than wide, so adjust
  const cellWidth = width / cols
  const cellHeight = cellWidth * 2
  const rows = Math.floor(height / cellHeight)

  const characters = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Sample center of cell
      const x = Math.floor(col * cellWidth + cellWidth / 2)
      const y = Math.floor(row * cellHeight + cellHeight / 2)

      // Get pixel data (RGBA)
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // Calculate brightness (luminance formula)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b

      // Get character for brightness
      const charData = getCharForBrightness(brightness)

      characters.push({
        char: charData.char,
        weight: charData.weight,
        col,
        row,
        // Store original color for color mode
        originalColor: `rgb(${r}, ${g}, ${b})`
      })
    }
  }

  return { characters, cols, rows }
}

// Load image from file and get ImageData
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      URL.revokeObjectURL(url)

      resolve(imageData)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add image to ASCII converter with unicode characters"
```

---

## Task 3: Character Model and Renderer

**Files:**
- Create: `src/renderer/Character.js`
- Create: `src/renderer/index.js`

**Step 1: Create Character class**

```js
// src/renderer/Character.js
export class Character {
  constructor({ char, weight, col, row, originalColor, charWidth, charHeight }) {
    this.char = char
    this.originalChar = char
    this.weight = weight
    this.col = col
    this.row = row

    // Position (canvas coordinates)
    this.x = col * charWidth
    this.y = row * charHeight
    this.targetX = this.x
    this.targetY = this.y

    // Velocity for physics
    this.vx = 0
    this.vy = 0

    // Colors
    this.color = '#1a1a1a'
    this.originalColor = originalColor

    // Animation state
    this.scale = 1
    this.targetScale = 1
    this.opacity = 1

    // For effects
    this.disturbed = false
    this.disturbTime = 0
  }

  update(dt, easing = 0.1) {
    // Ease position toward target
    this.x += (this.targetX - this.x) * easing
    this.y += (this.targetY - this.y) * easing

    // Apply velocity
    this.x += this.vx * dt
    this.y += this.vy * dt

    // Dampen velocity
    this.vx *= 0.95
    this.vy *= 0.95

    // Ease scale
    this.scale += (this.targetScale - this.scale) * easing

    // Reset disturbed flag after a while
    if (this.disturbed) {
      this.disturbTime += dt
      if (this.disturbTime > 1000) {
        this.disturbed = false
        this.disturbTime = 0
      }
    }
  }

  reset() {
    this.targetX = this.col * this.charWidth
    this.targetY = this.row * this.charHeight
    this.char = this.originalChar
    this.vx = 0
    this.vy = 0
    this.scale = 1
    this.targetScale = 1
  }

  draw(ctx, charWidth, charHeight, colorMode = false) {
    ctx.save()

    const drawX = this.x + charWidth / 2
    const drawY = this.y + charHeight / 2

    ctx.translate(drawX, drawY)
    ctx.scale(this.scale, this.scale)

    ctx.fillStyle = colorMode ? this.originalColor : this.color
    ctx.globalAlpha = this.opacity
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.char, 0, 0)

    ctx.restore()
  }
}
```

**Step 2: Create renderer module**

```js
// src/renderer/index.js
import { Character } from './Character.js'

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.characters = []
    this.cols = 0
    this.rows = 0
    this.charWidth = 10
    this.charHeight = 18
    this.colorMode = false
    this.font = '14px "IBM Plex Mono"'
  }

  setAsciiData({ characters, cols, rows }) {
    this.cols = cols
    this.rows = rows

    // Calculate char size to fit canvas
    this.charWidth = this.canvas.width / cols
    this.charHeight = this.canvas.height / rows

    // Create Character objects
    this.characters = characters.map(data => new Character({
      ...data,
      charWidth: this.charWidth,
      charHeight: this.charHeight
    }))
  }

  resize(width, height) {
    this.canvas.width = width
    this.canvas.height = height

    if (this.cols > 0) {
      this.charWidth = width / this.cols
      this.charHeight = height / this.rows

      // Update character positions
      this.characters.forEach(char => {
        char.targetX = char.col * this.charWidth
        char.targetY = char.row * this.charHeight
        char.x = char.targetX
        char.y = char.targetY
      })
    }
  }

  update(dt) {
    this.characters.forEach(char => char.update(dt))
  }

  draw() {
    const { ctx, canvas, charWidth, charHeight, colorMode } = this

    // Clear canvas
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set font
    ctx.font = this.font

    // Draw all characters
    this.characters.forEach(char => {
      char.draw(ctx, charWidth, charHeight, colorMode)
    })
  }

  getCharacterAt(x, y) {
    const col = Math.floor(x / this.charWidth)
    const row = Math.floor(y / this.charHeight)
    const idx = row * this.cols + col
    return this.characters[idx] || null
  }

  getCharactersInRadius(x, y, radius) {
    return this.characters.filter(char => {
      const cx = char.x + this.charWidth / 2
      const cy = char.y + this.charHeight / 2
      const dist = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2)
      return dist <= radius
    })
  }
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Character model and Renderer with canvas drawing"
```

---

## Task 4: Main App Loop and Upload Handler

**Files:**
- Modify: `src/main.js`

**Step 1: Implement main app with animation loop**

```js
// src/main.js
import { loadImage, imageToAscii } from './converter/index.js'
import { Renderer } from './renderer/index.js'

// DOM elements
const canvas = document.getElementById('canvas')
const uploadInput = document.getElementById('upload')
const uploadBtn = document.getElementById('upload-btn')

// App state
const state = {
  renderer: new Renderer(canvas),
  lastTime: 0,
  running: false
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
```

**Step 2: Test upload functionality**

Run:
```bash
npm run dev
```
Expected: Upload an image, see it converted to ASCII art

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add main app loop with image upload and rendering"
```

---

## Task 5: Generative/Living Effect (Breathing)

**Files:**
- Create: `src/effects/breathing.js`
- Modify: `src/main.js`

**Step 1: Create breathing effect module**

```js
// src/effects/breathing.js
import { getSimilarCharacters } from '../converter/characters.js'

export class BreathingEffect {
  constructor() {
    this.time = 0
    this.active = true
  }

  update(characters, dt) {
    if (!this.active) return

    this.time += dt * 0.001 // Convert to seconds

    characters.forEach((char, idx) => {
      // Create wave pattern emanating from center
      const waveOffset = (char.col + char.row) * 0.1
      const breathPhase = Math.sin(this.time * 0.5 + waveOffset)

      // Only swap characters occasionally based on phase
      if (Math.random() < 0.001 && Math.abs(breathPhase) > 0.8) {
        const similar = getSimilarCharacters(char.originalChar)
        char.char = similar[Math.floor(Math.random() * similar.length)]
      }

      // Subtle scale pulsing
      const scalePulse = 1 + Math.sin(this.time * 0.3 + waveOffset) * 0.02
      if (!char.disturbed) {
        char.targetScale = scalePulse
      }
    })
  }
}
```

**Step 2: Integrate breathing effect into main.js**

Update `src/main.js`:

```js
// src/main.js
import { loadImage, imageToAscii } from './converter/index.js'
import { Renderer } from './renderer/index.js'
import { BreathingEffect } from './effects/breathing.js'

// DOM elements
const canvas = document.getElementById('canvas')
const uploadInput = document.getElementById('upload')
const uploadBtn = document.getElementById('upload-btn')

// App state
const state = {
  renderer: new Renderer(canvas),
  effects: {
    breathing: new BreathingEffect()
  },
  lastTime: 0,
  running: false
}

// Set initial canvas size
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.85
  const maxHeight = window.innerHeight * 0.85

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
```

**Step 3: Test breathing effect**

Run:
```bash
npm run dev
```
Expected: ASCII art subtly pulses and characters occasionally swap

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add breathing effect with character cycling and scale pulsing"
```

---

## Task 6: Physics Effect - Ripple

**Files:**
- Create: `src/effects/ripple.js`
- Modify: `src/main.js`

**Step 1: Create ripple effect module**

```js
// src/effects/ripple.js
export class RippleEffect {
  constructor() {
    this.active = true
    this.mouseX = 0
    this.mouseY = 0
    this.prevMouseX = 0
    this.prevMouseY = 0
    this.mouseSpeed = 0
    this.radius = 80
  }

  setMousePosition(x, y) {
    this.prevMouseX = this.mouseX
    this.prevMouseY = this.mouseY
    this.mouseX = x
    this.mouseY = y

    // Calculate mouse speed
    const dx = x - this.prevMouseX
    const dy = y - this.prevMouseY
    this.mouseSpeed = Math.sqrt(dx * dx + dy * dy)
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) return

    const effectRadius = this.radius + this.mouseSpeed * 0.5
    const strength = 0.3 + this.mouseSpeed * 0.02

    characters.forEach(char => {
      const cx = char.col * charWidth + charWidth / 2
      const cy = char.row * charHeight + charHeight / 2

      const dx = cx - this.mouseX
      const dy = cy - this.mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < effectRadius && dist > 0) {
        // Ripple pushes outward, strength decreases with distance
        const factor = (1 - dist / effectRadius) * strength
        const angle = Math.atan2(dy, dx)

        char.targetX = char.col * charWidth + Math.cos(angle) * factor * charWidth
        char.targetY = char.row * charHeight + Math.sin(angle) * factor * charHeight
        char.disturbed = true
        char.disturbTime = 0
      } else if (!char.disturbed) {
        // Return to original position when not disturbed
        char.targetX = char.col * charWidth
        char.targetY = char.row * charHeight
      }
    })
  }
}
```

**Step 2: Update main.js with ripple effect**

Add to imports:
```js
import { RippleEffect } from './effects/ripple.js'
```

Add to state.effects:
```js
effects: {
  breathing: new BreathingEffect(),
  ripple: new RippleEffect()
}
```

Add mouse tracking to animate loop:
```js
// In animate function, add:
state.effects.ripple.update(
  state.renderer.characters,
  dt,
  state.renderer.charWidth,
  state.renderer.charHeight
)
```

Add mouse event listener:
```js
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.ripple.setMousePosition(x, y)
})
```

**Step 3: Full updated main.js**

```js
// src/main.js
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
  effects: {
    breathing: new BreathingEffect(),
    ripple: new RippleEffect()
  },
  lastTime: 0,
  running: false
}

// Set initial canvas size
function resizeCanvas() {
  const maxWidth = window.innerWidth * 0.85
  const maxHeight = window.innerHeight * 0.85

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
```

**Step 4: Test ripple effect**

Run:
```bash
npm run dev
```
Expected: Characters ripple outward when cursor moves over them

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ripple effect responding to mouse movement"
```

---

## Task 7: Transformation Effect - Glitch

**Files:**
- Create: `src/effects/glitch.js`
- Modify: `src/main.js`

**Step 1: Create glitch effect module**

```js
// src/effects/glitch.js
import { CHARACTERS } from '../converter/characters.js'

export class GlitchEffect {
  constructor() {
    this.active = true
    this.glitchRadius = 60
    this.glitchDuration = 300 // ms
    this.activeGlitches = [] // { x, y, startTime }
  }

  trigger(x, y) {
    if (!this.active) return
    this.activeGlitches.push({
      x,
      y,
      startTime: performance.now()
    })
  }

  update(characters, dt, charWidth, charHeight, currentTime) {
    if (!this.active) return

    // Process active glitches
    this.activeGlitches = this.activeGlitches.filter(glitch => {
      const elapsed = currentTime - glitch.startTime

      if (elapsed > this.glitchDuration) {
        // Glitch ended, restore characters
        characters.forEach(char => {
          const cx = char.col * charWidth + charWidth / 2
          const cy = char.row * charHeight + charHeight / 2
          const dist = Math.sqrt((cx - glitch.x) ** 2 + (cy - glitch.y) ** 2)

          if (dist < this.glitchRadius) {
            char.char = char.originalChar
          }
        })
        return false
      }

      // Glitch in progress - scramble characters
      const progress = elapsed / this.glitchDuration
      const intensity = 1 - progress // Fade out

      characters.forEach(char => {
        const cx = char.col * charWidth + charWidth / 2
        const cy = char.row * charHeight + charHeight / 2
        const dist = Math.sqrt((cx - glitch.x) ** 2 + (cy - glitch.y) ** 2)

        if (dist < this.glitchRadius) {
          // Random chance to scramble based on intensity
          if (Math.random() < intensity * 0.3) {
            const randomIdx = Math.floor(Math.random() * CHARACTERS.length)
            char.char = CHARACTERS[randomIdx].char
          }

          // Add jitter to position
          char.targetX = char.col * charWidth + (Math.random() - 0.5) * intensity * 10
          char.targetY = char.row * charHeight + (Math.random() - 0.5) * intensity * 10
          char.disturbed = true
          char.disturbTime = 0
        }
      })

      return true
    })
  }
}
```

**Step 2: Update main.js with glitch effect**

Add import:
```js
import { GlitchEffect } from './effects/glitch.js'
```

Add to state.effects:
```js
glitch: new GlitchEffect()
```

Add to animate loop:
```js
state.effects.glitch.update(
  state.renderer.characters,
  dt,
  state.renderer.charWidth,
  state.renderer.charHeight,
  time
)
```

Add click handler:
```js
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.glitch.trigger(x, y)
})
```

**Step 3: Test glitch effect**

Run:
```bash
npm run dev
```
Expected: Clicking on canvas triggers local glitch burst

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add glitch effect triggered by click"
```

---

## Task 8: Game-like Effect - Smear

**Files:**
- Create: `src/effects/smear.js`
- Modify: `src/main.js`

**Step 1: Create smear effect module**

```js
// src/effects/smear.js
export class SmearEffect {
  constructor() {
    this.active = true
    this.isDragging = false
    this.dragX = 0
    this.dragY = 0
    this.prevDragX = 0
    this.prevDragY = 0
    this.smearRadius = 50
    this.smearStrength = 0.8
  }

  startDrag(x, y) {
    if (!this.active) return
    this.isDragging = true
    this.dragX = x
    this.dragY = y
    this.prevDragX = x
    this.prevDragY = y
  }

  moveDrag(x, y) {
    if (!this.active || !this.isDragging) return
    this.prevDragX = this.dragX
    this.prevDragY = this.dragY
    this.dragX = x
    this.dragY = y
  }

  endDrag() {
    this.isDragging = false
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active || !this.isDragging) return

    const dx = this.dragX - this.prevDragX
    const dy = this.dragY - this.prevDragY
    const dragSpeed = Math.sqrt(dx * dx + dy * dy)

    if (dragSpeed < 1) return

    characters.forEach(char => {
      const cx = char.col * charWidth + charWidth / 2
      const cy = char.row * charHeight + charHeight / 2
      const dist = Math.sqrt((cx - this.dragX) ** 2 + (cy - this.dragY) ** 2)

      if (dist < this.smearRadius) {
        const factor = (1 - dist / this.smearRadius) * this.smearStrength

        // Push characters in drag direction
        char.vx += dx * factor * 0.5
        char.vy += dy * factor * 0.5
        char.disturbed = true
        char.disturbTime = 0
      }
    })
  }
}
```

**Step 2: Update main.js with smear effect**

Add import:
```js
import { SmearEffect } from './effects/smear.js'
```

Add to state.effects:
```js
smear: new SmearEffect()
```

Add to animate loop:
```js
state.effects.smear.update(
  state.renderer.characters,
  dt,
  state.renderer.charWidth,
  state.renderer.charHeight
)
```

Add drag handlers:
```js
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.smear.startDrag(x, y)
})

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  state.effects.ripple.setMousePosition(x, y)
  state.effects.smear.moveDrag(x, y)
})

canvas.addEventListener('mouseup', () => {
  state.effects.smear.endDrag()
})

canvas.addEventListener('mouseleave', () => {
  state.effects.smear.endDrag()
})
```

**Step 3: Test smear effect**

Run:
```bash
npm run dev
```
Expected: Dragging smears characters like wet paint

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add smear effect for drag interactions"
```

---

## Task 9: Progressive Discovery System

**Files:**
- Create: `src/discovery/index.js`
- Create: `src/ui/hints.js`
- Modify: `src/main.js`
- Modify: `src/style.css`

**Step 1: Create discovery tracker**

```js
// src/discovery/index.js
export class Discovery {
  constructor() {
    this.state = {
      hasHovered: false,
      hasClicked: false,
      hasDragged: false,
      completed: false
    }
    this.onComplete = null
  }

  recordHover() {
    if (!this.state.hasHovered) {
      this.state.hasHovered = true
      this.checkComplete()
    }
  }

  recordClick() {
    if (!this.state.hasClicked) {
      this.state.hasClicked = true
      this.checkComplete()
    }
  }

  recordDrag() {
    if (!this.state.hasDragged) {
      this.state.hasDragged = true
      this.checkComplete()
    }
  }

  checkComplete() {
    if (this.state.hasHovered && this.state.hasClicked && this.state.hasDragged) {
      this.state.completed = true
      if (this.onComplete) this.onComplete()
    }
  }

  getNextHint() {
    if (!this.state.hasHovered) return 'move your cursor over the art'
    if (!this.state.hasClicked) return 'try clicking'
    if (!this.state.hasDragged) return 'drag across the canvas'
    return null
  }
}
```

**Step 2: Create hints UI**

```js
// src/ui/hints.js
export class HintsUI {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'hint'
    this.element.style.opacity = '0'
    document.getElementById('app').appendChild(this.element)

    this.currentHint = null
    this.hideTimeout = null
  }

  show(text) {
    if (text === this.currentHint) return

    this.currentHint = text
    this.element.textContent = text
    this.element.style.opacity = '1'

    // Auto-hide after 4 seconds
    clearTimeout(this.hideTimeout)
    this.hideTimeout = setTimeout(() => this.hide(), 4000)
  }

  hide() {
    this.element.style.opacity = '0'
    this.currentHint = null
  }

  destroy() {
    this.element.remove()
  }
}
```

**Step 3: Add hint styles to style.css**

```css
.hint {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Inter', sans-serif;
  font-style: italic;
  font-size: 14px;
  color: #999;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
```

**Step 4: Integrate discovery into main.js**

Add imports:
```js
import { Discovery } from './discovery/index.js'
import { HintsUI } from './ui/hints.js'
```

Add to state:
```js
discovery: new Discovery(),
hints: new HintsUI()
```

Add to mouse handlers:
```js
// In mousemove handler:
state.discovery.recordHover()

// In click handler:
state.discovery.recordClick()

// In mousedown handler:
state.discovery.recordDrag()
```

Add hint update to animate loop:
```js
// Show next hint if not completed
if (!state.discovery.state.completed) {
  const hint = state.discovery.getNextHint()
  if (hint) state.hints.show(hint)
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add progressive discovery system with hints"
```

---

## Task 10: Mode Selector UI

**Files:**
- Create: `src/ui/modeSelector.js`
- Modify: `src/style.css`
- Modify: `src/main.js`

**Step 1: Create mode selector component**

```js
// src/ui/modeSelector.js
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
        <span class="toggle" data-toggle="sound">Sound</span>
        <span class="toggle" data-toggle="color">Color</span>
        <span class="toggle" data-toggle="drift">Drift</span>
      </div>
    `
    this.element.style.opacity = '0'
    this.element.style.pointerEvents = 'none'
    document.getElementById('app').appendChild(this.element)

    this.currentMode = 'ripple'
    this.toggles = { sound: false, color: false, drift: false }
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
```

**Step 2: Add mode selector styles**

```css
.mode-selector {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 48px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: opacity 0.5s ease;
}

.modes, .toggles {
  display: flex;
  gap: 24px;
}

.mode, .toggle {
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.mode:hover, .toggle:hover {
  color: #666;
}

.mode.active {
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.toggle.active {
  color: #1a1a1a;
}
```

**Step 3: Integrate mode selector into main.js**

Add import:
```js
import { ModeSelector } from './ui/modeSelector.js'
```

Add to state:
```js
modeSelector: new ModeSelector()
```

Add discovery complete handler:
```js
state.discovery.onComplete = () => {
  state.hints.hide()
  state.modeSelector.show()
}
```

Add mode/toggle handlers:
```js
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

state.modeSelector.onToggleChange = (name, value) => {
  if (name === 'color') state.renderer.colorMode = value
  // Sound and Drift will be added later
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add mode selector UI with mode and toggle controls"
```

---

## Task 11: Color Mode

**Files:**
- Modify: `src/renderer/Character.js`
- Modify: `src/renderer/index.js`

**Step 1: Update Character.draw for better color rendering**

Color mode already supported via `colorMode` flag. Verify it works:

```js
// In Character.draw(), already have:
ctx.fillStyle = colorMode ? this.originalColor : this.color
```

**Step 2: Test color mode**

Run:
```bash
npm run dev
```
Expected: Toggle "Color" makes ASCII show original image colors

**Step 3: Commit (if changes needed)**

```bash
git add -A
git commit -m "feat: verify color mode toggle working"
```

---

## Task 12: Sound System

**Files:**
- Create: `src/sound/index.js`
- Create: `src/sound/oscillators.js`
- Modify: `src/main.js`

**Step 1: Create sound manager**

```js
// src/sound/index.js
export class SoundManager {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.enabled = false
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)
    this.masterGain.gain.value = 0
    this.initialized = true
  }

  enable() {
    if (!this.initialized) this.init()
    this.enabled = true
    // Fade in
    this.masterGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 2)
  }

  disable() {
    this.enabled = false
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5)
    }
  }

  playRipple(speed) {
    if (!this.enabled || !this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = 200 + speed * 2

    gain.gain.value = 0.1
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.3)
  }

  playGlitch() {
    if (!this.enabled || !this.ctx) return

    // White noise burst
    const bufferSize = this.ctx.sampleRate * 0.1
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = this.ctx.createBufferSource()
    const gain = this.ctx.createGain()

    source.buffer = buffer
    gain.gain.value = 0.15
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)

    source.connect(gain)
    gain.connect(this.masterGain)

    source.start()
  }

  playSmear(dx, dy) {
    if (!this.enabled || !this.ctx) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    const baseFreq = 150
    osc.frequency.value = baseFreq + dy * 0.5

    gain.gain.value = 0.08
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.2)
  }
}
```

**Step 2: Integrate sound into main.js**

Add import:
```js
import { SoundManager } from './sound/index.js'
```

Add to state:
```js
sound: new SoundManager()
```

Update toggle handler:
```js
state.modeSelector.onToggleChange = (name, value) => {
  if (name === 'color') state.renderer.colorMode = value
  if (name === 'sound') {
    if (value) state.sound.enable()
    else state.sound.disable()
  }
}
```

Trigger sounds in effects:
```js
// In click handler after glitch trigger:
state.sound.playGlitch()

// In mousemove handler when ripple active:
if (state.effects.ripple.active && state.effects.ripple.mouseSpeed > 5) {
  state.sound.playRipple(state.effects.ripple.mouseSpeed)
}

// In drag move:
if (state.effects.smear.isDragging) {
  state.sound.playSmear(dx, dy)
}
```

**Step 3: Test sound**

Run:
```bash
npm run dev
```
Expected: Toggle sound on, hear subtle audio feedback for interactions

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Web Audio sound system with effect-specific sounds"
```

---

## Task 13: Time Drift Effect

**Files:**
- Create: `src/effects/drift.js`
- Modify: `src/main.js`

**Step 1: Create drift effect**

```js
// src/effects/drift.js
export class DriftEffect {
  constructor() {
    this.active = false
    this.idleTime = 0
    this.idleThreshold = 60000 // 1 minute before drift starts
    this.driftStrength = 0
    this.maxDrift = 0.5
  }

  recordActivity() {
    this.idleTime = 0
    this.driftStrength = Math.max(0, this.driftStrength - 0.01)
  }

  update(characters, dt, charWidth, charHeight) {
    if (!this.active) {
      this.driftStrength = 0
      return
    }

    this.idleTime += dt

    // Gradually increase drift after idle threshold
    if (this.idleTime > this.idleThreshold) {
      this.driftStrength = Math.min(
        this.maxDrift,
        this.driftStrength + dt * 0.00001
      )
    }

    if (this.driftStrength < 0.01) return

    characters.forEach(char => {
      // Random wandering
      if (Math.random() < 0.01 * this.driftStrength) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * charWidth * this.driftStrength * 2

        char.targetX = char.col * charWidth + Math.cos(angle) * dist
        char.targetY = char.row * charHeight + Math.sin(angle) * dist
      }
    })
  }
}
```

**Step 2: Integrate drift into main.js**

Add import:
```js
import { DriftEffect } from './effects/drift.js'
```

Add to state.effects:
```js
drift: new DriftEffect()
```

Add to animate loop:
```js
state.effects.drift.update(
  state.renderer.characters,
  dt,
  state.renderer.charWidth,
  state.renderer.charHeight
)
```

Record activity on interactions:
```js
// In mousemove, click handlers:
state.effects.drift.recordActivity()
```

Update toggle handler:
```js
if (name === 'drift') state.effects.drift.active = value
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add time drift effect for idle state abstraction"
```

---

## Task 14: Example Image on Load

**Files:**
- Create: `public/example.jpg` (use placeholder or real image)
- Modify: `src/main.js`

**Step 1: Add example image loading**

```js
// Add to main.js, after DOM ready

async function loadExampleImage() {
  try {
    const response = await fetch('/example.jpg')
    const blob = await response.blob()
    const file = new File([blob], 'example.jpg', { type: 'image/jpeg' })
    await handleUpload(file)
  } catch (err) {
    console.log('No example image found, waiting for upload')
  }
}

// Call after setup
loadExampleImage()
```

**Step 2: Create public directory and add placeholder**

Run:
```bash
mkdir -p public
# User should add their own example.jpg to public/
```

**Step 3: Update vite.config.js for public directory**

```js
export default {
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist'
  }
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: load example image on page load"
```

---

## Task 15: Mobile Support

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`

**Step 1: Add touch event handlers**

```js
// Add touch support to main.js

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  state.effects.smear.startDrag(x, y)
  state.effects.ripple.setMousePosition(x, y)
  state.discovery.recordHover()
})

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  state.effects.ripple.setMousePosition(x, y)
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
```

**Step 2: Add responsive styles**

```css
@media (max-width: 768px) {
  .mode-selector {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    bottom: 24px;
  }

  .modes, .toggles {
    gap: 16px;
  }

  .upload-btn {
    top: 16px;
    right: 16px;
  }

  .hint {
    bottom: 120px;
    font-size: 13px;
  }
}
```

**Step 3: Test on mobile**

Run:
```bash
npm run dev -- --host
```
Expected: Access from phone, touch interactions work

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add touch support and responsive styles for mobile"
```

---

## Task 16: Final Polish and Build

**Files:**
- Modify: `index.html` (meta tags)
- Run build

**Step 1: Add meta tags for sharing**

```html
<meta name="description" content="Interactive ASCII art installation - transform images into living text art">
<meta property="og:title" content="ASCII Art Installation">
<meta property="og:description" content="Transform images into interactive ASCII art">
<meta name="theme-color" content="#fafafa">
```

**Step 2: Build for production**

Run:
```bash
npm run build
```
Expected: dist/ folder created with optimized files

**Step 3: Preview production build**

Run:
```bash
npm run preview
```
Expected: Production build runs correctly

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: add meta tags and production build"
```

---

## Summary

16 tasks covering:
1. Project setup (Vite, HTML, CSS)
2. Image converter with Unicode characters
3. Character model and renderer
4. Main app loop with upload
5. Breathing effect
6. Ripple effect
7. Glitch effect
8. Smear effect
9. Progressive discovery
10. Mode selector UI
11. Color mode
12. Sound system
13. Time drift
14. Example image
15. Mobile support
16. Final polish

Each task is self-contained with clear file paths and code.
