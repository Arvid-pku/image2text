# Video to ASCII Art Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add video upload, real-time ASCII playback, and video export with audio.

**Architecture:** Hidden `<video>` element for playback timing and audio. VideoProcessor extracts frames → imageToAscii() → renderer. MediaRecorder captures canvas + audio for WebM export.

**Tech Stack:** HTML5 Video, Canvas, MediaRecorder API, requestVideoFrameCallback

---

### Task 1: VideoProcessor - Basic Structure

**Files:**
- Create: `src/video/VideoProcessor.js`

**Step 1: Create VideoProcessor class with video element setup**

```javascript
export class VideoProcessor {
  constructor() {
    this.video = document.createElement('video')
    this.video.style.display = 'none'
    this.video.playsInline = true
    this.video.muted = false
    document.body.appendChild(this.video)

    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')

    this.isPlaying = false
    this.duration = 0
    this.currentTime = 0
    this.onFrame = null // callback(imageData)
    this.onTimeUpdate = null // callback(currentTime, duration)
    this.onEnded = null
  }

  async load(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      this.video.src = url

      this.video.onloadedmetadata = () => {
        this.duration = this.video.duration
        this.offscreenCanvas.width = this.video.videoWidth
        this.offscreenCanvas.height = this.video.videoHeight
        resolve({
          width: this.video.videoWidth,
          height: this.video.videoHeight,
          duration: this.video.duration
        })
      }

      this.video.onerror = () => reject(new Error('Failed to load video'))
    })
  }

  play() {
    if (this.isPlaying) return
    this.isPlaying = true
    this.video.play()
    this._processFrames()
  }

  pause() {
    this.isPlaying = false
    this.video.pause()
  }

  seek(time) {
    this.video.currentTime = time
    this.currentTime = time
  }

  _processFrames() {
    if (!this.isPlaying) return

    // Extract current frame
    this.offscreenCtx.drawImage(this.video, 0, 0)
    const imageData = this.offscreenCtx.getImageData(
      0, 0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    )

    this.currentTime = this.video.currentTime

    if (this.onFrame) {
      this.onFrame(imageData)
    }

    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, this.duration)
    }

    if (this.video.ended) {
      this.isPlaying = false
      if (this.onEnded) this.onEnded()
      return
    }

    requestAnimationFrame(() => this._processFrames())
  }

  destroy() {
    this.pause()
    if (this.video.src) {
      URL.revokeObjectURL(this.video.src)
    }
    this.video.remove()
  }
}
```

**Step 2: Commit**

```bash
git add src/video/VideoProcessor.js
git commit -m "feat: add VideoProcessor class for video frame extraction"
```

---

### Task 2: VideoControls UI

**Files:**
- Create: `src/ui/videoControls.js`

**Step 1: Create VideoControls class**

```javascript
export class VideoControls {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'video-controls'
    this.element.innerHTML = `
      <button class="video-play-btn">▶</button>
      <div class="video-progress">
        <div class="video-progress-bar"></div>
      </div>
      <span class="video-time">0:00 / 0:00</span>
    `
    this.element.style.display = 'none'
    document.getElementById('app').appendChild(this.element)

    this.playBtn = this.element.querySelector('.video-play-btn')
    this.progress = this.element.querySelector('.video-progress')
    this.progressBar = this.element.querySelector('.video-progress-bar')
    this.timeDisplay = this.element.querySelector('.video-time')

    this.isPlaying = false
    this.duration = 0
    this.onPlay = null
    this.onPause = null
    this.onSeek = null

    this._bindEvents()
  }

  _bindEvents() {
    this.playBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause()
        if (this.onPause) this.onPause()
      } else {
        this.play()
        if (this.onPlay) this.onPlay()
      }
    })

    this.progress.addEventListener('click', (e) => {
      const rect = this.progress.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const time = percent * this.duration
      if (this.onSeek) this.onSeek(time)
    })

    // Spacebar toggle
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.element.style.display !== 'none') {
        e.preventDefault()
        this.playBtn.click()
      }
    })
  }

  show(duration) {
    this.duration = duration
    this.element.style.display = 'flex'
    this.updateTime(0, duration)
  }

  hide() {
    this.element.style.display = 'none'
  }

  play() {
    this.isPlaying = true
    this.playBtn.textContent = '❚❚'
  }

  pause() {
    this.isPlaying = false
    this.playBtn.textContent = '▶'
  }

  updateTime(current, duration) {
    const formatTime = (t) => {
      const mins = Math.floor(t / 60)
      const secs = Math.floor(t % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    this.timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`
    this.progressBar.style.width = `${(current / duration) * 100}%`
  }

  reset() {
    this.pause()
    this.updateTime(0, this.duration)
  }
}
```

**Step 2: Commit**

```bash
git add src/ui/videoControls.js
git commit -m "feat: add VideoControls UI component"
```

---

### Task 3: Video Controls CSS

**Files:**
- Modify: `index.html` (add styles in existing `<style>` block)

**Step 1: Add video controls styles**

Find the `</style>` tag and add before it:

```css
.video-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  border-radius: 25px;
  z-index: 100;
}

