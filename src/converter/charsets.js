// Unicode characters ordered by visual density (darkest to lightest)
export const UNICODE_CHARSET = [
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

// ASCII characters with letters, ordered by visual density
export const ASCII_CHARSET = [
  { char: '@', weight: 1.0 },
  { char: '%', weight: 0.95 },
  { char: '#', weight: 0.9 },
  { char: 'M', weight: 0.85 },
  { char: 'W', weight: 0.82 },
  { char: 'N', weight: 0.78 },
  { char: 'B', weight: 0.75 },
  { char: 'Q', weight: 0.72 },
  { char: 'O', weight: 0.68 },
  { char: 'D', weight: 0.65 },
  { char: 'K', weight: 0.62 },
  { char: 'X', weight: 0.58 },
  { char: 'Y', weight: 0.55 },
  { char: 'Z', weight: 0.52 },
  { char: 'm', weight: 0.48 },
  { char: 'w', weight: 0.45 },
  { char: 'q', weight: 0.42 },
  { char: 'p', weight: 0.4 },
  { char: 'd', weight: 0.38 },
  { char: 'b', weight: 0.36 },
  { char: 'k', weight: 0.34 },
  { char: 'h', weight: 0.32 },
  { char: 'a', weight: 0.3 },
  { char: 'o', weight: 0.28 },
  { char: 'e', weight: 0.26 },
  { char: 'c', weight: 0.24 },
  { char: 'z', weight: 0.22 },
  { char: 'u', weight: 0.2 },
  { char: 'n', weight: 0.18 },
  { char: 'x', weight: 0.16 },
  { char: 'j', weight: 0.14 },
  { char: 'f', weight: 0.12 },
  { char: 't', weight: 0.1 },
  { char: '|', weight: 0.09 },
  { char: '(', weight: 0.08 },
  { char: ')', weight: 0.08 },
  { char: '[', weight: 0.07 },
  { char: ']', weight: 0.07 },
  { char: '{', weight: 0.06 },
  { char: '}', weight: 0.06 },
  { char: '!', weight: 0.05 },
  { char: '?', weight: 0.05 },
  { char: '/', weight: 0.04 },
  { char: '\\', weight: 0.04 },
  { char: ';', weight: 0.03 },
  { char: ':', weight: 0.03 },
  { char: ',', weight: 0.02 },
  { char: '\'', weight: 0.02 },
  { char: '.', weight: 0.01 },
  { char: ' ', weight: 0.0 }
]

// Find equivalent character in target charset by weight
export function findEquivalentChar(weight, targetCharset) {
  let closest = targetCharset[0]
  let minDiff = Math.abs(weight - closest.weight)

  for (const entry of targetCharset) {
    const diff = Math.abs(weight - entry.weight)
    if (diff < minDiff) {
      minDiff = diff
      closest = entry
    }
  }

  return closest.char
}
