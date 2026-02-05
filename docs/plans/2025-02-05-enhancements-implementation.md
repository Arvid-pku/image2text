# ASCII Art Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three features: Unicode/ASCII character set toggle with fade transition, PNG/Text snapshot export, and multi-image gallery carousel with wave reveal transitions.

**Architecture:** Character sets stored in separate module with weight mappings. Export uses canvas.toDataURL for PNG and character grid extraction for text. Gallery manages multiple ASCII datasets with navigation UI and column-by-column wave transitions between images.

**Tech Stack:** Vanilla JavaScript, HTML Canvas, CSS transitions

---

## Task 1: Create Character Sets Module

**Files:**
- Create: `src/converter/charsets.js`

**Step 1: Create charsets.js with both character sets**

```javascript
// Unicode characters ordered by visual density (darkest to lightest)
export const UNICODE_CHARSET = [
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

// ASCII characters with letters, ordered by visual density
export const ASCII_CHARSET = [
  { char: '@', weight: 1.0 },
  { char: '%', weight: 0.95 },
  { char: '#', weight: 0.9 },
  { char: 'M', weight: 0.85 },
  { char: 'W', weight: 0.82 },
  { char: 'N', weight: 0.78 },
  { char: 'B', weight: 0.75 },
  { char: 'Q', weight: 0.72 },
  { char: 'O', weight: 0.68 },
  { char: 'D', weight: 0.65 },
  { char: 'K', weight: 0.62 },
  { char: 'X', weight: 0.58 },
  { char: 'Y', weight: 0.55 },
  { char: 'Z', weight: 0.52 },
  { char: 'm', weight: 0.48 },
  { char: 'w', weight: 0.45 },
  { char: 'q', weight: 0.42 },
  { char: 'p', weight: 0.4 },
  { char: 'd', weight: 0.38 },
  { char: 'b', weight: 0.36 },
  { char: 'k', weight: 0.34 },
  { char: 'h', weight: 0.32 },
  { char: 'a', weight: 0.3 },
  { char: 'o', weight: 0.28 },
  { char: 'e', weight: 0.26 },
  { char: 'c', weight: 0.24 },
  { char: 'z', weight: 0.22 },
  { char: 'u', weight: 0.2 },
  { char: 'n', weight: 0.18 },
  { char: 'x', weight: 0.16 },
  { char: 'j', weight: 0.14 },
  { char: 'f', weight: 0.12 },
  { char: 't', weight: 0.1 },
  { char: '|', weight: 0.09 },
  { char: '(', weight: 0.08 },
  { char: ')', weight: 0.08 },
  { char: '[', weight: 0.07 },
  { char: ']', weight: 0.07 },
  { char: '{', weight: 0.06 },
  { char: '}', weight: 0.06 },
  { char: '!', weight: 0.05 },
  { char: '?', weight: 0.05 },
  { char: '/', weight: 0.04 },
  { char: '\\', weight: 0.04 },
  { char: ';', weight: 0.03 },
  { char: ':', weight: 0.03 },
  { char: ',', weight: 0.02 },
  { char: '\'', weight: 0.02 },
  { char: '.', weight: 0.01 },
  { char: ' ', weight: 0.0 }
]

// Find equivalent character in target charset by weight
export function findEquivalentChar(weight, targetCharset) {
  let closest = targetCharset[0]
  let minDiff = Math.abs(weight - closest.weight)

  for (const entry of targetCharset) {
    const diff = Math.abs(weight - entry.weight)
    if (diff < minDiff) {
      minDiff = diff
      closest = entry
    }
  }

  return closest.char
}
```

**Step 2: Verify file was created**

Run: `cat src/converter/charsets.js | head -20`
Expected: First 20 lines of the charsets file

**Step 3: Commit**

```bash
git add src/converter/charsets.js
git commit -m "feat: add character sets module with Unicode and ASCII charsets"
```

---

## Task 2: Refactor characters.js to Use Charsets

**Files:**
- Modify: `src/converter/characters.js`

**Step 1: Update characters.js to use charsets module**

Replace entire file contents with:

