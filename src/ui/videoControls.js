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
      <span class="video-export-status" style="display: none;">Exporting: 0%</span>
    `
    this.element.style.display = 'none'
    document.getElementById('app').appendChild(this.element)

    this.playBtn = this.element.querySelector('.video-play-btn')
    this.progress = this.element.querySelector('.video-progress')
    this.progressBar = this.element.querySelector('.video-progress-bar')
    this.timeDisplay = this.element.querySelector('.video-time')
    this.exportStatus = this.element.querySelector('.video-export-status')

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

  showExportProgress() {
    this.playBtn.style.display = 'none'
    this.timeDisplay.style.display = 'none'
    this.exportStatus.style.display = 'inline'
    this.exportStatus.textContent = 'Exporting: 0%'
  }

  updateExportProgress(percent) {
    this.exportStatus.textContent = `Exporting: ${percent}%`
    this.progressBar.style.width = `${percent}%`
  }

  hideExportProgress() {
    this.playBtn.style.display = 'flex'
    this.timeDisplay.style.display = 'inline'
    this.exportStatus.style.display = 'none'
  }
}
