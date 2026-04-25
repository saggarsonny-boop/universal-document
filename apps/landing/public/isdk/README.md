# Universal Document™ iSDK v1.0

Embed the Universal Document™ Reader in any web application.

## Quick Start

```html
<script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
<link rel="stylesheet" href="https://ud.hive.baby/isdk/ud-isdk.css">

<ud-reader src="/path/to/document.uds"></ud-reader>
```

That's it. The `<ud-reader>` element handles everything: block rendering,
clarity layer switching, language switching, expiry checking, revocation
validation, hash verification, and chain-of-custody display.

## Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `src` | string | URL or path to a .uds or .udr file (loaded on mount) |

## JavaScript API

```js
const reader = document.querySelector('ud-reader')

// Load from URL
reader.load('https://example.com/document.uds')

// Load from File object (e.g. from <input type="file">)
reader.loadFile(file)

// Get document metadata
const meta = reader.getMetadata()
// → { id, title, created_by, created_at, revoked, ... }

// Switch clarity layer
reader.setLayer('patient_summary')

// Listen for events
reader.addEventListener('ud:loaded',  e => console.log('Loaded', e.detail.title))
reader.addEventListener('ud:expired', () => console.warn('Document has expired'))
reader.addEventListener('ud:revoked', () => console.warn('Document has been revoked'))
```

## Drop zone (no src attribute)

If `src` is omitted, the component renders a drop zone. Users can drag
a .uds or .udr file onto it, or click to browse.

```html
<ud-reader></ud-reader>
```

## React

```jsx
import { useEffect, useRef } from 'react'

export default function DocumentView({ url }) {
  const ref = useRef(null)

  useEffect(() => {
    // Import the web component (client-side only)
    import('https://ud.hive.baby/isdk/ud-isdk.js')
  }, [])

  return <ud-reader ref={ref} src={url}></ud-reader>
}
```

## Next.js

```jsx
'use client'
import { useEffect, useRef } from 'react'

export default function UDViewer({ src }) {
  const ref = useRef(null)
  useEffect(() => { import('https://ud.hive.baby/isdk/ud-isdk.js') }, [])
  return <ud-reader ref={ref} src={src}></ud-reader>
}
```

## File handling

```html
<input type="file" accept=".uds,.udr" id="picker">
<ud-reader id="viewer"></ud-reader>

<script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
<script>
  document.getElementById('picker').addEventListener('change', e => {
    const file = e.target.files[0]
    document.getElementById('viewer').loadFile(file)
  })
</script>
```

## CDN

| File | URL |
|------|-----|
| JS | https://ud.hive.baby/isdk/ud-isdk.js |
| CSS | https://ud.hive.baby/isdk/ud-isdk.css |

## What's in this package

- `ud-isdk.js` — The web component (no dependencies, ~12 KB)
- `ud-isdk.css` — Host element styles
- `sample.uds` — A valid sealed Universal Document™ for testing
- `INTEGRATION.md` — Integration guide
- `LICENSE` — Apache 2.0

## Support

- Documentation: https://ud.hive.baby/isdk
- Issues: https://github.com/saggarsonny-boop/universal-document/issues
- Email: hive@hive.baby

Universal Document™ is a pending trademark (Serial 99774346, filed 2026-04-20).
Apache 2.0 — free to use, embed, and redistribute.