```javascript
import { UNICODE_CHARSET, ASCII_CHARSET, findEquivalentChar } from './charsets.js'

// Current active charset (default: Unicode)
let activeCharset = UNICODE_CHARSET

// Get the current charset
export function getActiveCharset() {
  return activeCharset
}

// Set the active charset
export function setActiveCharset(charset) {
  activeCharset = charset
}

// Get charset by name
export function getCharsetByName(name) {
  return name === 'ascii' ? ASCII_CHARSET : UNICODE_CHARSET
}

// Exported for backwards compatibility
export const CHARACTERS = UNICODE_CHARSET

// Get character for a brightness value (0-255)
export function getCharForBrightness(brightness) {
  // Invert: 0 (black) = dense char, 255 (white) = sparse char
  const normalizedBrightness = 1 - (brightness / 255)

  // Find closest character by weight
  let closest = activeCharset[0]
  let minDiff = Math.abs(normalizedBrightness - closest.weight)

  for (const entry of activeCharset) {
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
  const idx = activeCharset.findIndex(c => c.char === char)
  if (idx === -1) return [char]

  const similar = [activeCharset[idx].char]
  if (idx > 0) similar.push(activeCharset[idx - 1].char)
  if (idx < activeCharset.length - 1) similar.push(activeCharset[idx + 1].char)

  return similar
}
```

**Step 2: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 3: Commit**

```bash
git add src/converter/characters.js
git commit -m "refactor: update characters.js to use charsets module"
```

---

## Task 3: Add Charset Toggle to Mode Selector UI

**Files:**
- Modify: `src/ui/modeSelector.js:5-18`

**Step 1: Add charset toggle to the toggles HTML**

In `src/ui/modeSelector.js`, update the innerHTML to add a charset toggle:

Find:
```javascript
      <div class="toggles">
        <span class="toggle active" data-toggle="sound">Sound</span>
        <span class="toggle active" data-toggle="color">Color</span>
        <span class="toggle active" data-toggle="drift">Drift</span>
      </div>
```

Replace with:
```javascript
      <div class="toggles">
        <span class="toggle active" data-toggle="sound">Sound</span>
        <span class="toggle active" data-toggle="color">Color</span>
        <span class="toggle active" data-toggle="drift">Drift</span>
        <span class="toggle active" data-toggle="charset">Unicode</span>
      </div>
```

**Step 2: Update toggle state initialization**

Find:
```javascript
    this.toggles = { sound: true, color: true, drift: true }
```

Replace with:
```javascript
    this.toggles = { sound: true, color: true, drift: true, charset: true }
```

**Step 3: Update setToggle method for charset special handling**

Find the setToggle method and replace it with:
```javascript
  setToggle(name, value) {
    this.toggles[name] = value
    const el = this.element.querySelector(`[data-toggle="${name}"]`)

    if (name === 'charset') {
      // Charset toggle shows text instead of active/inactive
      el.textContent = value ? 'Unicode' : 'ASCII'
      el.classList.add('active') // Always looks active
    } else {
      el.classList.toggle('active', value)
    }

    if (this.onToggleChange) this.onToggleChange(name, value)
  }
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/ui/modeSelector.js
git commit -m "feat: add charset toggle to mode selector UI"
```

---

## Task 4: Add Charset Transition Method to Renderer

**Files:**
- Modify: `src/renderer/index.js`

**Step 1: Import charsets module**

At the top of `src/renderer/index.js`, add:
```javascript
import { UNICODE_CHARSET, ASCII_CHARSET, findEquivalentChar } from '../converter/charsets.js'
```

**Step 2: Add charset property and transition method**

After the `pulse()` method (around line 105), add:

