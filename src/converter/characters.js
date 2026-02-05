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
