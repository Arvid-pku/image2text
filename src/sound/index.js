export class SoundManager {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.reverbGain = null
    this.enabled = false
    this.initialized = false
    this.lastRippleTime = 0
    this.lastSmearTime = 0
  }

  async init() {
    if (this.initialized) return

    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Master gain
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0

    // Create a simple reverb effect using delays
    this.reverbGain = this.ctx.createGain()
    this.reverbGain.gain.value = 0.3

    const delay1 = this.ctx.createDelay()
    delay1.delayTime.value = 0.1
    const delay2 = this.ctx.createDelay()
    delay2.delayTime.value = 0.2

    const reverbFilter = this.ctx.createBiquadFilter()
    reverbFilter.type = 'lowpass'
    reverbFilter.frequency.value = 2000

    // Reverb chain
    this.reverbGain.connect(delay1)
    delay1.connect(reverbFilter)
    reverbFilter.connect(delay2)
    delay2.connect(this.masterGain)

    this.masterGain.connect(this.ctx.destination)
    this.initialized = true
  }

  enable() {
    if (!this.initialized) this.init()
    this.enabled = true
    this.masterGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 2)
  }

  disable() {
    this.enabled = false
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5)
    }
  }

  playRipple(speed) {
    if (!this.enabled || !this.ctx) return

    // Throttle ripple sounds
    const now = performance.now()
    if (now - this.lastRippleTime < 80) return
    this.lastRippleTime = now

    // Layered harmonics for richer water-like sound
    const baseFreq = 180 + speed * 1.5
    const harmonics = [1, 1.5, 2, 3]
    const volumes = [0.06, 0.03, 0.02, 0.01]

    harmonics.forEach((harmonic, i) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      osc.type = 'sine'
      osc.frequency.value = baseFreq * harmonic

      // Slight pitch drop for water effect
      osc.frequency.linearRampToValueAtTime(
        baseFreq * harmonic * 0.8,
        this.ctx.currentTime + 0.4
      )

      filter.type = 'lowpass'
      filter.frequency.value = 1500 - speed * 3
      filter.Q.value = 2

      gain.gain.value = volumes[i]
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)
      gain.connect(this.reverbGain)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.4)
    })
  }

  playGlitch() {
    if (!this.enabled || !this.ctx) return

    // Layered glitch: filtered noise + pitched crackle
    const bufferSize = this.ctx.sampleRate * 0.15
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // Create more interesting noise pattern
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.ctx.sampleRate
      // Mix white noise with some bit-crushing effect
      const noise = Math.random() * 2 - 1
      const crushed = Math.round(noise * 8) / 8
      data[i] = (noise * 0.3 + crushed * 0.2) * Math.exp(-t * 15)
    }

    const source = this.ctx.createBufferSource()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    const highpass = this.ctx.createBiquadFilter()

    source.buffer = buffer

    filter.type = 'lowpass'
    filter.frequency.value = 3000
    filter.Q.value = 3

    highpass.type = 'highpass'
    highpass.frequency.value = 200

    gain.gain.value = 0.2
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)

    source.connect(highpass)
    highpass.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    gain.connect(this.reverbGain)

    source.start()

    // Add a subtle pitched click
    const click = this.ctx.createOscillator()
    const clickGain = this.ctx.createGain()
    click.type = 'square'
    click.frequency.value = 80
    click.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05)
    clickGain.gain.value = 0.08
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05)
    click.connect(clickGain)
    clickGain.connect(this.masterGain)
    click.start()
    click.stop(this.ctx.currentTime + 0.05)
  }

  playSmear(dx, dy) {
    if (!this.enabled || !this.ctx) return

    // Throttle smear sounds
    const now = performance.now()
    if (now - this.lastSmearTime < 50) return
    this.lastSmearTime = now

    const speed = Math.sqrt(dx * dx + dy * dy)
    if (speed < 2) return

    // Smooth sustained tone with pitch bend
    const osc1 = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    const baseFreq = 120 + Math.abs(dy) * 2

    osc1.type = 'triangle'
    osc1.frequency.value = baseFreq
    osc1.frequency.linearRampToValueAtTime(baseFreq + dx * 0.3, this.ctx.currentTime + 0.25)

    // Add subtle detuned layer
    osc2.type = 'sine'
    osc2.frequency.value = baseFreq * 1.5
    osc2.frequency.linearRampToValueAtTime(baseFreq * 1.5 + dx * 0.2, this.ctx.currentTime + 0.25)

    filter.type = 'lowpass'
    filter.frequency.value = 800 + speed * 20
    filter.Q.value = 4

    gain.gain.value = 0.06
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25)

    const mixer = this.ctx.createGain()
    mixer.gain.value = 0.5

    osc1.connect(filter)
    osc2.connect(mixer)
    mixer.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    gain.connect(this.reverbGain)

    osc1.start()
    osc2.start()
    osc1.stop(this.ctx.currentTime + 0.25)
    osc2.stop(this.ctx.currentTime + 0.25)
  }
}