```javascript
  // Current charset mode (true = unicode, false = ascii)
  charsetMode = true

  // Transition characters between charsets with per-character fade
  transitionCharset(toUnicode) {
    if (this.charsetMode === toUnicode) return
    this.charsetMode = toUnicode

    const targetCharset = toUnicode ? UNICODE_CHARSET : ASCII_CHARSET
    const staggerDelay = 5 // ms per character position

    this.characters.forEach((char, idx) => {
      const col = char.col
      const row = char.row
      // Stagger based on position for organic feel
      const delay = (col + row * 0.5) * staggerDelay

      setTimeout(() => {
        // Phase 1: Fade out (0 to 100ms)
        const fadeOutDuration = 100
        const startOpacity = char.opacity

        const fadeOut = (elapsed) => {
          const progress = Math.min(elapsed / fadeOutDuration, 1)
          char.opacity = startOpacity * (1 - progress)

          if (progress < 1) {
            requestAnimationFrame((time) => fadeOut(elapsed + 16))
          } else {
            // At midpoint: swap character
            const newChar = findEquivalentChar(char.weight, targetCharset)
            char.char = newChar
            char.originalChar = newChar

            // Phase 2: Fade in (100 to 200ms)
            const fadeIn = (elapsed) => {
              const progress = Math.min(elapsed / fadeOutDuration, 1)
              char.opacity = progress

              if (progress < 1) {
                requestAnimationFrame((time) => fadeIn(elapsed + 16))
              }
            }
            fadeIn(0)
          }
        }
        fadeOut(0)
      }, delay)
    })
  }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/renderer/index.js
git commit -m "feat: add charset transition method with per-character fade"
```

---

## Task 5: Wire Charset Toggle in Main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Import charset functions**

At the top of `src/main.js`, add to the imports:
```javascript
import { setActiveCharset, getCharsetByName } from './converter/characters.js'
```

**Step 2: Handle charset toggle in onToggleChange**

Find the `state.modeSelector.onToggleChange` handler and update it:

Find:
```javascript
state.modeSelector.onToggleChange = (name, value) => {
  if (name === 'color') state.renderer.colorMode = value
  if (name === 'sound') {
    if (value) state.sound.enable()
    else state.sound.disable()
  }
  if (name === 'drift') state.effects.drift.active = value
}
```

Replace with:
```javascript
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
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Manual test**

Run: `npm run dev`
- Load an image
- Click "Unicode" toggle - should change to "ASCII" and characters fade-transition
- Click "ASCII" toggle - should change to "Unicode" and characters fade back

**Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: wire charset toggle to renderer transition"
```

---

## Task 6: Add Save Button to HTML

**Files:**
- Modify: `index.html`

**Step 1: Add Save button next to New button**

Find:
```html
    <button id="upload-btn" class="upload-btn">New</button>
```

Replace with:
```html
    <button id="upload-btn" class="upload-btn">New</button>
    <button id="save-btn" class="save-btn" style="display: none;">Save</button>
```

**Step 2: Verify**