.video-play-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-play-btn:hover {
  color: #4a9eff;
}

.video-progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
}

.video-progress-bar {
  height: 100%;
  background: #4a9eff;
  border-radius: 2px;
  width: 0%;
  transition: width 0.1s linear;
}

.video-time {
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  min-width: 90px;
}
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add video controls CSS styles"
```

---

### Task 4: VideoExporter

**Files:**
- Create: `src/video/VideoExporter.js`

**Step 1: Create VideoExporter class**

```javascript
export class VideoExporter {
  constructor() {
    this.mediaRecorder = null
    this.chunks = []
    this.isExporting = false
    this.onProgress = null
    this.onComplete = null
    this.onError = null
  }

  async export(canvas, videoProcessor) {
    if (this.isExporting) return
    this.isExporting = true
    this.chunks = []

    try {
      // Get canvas stream
      const canvasStream = canvas.captureStream(30)

      // Get audio from video element
      const videoStream = videoProcessor.video.captureStream()
      const audioTracks = videoStream.getAudioTracks()

      // Combine streams
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks
      ])

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 5000000
      })

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' })
        this._triggerDownload(blob)
        this.isExporting = false
        if (this.onComplete) this.onComplete()
      }

      this.mediaRecorder.onerror = (e) => {
        this.isExporting = false
        if (this.onError) this.onError(e)
      }

      // Track progress
      const duration = videoProcessor.duration
      const progressInterval = setInterval(() => {
        if (!this.isExporting) {
          clearInterval(progressInterval)
          return
        }
        const progress = videoProcessor.currentTime / duration
        if (this.onProgress) this.onProgress(progress)
      }, 100)

      // Start recording
      this.mediaRecorder.start(100)

      // Reset video and play
      videoProcessor.seek(0)
      videoProcessor.play()

      // Stop when video ends
      const originalOnEnded = videoProcessor.onEnded
      videoProcessor.onEnded = () => {
        clearInterval(progressInterval)
        this.mediaRecorder.stop()
        videoProcessor.onEnded = originalOnEnded
        if (originalOnEnded) originalOnEnded()
      }

    } catch (err) {
      this.isExporting = false
      if (this.onError) this.onError(err)
    }
  }

  _triggerDownload(blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ascii-video-${Date.now()}.webm`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  cancel() {
    if (this.mediaRecorder && this.isExporting) {
      this.mediaRecorder.stop()
      this.isExporting = false
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/video/VideoExporter.js
git commit -m "feat: add VideoExporter for WebM export with audio"
```

---

### Task 5: Update File Input for Video

**Files:**
- Modify: `index.html`

**Step 1: Update upload input to accept video**

Find:
```html
<input type="file" id="upload" accept="image/*" hidden>
```

Replace with:
```html
<input type="file" id="upload" accept="image/*,video/*" hidden>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: accept video files in upload input"
```

---

### Task 6: Integrate Video into Main.js - Imports and State

**Files:**
- Modify: `src/main.js`

**Step 1: Add imports at top of file**

After the existing imports, add:
```javascript
import { VideoProcessor } from './video/VideoProcessor.js'
import { VideoExporter } from './video/VideoExporter.js'
import { VideoControls } from './ui/videoControls.js'
```

**Step 2: Add video state to the state object**

Find the state object and add these properties:
```javascript
  videoProcessor: new VideoProcessor(),
  videoExporter: new VideoExporter(),
  videoControls: new VideoControls(),
  currentMedia: 'image', // 'image' or 'video'
```

**Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add video imports and state to main.js"
```

---

### Task 7: Video Controls Event Handlers

**Files:**
- Modify: `src/main.js`

**Step 1: Add video controls handlers after the carousel handler**

```javascript
// Video controls handlers
state.videoControls.onPlay = () => {
  state.videoProcessor.play()
}

state.videoControls.onPause = () => {
  state.videoProcessor.pause()
}

state.videoControls.onSeek = (time) => {
  state.videoProcessor.seek(time)
}

// Video processor handlers
state.videoProcessor.onFrame = (imageData) => {
  const targetChars = DENSITY_TARGETS['standard']
  const cols = calculateCols(imageData.width, imageData.height, targetChars)
  const asciiData = imageToAscii(imageData, cols)
  state.renderer.setAsciiData(asciiData)
  resizeCanvas()
  state.renderer.draw()
}

state.videoProcessor.onTimeUpdate = (current, duration) => {
  state.videoControls.updateTime(current, duration)
}

state.videoProcessor.onEnded = () => {
  state.videoControls.reset()
}
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: add video controls and processor event handlers"
```

---

### Task 8: Video Upload Handler

**Files:**
- Modify: `src/main.js`

**Step 1: Create handleVideoUpload function after handleUpload**

```javascript
// Handle video upload
async function handleVideoUpload(file) {
  try {
    // Clean up previous video
    if (state.currentMedia === 'video') {
      state.videoProcessor.destroy()
      state.videoProcessor = new VideoProcessor()
      // Rebind handlers
      state.videoProcessor.onFrame = (imageData) => {
        const targetChars = DENSITY_TARGETS['standard']
        const cols = calculateCols(imageData.width, imageData.height, targetChars)
        const asciiData = imageToAscii(imageData, cols)
        state.renderer.setAsciiData(asciiData)
        resizeCanvas()
        state.renderer.draw()
      }
      state.videoProcessor.onTimeUpdate = (current, duration) => {
        state.videoControls.updateTime(current, duration)
      }
      state.videoProcessor.onEnded = () => {
        state.videoControls.reset()
      }
    }

    const info = await state.videoProcessor.load(file)
    state.currentMedia = 'video'

    // Show video controls, hide mode selector
    state.videoControls.show(info.duration)
    state.modeSelector.hide()
    state.carousel.hide()

    // Process first frame
    state.videoProcessor.seek(0)

    // Extract first frame manually
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = info.width
    offscreenCanvas.height = info.height
    const ctx = offscreenCanvas.getContext('2d')

    // Wait for video to be ready
    await new Promise(resolve => setTimeout(resolve, 100))
    ctx.drawImage(state.videoProcessor.video, 0, 0)
    const imageData = ctx.getImageData(0, 0, info.width, info.height)

    const targetChars = DENSITY_TARGETS['standard']
    const cols = calculateCols(info.width, info.height, targetChars)
    const asciiData = imageToAscii(imageData, cols)

    state.renderer.setAsciiData(asciiData)
    resizeCanvas()

    saveBtn.style.display = 'block'

    if (!state.running) {
      state.running = true
      state.lastTime = performance.now()
      requestAnimationFrame(animate)
    }
  } catch (err) {
    console.error('Failed to process video:', err)
    alert('Failed to load video. Please try a different file.')
  }
}
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: add handleVideoUpload function"
```

---

### Task 9: Update Upload Change Handler

**Files:**
- Modify: `src/main.js`

**Step 1: Find and update the upload change handler**

Find:
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

Replace with:
```javascript
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.type.startsWith('video/')) {
      handleVideoUpload(file)
    } else {
      // Switch back to image mode if was in video mode
      if (state.currentMedia === 'video') {
        state.videoProcessor.pause()
        state.videoControls.hide()
        state.modeSelector.show()
        state.currentMedia = 'image'
      }
      // Check if shift was held (stored from click event)
      handleUpload(file, uploadInput.shiftHeld)
      uploadInput.shiftHeld = false
    }
  }
})
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: route uploads to image or video handler by type"
```

---

### Task 10: Update Export Menu for Video

**Files:**
- Modify: `src/ui/exportMenu.js`

**Step 1: Add video export option and mode switching**

Replace the entire file:
```javascript
export class ExportMenu {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'export-menu'
    this.element.innerHTML = `
      <div class="export-option image-only" data-format="png">Save as PNG</div>
      <div class="export-option image-only" data-format="txt">Save as Text</div>
      <div class="export-option image-only" data-format="copy">Copy to Clipboard</div>
      <div class="export-option video-only" data-format="video">Save as Video</div>
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
```

**Step 2: Commit**

```bash
git add src/ui/exportMenu.js
git commit -m "feat: add video export option to export menu"
```

---

### Task 11: Update Export Handler in Main.js

**Files:**
- Modify: `src/main.js`

**Step 1: Update the export handler**

Find the export handler and replace:
```javascript
// Export handler
state.exportMenu.onExport = (format) => {
  if (format === 'png') {
    state.renderer.exportAsPNG()
  } else if (format === 'txt') {
    state.renderer.exportAsText()
  } else if (format === 'copy') {
    state.renderer.copyToClipboard()
  }
}
```

With:
```javascript
// Export handler
state.exportMenu.onExport = (format) => {
  if (format === 'png') {
    state.renderer.exportAsPNG()
  } else if (format === 'txt') {
    state.renderer.exportAsText()
  } else if (format === 'copy') {
    state.renderer.copyToClipboard()
  } else if (format === 'video') {
    state.videoExporter.onProgress = (progress) => {
      console.log(`Exporting: ${Math.round(progress * 100)}%`)
    }
    state.videoExporter.onComplete = () => {
      console.log('Export complete!')
      state.videoControls.reset()
    }
    state.videoExporter.onError = (err) => {
      console.error('Export failed:', err)
      alert('Video export failed. Please try again.')
    }
    state.videoExporter.export(canvas, state.videoProcessor)
  }
}
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: add video export handler"
```

---

### Task 12: Update Export Menu Mode on Upload

**Files:**
- Modify: `src/main.js`

**Step 1: Set export menu mode when media type changes**

In `handleVideoUpload`, after `state.currentMedia = 'video'`, add:
```javascript
    state.exportMenu.setMode('video')
```

In the upload change handler, after `state.currentMedia = 'image'`, add:
```javascript
        state.exportMenu.setMode('image')
```

Also add at the end of `handleUpload` function, before the closing brace of the try block:
```javascript
    state.exportMenu.setMode('image')
```

**Step 2: Commit**

```bash
git add src/main.js
git commit -m "feat: sync export menu mode with current media type"
```

---

### Task 13: Add Carousel Hide Method

**Files:**
- Modify: `src/ui/carousel.js`

**Step 1: Read the current file and add hide method**

Add a hide method to the Carousel class:
```javascript
  hide() {
    this.element.style.display = 'none'
  }

  show() {
    this.element.style.display = 'flex'
  }
```

**Step 2: Commit**

```bash
git add src/ui/carousel.js
git commit -m "feat: add hide/show methods to carousel"
```

---

### Task 14: Final Integration Test

**Step 1: Test the complete video flow**

Run: `npm run dev`

Test checklist:
1. Upload a video file - should show first frame as ASCII
2. Click play - video plays as ASCII art
3. Click pause - video pauses
4. Click on progress bar - seeks to position
5. Press spacebar - toggles play/pause
6. Let video end - shows play button again
7. Click Save → Save as Video - exports WebM with audio
8. Upload an image - returns to image mode with all options

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete video to ASCII art feature"
```

---

### Task 15: Push to Remote

**Step 1: Push all changes**

```bash
git push origin main
```
