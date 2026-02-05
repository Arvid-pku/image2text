console.log('ASCII Art Installation loading...')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

canvas.width = 800
canvas.height = 600

ctx.fillStyle = '#1a1a1a'
ctx.font = '14px "IBM Plex Mono"'
ctx.fillText('Upload an image to begin', 300, 300)