Run: `cat index.html`
Expected: Both New and Save buttons present

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Save button to HTML"
```

---

## Task 7: Style Save Button and Dropdown

**Files:**
- Modify: `src/style.css`

**Step 1: Add styles for save button and export menu**

At the end of `src/style.css` (before the media query), add:

```css
.save-btn {
  position: fixed;
  top: 24px;
  right: 72px;
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.save-btn:hover {
  color: #1a1a1a;
}

.export-menu {
  position: fixed;
  top: 48px;
  right: 72px;
  background: #fff;
  border: 1px solid #eee;
  padding: 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.export-menu.visible {
  opacity: 1;
  pointer-events: auto;
}

.export-option {
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  transition: background 0.15s, color 0.15s;
}

.export-option:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}
```

**Step 2: Update mobile styles**

Inside the `@media (max-width: 768px)` block, add:

```css
  .save-btn {
    top: 16px;
    right: 56px;
  }

  .export-menu {
    top: 40px;
    right: 56px;
  }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/style.css
git commit -m "feat: add styles for save button and export menu"
```

---

## Task 8: Create Export Menu Component

**Files:**
- Create: `src/ui/exportMenu.js`

**Step 1: Create exportMenu.js**

```javascript
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
```

**Step 2: Verify file created**

Run: `cat src/ui/exportMenu.js | head -20`
Expected: First 20 lines of export menu code

**Step 3: Commit**

```bash
git add src/ui/exportMenu.js
git commit -m "feat: create export menu component"
```

---

## Task 9: Add Export Functions to Renderer

**Files:**
- Modify: `src/renderer/index.js`

**Step 1: Add exportAsPNG method to Renderer class**

After the `transitionCharset` method, add:

```javascript
  // Export current canvas as PNG at 2x resolution
  exportAsPNG() {
    // Create high-res canvas
    const scale = 2
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = this.canvas.width * scale
    exportCanvas.height = this.canvas.height * scale

    const ctx = exportCanvas.getContext('2d')
    ctx.scale(scale, scale)

    // Draw white background
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Set font scaled appropriately
    ctx.font = this.font

    // Draw all characters at current positions
    this.characters.forEach(char => {
      char.draw(ctx, this.charWidth, this.charHeight, this.colorMode)
    })

    // Convert to data URL and trigger download
    const dataUrl = exportCanvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `ascii-art-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  // Export current characters as plain text
  exportAsText() {
    const lines = []

    for (let row = 0; row < this.rows; row++) {
      let line = ''
      for (let col = 0; col < this.cols; col++) {
        const idx = row * this.cols + col
        const char = this.characters[idx]
        line += char ? char.char : ' '
      }
      // Trim trailing spaces
      lines.push(line.trimEnd())
    }

    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop()
    }

    const text = lines.join('\n')

    // Trigger download
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ascii-art-${Date.now()}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/renderer/index.js
git commit -m "feat: add PNG and text export methods to renderer"
```

---

## Task 10: Wire Export Menu in Main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Import ExportMenu**

Add to imports at top:
```javascript
import { ExportMenu } from './ui/exportMenu.js'
```

**Step 2: Initialize export menu in state**

Find `state.sound = new SoundManager()` and add after it:
```javascript
state.exportMenu = new ExportMenu()
```

**Step 3: Add export handler**

After the `state.modeSelector.onToggleChange` handler, add:
```javascript
// Export handler
state.exportMenu.onExport = (format) => {
  if (format === 'png') {
    state.renderer.exportAsPNG()
  } else if (format === 'txt') {
    state.renderer.exportAsText()
  }
}
```

**Step 4: Add save button click handler**

Find `const uploadBtn = document.getElementById('upload-btn')` and add after it:
```javascript
const saveBtn = document.getElementById('save-btn')
```

Find the upload button click handler and add after it:
```javascript
saveBtn.addEventListener('click', () => state.exportMenu.toggle())
```

**Step 5: Show save button after image loads**

In the `handleUpload` function, after `state.renderer.setAsciiData(asciiData)`, add:
```javascript
    saveBtn.style.display = 'block'
```

**Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Manual test**

Run: `npm run dev`
- Load an image
- Save button should appear
- Click Save - dropdown should appear
- Click "Save as PNG" - should download a PNG file
- Click "Save as Text" - should download a TXT file

**Step 8: Commit**

```bash
git add src/main.js
git commit -m "feat: wire export menu functionality"
```

---

## Task 11: Create Gallery State Manager

**Files:**
- Create: `src/gallery/index.js`

**Step 1: Create gallery state manager**

```javascript
export class Gallery {
  constructor() {
    this.images = []      // Array of { asciiData, originalFile }
    this.currentIndex = 0
    this.maxImages = 8
    this.transitioning = false
    this.onNavigate = null
  }

  get count() {
    return this.images.length
  }

  get current() {
    return this.images[this.currentIndex] || null
  }

  add(asciiData, originalFile) {
    if (this.images.length >= this.maxImages) {
      // Remove oldest image
      this.images.shift()
      if (this.currentIndex > 0) this.currentIndex--
    }

    this.images.push({ asciiData, originalFile })
    this.currentIndex = this.images.length - 1

    return this.currentIndex
  }

  clear() {
    this.images = []
    this.currentIndex = 0
  }

  navigate(direction) {
    if (this.transitioning || this.images.length <= 1) return false

    const newIndex = direction === 'next'
      ? (this.currentIndex + 1) % this.images.length
      : (this.currentIndex - 1 + this.images.length) % this.images.length

    if (newIndex === this.currentIndex) return false

    const oldIndex = this.currentIndex
    this.currentIndex = newIndex

    if (this.onNavigate) {
      this.onNavigate(oldIndex, newIndex, direction)
    }

    return true
  }

  goTo(index) {
    if (this.transitioning || index < 0 || index >= this.images.length) return false
    if (index === this.currentIndex) return false

    const direction = index > this.currentIndex ? 'next' : 'prev'
    const oldIndex = this.currentIndex
    this.currentIndex = index

    if (this.onNavigate) {
      this.onNavigate(oldIndex, index, direction)
    }

    return true
  }
}
```

**Step 2: Verify file created**

Run: `cat src/gallery/index.js | head -20`
Expected: First 20 lines of gallery code

**Step 3: Commit**

```bash
git add src/gallery/index.js
git commit -m "feat: create gallery state manager"
```

---

## Task 12: Create Wave Reveal Effect

**Files:**
- Create: `src/effects/waveReveal.js`

**Step 1: Create wave reveal transition effect**

```javascript
export class WaveRevealEffect {
  constructor() {
    this.transitioning = false
    this.onComplete = null
  }

  // Transition between two ASCII datasets with wave reveal
  // direction: 'next' (wave left to right) or 'prev' (wave right to left)
  transition(renderer, fromData, toData, direction, onComplete) {
    if (this.transitioning) return

    this.transitioning = true
    const cols = renderer.cols
    const staggerDelay = 20 // ms per column

    // Determine column order based on direction
    const columnOrder = direction === 'next'
      ? Array.from({ length: cols }, (_, i) => i)
      : Array.from({ length: cols }, (_, i) => cols - 1 - i)

    let completedColumns = 0

    columnOrder.forEach((col, orderIdx) => {
      const delay = orderIdx * staggerDelay

      setTimeout(() => {
        // Get characters in this column
        renderer.characters.forEach((char, idx) => {
          if (char.col !== col) return

          const row = char.row
          const newCharData = toData.characters[row * cols + col]
          if (!newCharData) return

          // Phase 1: Fade out (100ms)
          const fadeOutDuration = 100
          const startOpacity = char.opacity

          const fadeOut = (elapsed) => {
            const progress = Math.min(elapsed / fadeOutDuration, 1)
            char.opacity = startOpacity * (1 - progress)

            if (progress < 1) {
              requestAnimationFrame(() => fadeOut(elapsed + 16))
            } else {
              // Swap character data
              char.char = newCharData.char
              char.originalChar = newCharData.char
              char.weight = newCharData.weight
              char.originalColor = newCharData.originalColor

              // Phase 2: Fade in (100ms)
              const fadeIn = (elapsed) => {
                const progress = Math.min(elapsed / fadeOutDuration, 1)
                char.opacity = progress

                if (progress < 1) {
                  requestAnimationFrame(() => fadeIn(elapsed + 16))
                }
              }
              fadeIn(0)
            }
          }
          fadeOut(0)
        })

        completedColumns++
        if (completedColumns === cols) {
          // All columns complete
          setTimeout(() => {
            this.transitioning = false
            if (onComplete) onComplete()
          }, 200) // Wait for last fade-in
        }
      }, delay)
    })
  }
}
```

**Step 2: Verify file created**

Run: `cat src/effects/waveReveal.js | head -20`
Expected: First 20 lines of wave reveal code

**Step 3: Commit**

```bash
git add src/effects/waveReveal.js
git commit -m "feat: create wave reveal transition effect"
```

---

## Task 13: Create Carousel UI Component

**Files:**
- Create: `src/ui/carousel.js`

**Step 1: Create carousel navigation component**

```javascript
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
```

**Step 2: Verify file created**

Run: `cat src/ui/carousel.js | head -20`
Expected: First 20 lines of carousel code

**Step 3: Commit**

```bash
git add src/ui/carousel.js
git commit -m "feat: create carousel navigation component"
```

---

## Task 14: Add Carousel Styles

**Files:**
- Modify: `src/style.css`

**Step 1: Add carousel styles before the media query**

```css
.carousel {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid #999;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.carousel-dot:hover {
  border-color: #666;
}

.carousel-dot.active {
  background: #1a1a1a;
  border-color: #1a1a1a;
}

.carousel-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-arrow {
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}

.carousel-arrow:hover {
  color: #1a1a1a;
}

.carousel-counter {
  color: #666;
  min-width: 32px;
  text-align: center;
}
```

**Step 2: Add mobile styles inside the media query**

```css
  .carousel {
    bottom: 140px;
  }
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/style.css
git commit -m "feat: add carousel styles"
```

---

## Task 15: Wire Gallery and Carousel in Main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Import gallery components**

Add to imports:
```javascript
import { Gallery } from './gallery/index.js'
import { Carousel } from './ui/carousel.js'
import { WaveRevealEffect } from './effects/waveReveal.js'
```

**Step 2: Initialize gallery components in state**

After `state.exportMenu = new ExportMenu()`, add:
```javascript
state.gallery = new Gallery()
state.carousel = new Carousel()
state.waveReveal = new WaveRevealEffect()
```

**Step 3: Set up gallery navigation handler**

After the export handler, add:
```javascript
// Gallery navigation handler
state.gallery.onNavigate = (oldIndex, newIndex, direction) => {
  const toData = state.gallery.images[newIndex].asciiData
  state.gallery.transitioning = true

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
```

**Step 4: Update handleUpload to use gallery**

Replace the entire `handleUpload` function with:

```javascript
async function handleUpload(file, clearGallery = false) {
  try {
    if (clearGallery) {
      state.gallery.clear()
    }

    const imageData = await loadImage(file)
    const asciiData = imageToAscii(imageData, 100)

    // Add to gallery
    state.gallery.add(asciiData, file)

    // If this is the first image or clearGallery, set directly
    if (state.gallery.count === 1 || clearGallery) {
      state.renderer.setAsciiData(asciiData)
      resizeCanvas()
    } else {
      // Transition to new image
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
```

**Step 5: Update upload button handler for shift+click**

Find the upload input change handler and update it:

```javascript
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    // Check if shift was held (stored from click event)
    handleUpload(file, uploadInput.shiftHeld)
    uploadInput.shiftHeld = false
  }
})
```

Update the upload button click handler:

```javascript
uploadBtn.addEventListener('click', (e) => {
  uploadInput.shiftHeld = e.shiftKey
  uploadInput.click()
})
```

**Step 6: Add touch/swipe support for gallery**

After the existing touch handlers, add:
```javascript
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
```

**Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add src/main.js
git commit -m "feat: wire gallery and carousel with wave reveal transitions"
```

---

## Task 16: Final Testing and Polish

**Files:**
- All modified files

**Step 1: Run the dev server**

Run: `npm run dev`

**Step 2: Test charset toggle**

- Load an image
- Click "Unicode" to toggle to "ASCII"
- Verify characters fade and swap to letter-based ASCII
- Click "ASCII" to toggle back to "Unicode"
- Verify characters fade and swap back to Unicode blocks

**Step 3: Test export functionality**

- Click "Save" button
- Click "Save as PNG" - verify PNG downloads with timestamp filename
- Click "Save as Text" - verify TXT downloads with ASCII art content

**Step 4: Test gallery carousel**

- Load first image
- Click "New" to add second image - verify wave transition
- Verify carousel appears with dots and arrows
- Click arrows to navigate between images
- Use keyboard arrow keys to navigate
- On mobile: swipe left/right to navigate
- Shift+click "New" to clear gallery and start fresh

**Step 5: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit final polish (if any fixes needed)**

```bash
git add -A
git commit -m "polish: final testing and adjustments"
```

---

## Summary

This plan implements three features in 16 tasks:

1. **Tasks 1-5**: Character Set Toggle
   - Create charsets module with Unicode and ASCII character sets
   - Refactor characters.js to use charsets
   - Add toggle to UI
   - Implement per-character fade transition in renderer
   - Wire toggle in main.js

2. **Tasks 6-10**: Static Snapshot Export
   - Add Save button to HTML
   - Style button and dropdown
   - Create export menu component
   - Add PNG and text export methods to renderer
   - Wire export menu in main.js

3. **Tasks 11-15**: Gallery Carousel
   - Create gallery state manager
   - Create wave reveal effect
   - Create carousel UI component
   - Add carousel styles
   - Wire gallery with carousel and wave transitions

4. **Task 16**: Final testing and polish
