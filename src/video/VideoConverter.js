import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null
let loaded = false

export async function convertWebMToMP4(webmBlob, onProgress) {
  // Load ffmpeg if not already loaded
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
    ffmpeg.on('progress', ({ progress }) => {
      if (onProgress) onProgress(progress)
    })
  }

  if (!loaded) {
    if (onProgress) onProgress(0)
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm'
    })
    loaded = true
  }

  // Write input file
  await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob))

  // Convert to MP4
  await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-c:a', 'aac', '-strict', 'experimental', 'output.mp4'])

  // Read output file
  const data = await ffmpeg.readFile('output.mp4')

  // Clean up
  await ffmpeg.deleteFile('input.webm')
  await ffmpeg.deleteFile('output.mp4')

  return new Blob([data.buffer], { type: 'video/mp4' })
}
