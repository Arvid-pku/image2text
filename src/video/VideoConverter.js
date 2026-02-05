import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpeg = null
let loaded = false
let loading = false

export async function convertWebMToMP4(webmBlob, onProgress) {
  // Load ffmpeg if not already loaded
  if (!ffmpeg) {
    ffmpeg = new FFmpeg()
    ffmpeg.on('log', ({ message }) => {
      console.log('[ffmpeg]', message)
    })
    ffmpeg.on('progress', ({ progress }) => {
      console.log('[ffmpeg] progress:', progress)
      if (onProgress) onProgress(progress)
    })
  }

  if (!loaded && !loading) {
    loading = true
    if (onProgress) onProgress(0)
    console.log('[ffmpeg] Loading ffmpeg.wasm...')

    try {
      // Try multi-threaded first (faster), fall back to single-threaded
      const multiThreaded = typeof SharedArrayBuffer !== 'undefined'
      console.log('[ffmpeg] SharedArrayBuffer available:', multiThreaded)

      if (multiThreaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        })
      } else {
        // Single-threaded version for environments without SharedArrayBuffer
        const baseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        })
      }

      loaded = true
      console.log('[ffmpeg] Loaded successfully')
    } catch (err) {
      loading = false
      console.error('[ffmpeg] Failed to load:', err)
      throw new Error('Failed to load video converter. Please try WebM format instead.')
    }
  }

  // Wait if another call is loading
  while (loading && !loaded) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  try {
    console.log('[ffmpeg] Writing input file, size:', webmBlob.size)

    // Write input file
    const inputData = await fetchFile(webmBlob)
    await ffmpeg.writeFile('input.webm', inputData)

    console.log('[ffmpeg] Starting conversion...')

    // Convert to MP4 with more compatible settings
    const result = await ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      'output.mp4'
    ])

    console.log('[ffmpeg] Conversion result:', result)

    // Read output file
    const data = await ffmpeg.readFile('output.mp4')
    console.log('[ffmpeg] Output file size:', data.length)

    // Clean up
    await ffmpeg.deleteFile('input.webm')
    await ffmpeg.deleteFile('output.mp4')

    if (data.length === 0) {
      throw new Error('Conversion produced empty file')
    }

    return new Blob([data], { type: 'video/mp4' })
  } catch (err) {
    console.error('[ffmpeg] Conversion error:', err)
    throw err
  }
}
