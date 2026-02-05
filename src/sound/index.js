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
