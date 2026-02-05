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
