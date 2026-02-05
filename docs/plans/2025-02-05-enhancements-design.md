# ASCII Art Installation - Enhancements Design

## Overview

Three new features to make the installation more complete: character set flexibility, shareability, and multi-image support.

## Feature 1: Character Set Toggle (Unicode ↔ ASCII)

### UI

Add toggle to mode selector bar: `Unicode` / `ASCII`
- Default: Unicode (current rich character set)
- Positioned with other toggles (Sound, Color, Drift)

### Character Sets

**Unicode (current):**
```
█▓▒░▄▀■●◐#@%&*+=~-:;'".
```

**ASCII (with letters):**
```
@%#MWNBQODKXYZmwqpdbkhaoeczunxjft|()[]{}!?/\;:,'.
```

Both sets ordered by visual density (weight 1.0 → 0.0).

### Transition Behavior

Per-character fade when toggled:
1. Each character fades out (opacity → 0) over 200ms
2. At 50% opacity, character swaps to equivalent from other set (matched by weight)
3. Character fades back in (opacity → 1) over 200ms
4. Slight position-based stagger for organic feel

Total transition: ~500ms

### Implementation

- Create: `src/converter/charsets.js` - Both character sets with weights
- Modify: `src/converter/characters.js` - Use active charset
- Modify: `src/ui/modeSelector.js` - Add charset toggle
- Modify: `src/main.js` - Handle toggle, trigger transition
- Modify: `src/renderer/index.js` - Add charset transition method

---

## Feature 2: Static Snapshot Export

### UI

Add "Save" text button in top-right corner (near "New"):
```
New    Save
```

On click, show dropdown:
```
Save as PNG
Save as Text
```

Same quiet typography as existing UI. Only visible after image loaded.

### PNG Export

- Render current canvas at 2x resolution for crisp text
- Capture current state: colors, character positions, effects frozen
- Filename: `ascii-art-[timestamp].png`
- Immediate download via anchor element

### Text Export

- Pure text representation of ASCII art
- Characters only, preserving rows and columns
- No colors, no effects
- Filename: `ascii-art-[timestamp].txt`
- Useful for terminals, READMEs, code comments

### Implementation

- Create: `src/ui/exportMenu.js` - Dropdown component
- Modify: `index.html` - Add Save button
- Modify: `src/style.css` - Dropdown styles
- Modify: `src/main.js` - Export functions (PNG via canvas.toDataURL, Text via character grid)

---

## Feature 3: Gallery Carousel

### UI

Navigation appears below canvas when 2+ images loaded:
```
            ● ○ ○ ○
            < 1/4 >
```

- Dots: filled = current image, hollow = others
- Arrows: navigate left/right
- Keyboard: arrow keys also navigate
- Touch: swipe left/right on mobile

### Upload Behavior

"New" button changes:
- First upload: loads image (current behavior)
- Subsequent uploads: adds to gallery
- Maximum: 8 images
- Shift + click "New": clears gallery, starts fresh

### Wave Reveal Transition

When navigating between images:
1. Determine direction (left → right or right → left)
2. Wave sweeps from edge in that direction
3. Column-by-column transition with 20ms stagger per column
4. Each character: fade out (100ms) → swap → fade in (100ms)
5. Total sweep: ~800ms for full canvas width

### Data Model

```js
state.gallery = {
  images: [],        // Array of { asciiData, originalFile }
  currentIndex: 0,
  maxImages: 8,
  transitioning: false
}
```

### Implementation

- Create: `src/ui/carousel.js` - Navigation dots and arrows
- Create: `src/gallery/index.js` - Gallery state management
- Create: `src/effects/waveReveal.js` - Transition effect
- Modify: `src/main.js` - Gallery integration, keyboard/touch navigation
- Modify: `src/style.css` - Carousel styles

---

## UI Layout Summary

**Top bar:**
```
                                    New    Save
```

**Bottom bar (mode selector):**
```
Ripple  Magnetic  Wind  Glitch  Smear  Chaos     Sound  Color  Drift  Unicode
```

**Below canvas (when gallery active):**
```
                        ● ○ ○ ○
                        < 1/4 >
```

---

## Implementation Order

1. **Character Set Toggle** - Foundation change, affects converter
2. **Snapshot Export** - Independent feature, quick win
3. **Gallery Carousel** - Most complex, builds on existing upload flow

---

## Out of Scope

- Video/GIF export (future enhancement)
- Cloud storage / shareable links (requires backend)
- Drag-and-drop reordering of gallery
- Image cropping/editing before conversion
