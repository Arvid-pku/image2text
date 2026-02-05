# Video to ASCII Art - Design Document

## Overview

Add support for uploading videos and converting them to ASCII art videos with real-time playback and export capability.

## Requirements

1. Real-time video playback as ASCII art
2. Video export with preserved audio
3. Static ASCII only (no effects during video)

## Architecture

### New Components

- `src/video/VideoProcessor.js` - Core video handling
- `src/video/VideoExporter.js` - Export with MediaRecorder API
- `src/ui/videoControls.js` - Play/pause, progress bar, time display

### Data Flow

1. User uploads video → hidden `<video>` element loads it
2. VideoProcessor extracts frames at native framerate
3. Each frame → canvas → `imageToAscii()` → renderer displays
4. Export: MediaRecorder captures canvas stream + audio track → WebM file

## Component Details

### VideoProcessor

**Responsibilities:**
- Load video into hidden `<video>` element
- Extract frames using `requestVideoFrameCallback()` (fallback: `requestAnimationFrame`)
- Convert each frame via existing `imageToAscii()`
- Handle play/pause/seek

**Performance:**
- Offscreen canvas for frame extraction
- Standard density (~5000 chars) locked for video
- Adaptive framerate (skip frames if slow)
- Pause when tab hidden

### VideoControls UI

**Layout:** Below canvas when video loaded
- Play/Pause button (▶ / ❚❚)
- Progress bar (clickable/draggable)
- Time display (0:00 / 3:45)

**Behavior:**
- Spacebar toggles play/pause
- Auto-hide after 3s, reappear on mouse move
- Mode selector hidden during video

### VideoExporter

**Method:**
- `canvas.captureStream()` for video
- `video.captureStream()` for audio
- MediaRecorder combines both → WebM output

**Settings:**
- Video: 5 Mbps bitrate
- Audio: passthrough
- Resolution: canvas × 2

**Limitation:** Export takes real-time (1 min video = 1 min export)

## Integration

### File Input
- Accept: `image/*,video/*`
- Detect type via MIME, route accordingly

### State
- `state.currentMedia` - 'image' or 'video'
- `state.videoProcessor` - VideoProcessor instance
- `state.videoControls` - VideoControls instance

### Export Menu
- Image: PNG, Text, Copy
- Video: Save as Video (WebM)

### Error Handling
- Unsupported format: alert
- >100MB: performance warning
- Export fail: error message + retry
