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
