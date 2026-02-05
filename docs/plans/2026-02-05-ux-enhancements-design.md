# UX Enhancements Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add keyboard shortcuts, toast notifications, mobile layout improvements, GIF export, density slider, PWA support, and Open Graph meta tags.

**Architecture:** Incremental additions to existing UI components. New files for toast and GIF export. PWA requires manifest and service worker at root level.

**Tech Stack:** Vanilla JS, gif.js for GIF encoding, Service Worker API for PWA.

---

## 1. Keyboard Shortcuts

**Implementation:** Global keydown listener in `main.js`.

**Keys:**
- Space - Toggle play/pause (video only)
- Left Arrow - Seek backward 5 seconds
- Right Arrow - Seek forward 5 seconds

**Behavior:**
- Only active when video is loaded
- Prevent default browser behavior
- Global listener on `document`

**Code location:** `src/main.js`, near existing event listeners.

---

## 2. Toast Notification

**New file:** `src/ui/toast.js`

**Component:**
```javascript
export class Toast {
  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'toast'
    document.getElementById('app').appendChild(this.element)
  }

  show(message, duration = 2000) {
    this.element.textContent = message
    this.element.classList.add('visible')
    setTimeout(() => this.element.classList.remove('visible'), duration)
  }
}
```

**CSS (in style.css):**
- Fixed position, centered horizontally
- `bottom: 160px` (above controls)
- Fade in/out transition (0.3s)
- Semi-transparent dark background (#333, 90% opacity)
- White text, small font (13px)
- Padding: 8px 16px, border-radius: 4px

**Usage:** Call `toast.show('Copied!')` after clipboard write.

---

## 3. Mobile Layout Reorganization

**Target:** `@media (max-width: 768px)` in `style.css`

**Mode selector changes:**
- Font size: 14px → 16px
- Gap between items: 16px → 20px
- Add padding to mode/toggle items for 44px minimum touch targets
- Vertical stack with clear separation between modes and toggles

**Top buttons (Save, Video, Image):**
- Horizontal row, smaller spacing
- Adequate touch targets maintained

**Video controls:**
- Full width on mobile
- Larger play button (44px touch target)
- Progress bar height increased for easier interaction

**Toast position:**
- Adjust for mobile to avoid overlap with controls

---

## 4. GIF Export

**New dependency:** gif.js (add via npm or CDN)

**New file:** `src/video/GifExporter.js`

**Constraints:**
- Maximum 5 seconds duration
- 10 FPS capture rate
- Medium quality setting

**Export flow:**
1. User selects "Save as GIF" from export menu
2. Capture canvas frames from current position
3. Encode frames using gif.js
4. Download resulting file

**Export menu update (`exportMenu.js`):**
- Add GIF option for video mode
- No SharedArrayBuffer requirement (works everywhere)

**Progress display:**
- "Creating GIF: X%" in video controls status area

---

## 5. Density Slider with Presets

**Range:** 1,000 to 20,000 characters

**Preset values:**
- Minimal: 2,000
- Standard: 5,000
- HD: 12,000

**UI layout:**
```
[Standard] [HD] [Minimal]     <- preset buttons
[==========|====] 8500        <- slider + value
```

**Behavior:**
- Clicking preset sets slider to preset value
- Moving slider updates character count and re-renders
- Highlight preset when slider matches preset value

**Code changes:**
- `modeSelector.js`: Add slider element, `setDensityValue(value)` method
- `main.js`: Update handler to accept numeric values

**CSS:**
- Minimal slider styling (thin track, small thumb)
- Number display in gray (#666)

---

## 6. PWA Support

**New file:** `manifest.json` (project root)
```json
{
  "name": "ASCII Art Installation",
  "short_name": "ASCII Art",
  "description": "Transform images into interactive ASCII art",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafafa",
  "theme_color": "#fafafa",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**New file:** `sw.js` (project root)
- Cache app shell on install (HTML, CSS, JS, fonts)
- Network-first strategy
- Don't cache uploaded media

**index.html changes:**
- Add `<link rel="manifest" href="/manifest.json">`
- Add service worker registration

**Assets needed:**
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

**Vite config:**
- Copy manifest.json and sw.js to build output

---

## 7. Open Graph Meta Tags

**index.html additions:**
```html
<meta property="og:image" content="https://arvid-pku.github.io/image2text/og-preview.png">
<meta property="og:url" content="https://arvid-pku.github.io/image2text/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ASCII Art Installation">
<meta name="twitter:description" content="Transform images into interactive ASCII art">
<meta name="twitter:image" content="https://arvid-pku.github.io/image2text/og-preview.png">
```

**Asset needed:** `og-preview.png`
- Size: 1200x630px
- Content: App screenshot or designed graphic

---

## Implementation Order

1. **Keyboard shortcuts** - Quick win, no new files
2. **Toast notification** - Small addition, enables #3
3. **Open Graph meta tags** - Simple HTML changes
4. **Mobile layout** - CSS only
5. **Density slider** - Moderate complexity
6. **PWA support** - New files, needs icons
7. **GIF export** - Most complex, new dependency

## Assets Required

- `icon-192.png` - PWA icon (192x192)
- `icon-512.png` - PWA icon (512x512)
- `og-preview.png` - Social preview (1200x630)
