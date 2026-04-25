# iSDK Integration Guide

## Minimal embed

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://ud.hive.baby/isdk/ud-isdk.css">
</head>
<body>
  <ud-reader src="/documents/report.uds"></ud-reader>
  <script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
</body>
</html>
```

## Card layout

```html
<ud-reader class="ud-card" src="/report.uds"></ud-reader>
```

## File picker integration

```html
<input type="file" accept=".uds,.udr" id="picker">
<ud-reader id="viewer"></ud-reader>

<script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
<script>
  document.getElementById('picker').addEventListener('change', e => {
    document.getElementById('viewer').loadFile(e.target.files[0])
  })
</script>
```

## Drag and drop (no src)

```html
<!-- Drop zone rendered automatically when src is absent -->
<ud-reader></ud-reader>
<script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
```

## Events

```js
const reader = document.querySelector('ud-reader')

reader.addEventListener('ud:loaded', ({ detail }) => {
  console.log('Document loaded:', detail.title)
  console.log('State:', detail.state) // 'UDS' or 'UDR'
})

reader.addEventListener('ud:expired', () => {
  console.warn('Document has expired')
})

reader.addEventListener('ud:revoked', () => {
  console.warn('Document has been revoked — do not rely on its contents')
})
```

## Next.js (App Router)

```tsx
'use client'
import { useEffect, useRef } from 'react'

export default function UDViewer({ src }: { src: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    import('https://ud.hive.baby/isdk/ud-isdk.js' as string)
  }, [])

  return (
    <ud-reader
      ref={ref as React.RefObject<HTMLElement>}
      src={src}
    />
  )
}

// In tsconfig.json, add:
// "types": ["@types/react", "./types/ud-isdk"]

// Create types/ud-isdk.d.ts:
declare namespace JSX {
  interface IntrinsicElements {
    'ud-reader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string
    }
  }
}
```

## Vue 3

```vue
<template>
  <ud-reader :src="documentUrl"></ud-reader>
</template>

<script setup>
import { onMounted } from 'vue'

const documentUrl = '/documents/report.uds'

onMounted(() => {
  import('https://ud.hive.baby/isdk/ud-isdk.js')
})
</script>
```

## Svelte

```svelte
<script>
  import { onMount } from 'svelte'
  export let src = ''
  onMount(() => import('https://ud.hive.baby/isdk/ud-isdk.js'))
</script>

<ud-reader {src}></ud-reader>
```

## Support

Documentation: https://ud.hive.baby/isdk
Email: hive@hive.baby
