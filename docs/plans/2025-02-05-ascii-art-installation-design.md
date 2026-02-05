# ASCII Art Interactive Installation

A web-based interactive art installation that transforms images into living ASCII art with layered interaction effects.

## Core Concept

The ASCII art is the medium, interaction is the art. Users upload images and play with the resulting text art through physics, transformation, and generative effects. Gallery aesthetic - clean, minimal, typographic.

## Experience Flow

1. User lands on page with a pre-loaded example ASCII art, gently breathing
2. Upload new image via minimal "New" text button (top corner)
3. Image converts to ASCII, types/fades in
4. Art lives and breathes with subtle character cycling
5. User discovers interactions through exploration
6. Mode selector appears after discovery phase

## Visual Design

- Light background (#fafafa), dark text (#1a1a1a)
- Monospace font for ASCII: IBM Plex Mono or JetBrains Mono
- Elegant sans-serif for UI: Inter or Helvetica Neue
- No icons - pure typographic interface
- ASCII art centered with generous whitespace, subtle shadow frame
- Gallery/museum aesthetic throughout

## ASCII Conversion

### Character Set

Unicode extended set for fine gradients:
```
█▓▒░ ▄▀■□▪▫ ●○◐◑ ◢◣◤◥ ╬╫╪ @#$%&*+=~-:;'".
```

Ordered by visual density. Edge detection preserves contours for "fluent" quality.

### Resolution

Default: ~100-120 columns, aspect-ratio preserved rows. Hidden slider for power users to adjust density.

## Interaction Layers

### Layer 1: Generative/Living (Always Active)

Characters subtly cycle between similar-weight alternatives. Wave-like rhythm emanates from image focal points. The art breathes even when untouched.

### Layer 2: Physics (Hover/Touch)

Cursor movement affects nearby characters:
- **Ripple**: Characters displace outward like water, settle back
- **Magnetic**: Attract toward or repel from cursor
- **Wind**: Directional flow following cursor movement

Effect intensity responds to cursor speed.

### Layer 3: Transformation (Click/Tap)

- **Single click**: Local glitch burst, characters scramble then reform
- **Hold**: Characters dissolve/melt downward from press point
- **Double-click**: Invert region (dark/light character swap)

### Layer 4: Game-like (Drag/Gesture)

- **Drag**: Smears characters like wet paint, slowly reconstitute
- **Shake (mobile)**: Scramble entire art, reassembles like puzzle
- **Fling**: Throw section of characters, scatter and return

### Chaos Mode

All effects active simultaneously, interactions blend.

## Special Features

### Color Mode

Toggle on: characters inherit colors from original image regions. ASCII becomes pointillist painting. Pairs with gallery aesthetic.

### Time Drift

Left untouched for minutes, art slowly abstracts - characters wander, density shifts. Return attention and it gradually reconstitutes. Rewards both interaction and observation.

### Sound Design

Organic, ambient, textural. Sound defaults OFF, fades in gently when enabled.

| Effect | Sound |
|--------|-------|
| Living/breathing | Low ambient hum, subtle vinyl crackle |
| Ripple | Soft water-like tones, pitch varies with speed |
| Glitch | Quiet digital clicks, soft static |
| Smear | Sustained tone, pitch-bends with direction |
| Scatter/reform | Light chimes disperse, settling sound returns |
| Time drift | Slow generative ambient tones |

Implementation: Pre-recorded samples (100-300ms) + oscillator synthesis for sustained effects. Volume kept low - texture, not music.

## Progressive Discovery

### Reveal Sequence

1. First 10 seconds: Living animation only. Hint: *"move your cursor"*
2. After hover: Ripple activates. Hint: *"try clicking"*
3. After click: Glitch fires. Hint: *"drag across"*
4. After drag: Smear activates. Mode selector fades in
5. Hints disappear once selector appears

### Mode Selector

Bottom of viewport, minimal text bar:

```
Ripple    Glitch    Smear    Chaos        Sound  Color  Drift
```

- Active mode: subtle underline or bolder weight
- Toggles: dim when off, full contrast when on
- Can minimize to single dot after appearing

## Technical Architecture

### Stack

- Static single-page app
- Vanilla JS or Svelte (minimal bundle, fast load)
- HTML Canvas for ASCII rendering
- Web Audio API for sound
- CSS for UI elements

### Project Structure

```
/src
  /converter     - image to ASCII (brightness mapping, edge detection)
  /renderer      - Canvas character drawing, color mode
  /effects       - physics, transform, generative, game (isolated modules)
  /sound         - audio manager, effect-sound mapping
  /discovery     - user progress tracking, UI reveal
  /ui            - mode selector, upload handler, hints
/assets
  /sounds        - audio samples
  /fonts         - IBM Plex Mono, Inter
```

### Character Model

Each character stored as object:
```js
{
  char: '█',
  x: 100,
  y: 50,
  targetX: 100,
  targetY: 50,
  velocity: { x: 0, y: 0 },
  color: '#1a1a1a',
  originalColor: '#ff5500',
  weight: 0.95
}
```

Every frame: characters ease toward target position. Effects modify targets or velocities. Unified model enables natural effect composition.

### Performance

- Typical render: 80-150 columns × 50-100 rows = 4,000-15,000 characters
- Canvas handles 60fps comfortably
- RequestAnimationFrame loop
- Throttle physics calculations if needed on lower-end devices

### No Backend

All processing client-side. Image never leaves browser. Deployable as static files anywhere (Vercel, Netlify, GitHub Pages).

## Platform Support

### Desktop (Primary)

Full experience with hover states, keyboard shortcuts, large canvas.

### Mobile (Important)

- Touch replaces hover
- Two-finger tap for mode switching
- Device tilt for wind effect
- Shake to scramble
- Responsive canvas sizing

## Initial Example

Landing page shows pre-loaded ASCII art (a compelling portrait or recognizable image) already animating. Demonstrates the "living" quality immediately. Upload replaces it.

## Out of Scope (Future)

- Share as animated GIF/video
- Cursor trail painting
- Collaborative multi-user interaction
- Custom character set upload
- Image history/gallery
