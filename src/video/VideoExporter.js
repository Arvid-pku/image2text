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
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm'

      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
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
