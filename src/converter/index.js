import { getCharForBrightness } from './characters.js'

export function imageToAscii(imageData, cols = 100) {
  const { width, height, data } = imageData

  // Calculate cell size and rows to maintain aspect ratio
  // Characters are typically ~2x taller than wide, so adjust
  const cellWidth = width / cols
  const cellHeight = cellWidth * 2
  const rows = Math.floor(height / cellHeight)

  const characters = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Sample center of cell
      const x = Math.floor(col * cellWidth + cellWidth / 2)
      const y = Math.floor(row * cellHeight + cellHeight / 2)

      // Get pixel data (RGBA)
      const idx = (y * width + x) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]

      // Calculate brightness (luminance formula)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b

      // Get character for brightness
      const charData = getCharForBrightness(brightness)

      characters.push({
        char: charData.char,
        weight: charData.weight,
        col,
        row,
        // Store original color for color mode
        originalColor: `rgb(${r}, ${g}, ${b})`
      })
    }
  }

  return { characters, cols, rows }
}

// Load image from file and get ImageData
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, img.width, img.height)
      URL.revokeObjectURL(url)

      resolve(imageData)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
