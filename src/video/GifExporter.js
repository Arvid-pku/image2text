import GIF from 'gif.js'

export class GifExporter {
  constructor() {
    this.isExporting = false
    this.gif = null
    this.onProgress = null
    this.onComplete = null
    this.onError = null
  }

  async export(canvas, videoProcessor) {
    if (this.isExporting) return
    this.isExporting = true

    const MAX_DURATION = 5 // Maximum 5 seconds
    const FPS = 10 // 10 frames per second

    try {
      // Calculate actual duration (capped at 5 seconds)
      const actualDuration = Math.min(videoProcessor.duration, MAX_DURATION)
      const totalFrames = Math.floor(actualDuration * FPS)

      // Create GIF encoder
      this.gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: './gif.worker.js'
      })

      // Handle GIF encoding progress
      this.gif.on('progress', (p) => {
        // Progress during encoding phase (50-100%)
        const percent = 50 + Math.round(p * 50)
        if (this.onProgress) this.onProgress(percent / 100)
      })

      // Handle GIF completion
      this.gif.on('finished', (blob) => {
        this._triggerDownload(blob)
        this.isExporting = false
        if (this.onComplete) this.onComplete()
      })

      // Handle GIF errors
      this.gif.on('error', (err) => {
        console.error('GIF encoding error:', err)
        this.isExporting = false
        if (this.onError) this.onError(err)
      })

      // Capture frames
      await this._captureFrames(canvas, videoProcessor, totalFrames, FPS, actualDuration)

      // Start encoding
      if (this.onProgress) this.onProgress(0.5)
      this.gif.render()

    } catch (err) {
      this.isExporting = false
      if (this.onError) this.onError(err)
    }
  }

  async _captureFrames(canvas, videoProcessor, totalFrames, fps, actualDuration) {
    return new Promise((resolve) => {
      let framesCaptured = 0
      const frameInterval = 1000 / fps

      // Reset video to start
      videoProcessor.seek(0)
      videoProcessor.play()

      const captureFrame = () => {
        // Check if video has ended or we've captured enough frames
        if (framesCaptured >= totalFrames || !this.isExporting ||
            videoProcessor.video.ended || videoProcessor.currentTime >= actualDuration) {
          videoProcessor.pause()
          resolve()
          return
        }

        // Add current canvas frame to GIF
        this.gif.addFrame(canvas, { copy: true, delay: frameInterval })
        framesCaptured++

        // Update progress (0-50% for capture phase)
        const capturePercent = (framesCaptured / totalFrames) * 0.5
        if (this.onProgress) this.onProgress(capturePercent)

        // Schedule next frame capture
        setTimeout(captureFrame, frameInterval)
      }

      // Start capturing after a small delay to ensure video is playing
      setTimeout(captureFrame, 100)
    })
  }

  _triggerDownload(blob) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ascii-video-${Date.now()}.gif`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  cancel() {
    if (this.isExporting) {
      this.isExporting = false
      if (this.gif) {
        this.gif.abort()
        this.gif = null
      }
    }
  }
}
