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
