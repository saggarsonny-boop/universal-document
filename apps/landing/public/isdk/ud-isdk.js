/**
 * Universal Document™ iSDK v1.0
 * Embeddable <ud-reader> web component
 * https://ud.hive.baby/isdk
 * License: Apache 2.0
 */

// ─── Validation ──────────────────────────────────────────────────────────────

function validateDoc(data) {
  const errors = []
  if (!data || typeof data !== 'object') return { valid: false, errors: ['Not a valid JSON object'] }
  if (!data.ud_version) errors.push('Missing ud_version')
  if (!['UDS', 'UDR'].includes(data.state)) errors.push('state must be UDS or UDR')
  if (!data.metadata?.id) errors.push('Missing metadata.id')
  if (!data.metadata?.title) errors.push('Missing metadata.title')
  if (!Array.isArray(data.blocks)) errors.push('blocks must be an array')
  if (data.state === 'UDS' && !data.seal) errors.push('UDS document missing seal')
  return { valid: errors.length === 0, errors }
}

function checkExpiry(doc) {
  if (!doc.metadata?.expiry) return false
  return new Date() > new Date(doc.metadata.expiry)
}

function checkRevoked(doc) {
  return doc.metadata?.revoked === true
}

async function verifyHash(doc) {
  if (!doc.seal?.hash || !doc.blocks) return 'unverified'
  try {
    const serialized = JSON.stringify(doc.blocks)
    const encoded = new TextEncoder().encode(serialized)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return hashHex === doc.seal.hash ? 'intact' : 'modified'
  } catch {
    return 'unverified'
  }
}

function resolveBlock(block, activeLayer, activeLang) {
  if (block.clarity?.[activeLayer]?.[activeLang]) return block.clarity[activeLayer][activeLang]
  if (block.clarity?.['default']?.[activeLang]) return block.clarity['default'][activeLang]
  if (block.translations?.[activeLang]) return block.translations[activeLang]
  return block.base_content?.text ?? ''
}

// ─── Block Renderers ─────────────────────────────────────────────────────────

function renderBlock(block, activeLayer, activeLang, dir) {
  if (block.hidden) return ''
  const resolved = resolveBlock(block, activeLayer, activeLang)
  const base = block.base_content || {}
  const dirAttr = dir === 'rtl' ? 'rtl' : 'ltr'

  switch (block.type) {
    case 'heading': {
      const level = typeof base.level === 'number' ? Math.min(Math.max(base.level, 1), 6) : 2
      const text = esc(resolved || String(base.text || ''))
      const sizes = { 1: '2rem', 2: '1.5rem', 3: '1.25rem', 4: '1.1rem', 5: '1rem', 6: '0.9rem' }
      return `<div class="ud-heading ud-h${level}" dir="${dirAttr}" style="font-size:${sizes[level]}">${text}</div>`
    }
    case 'paragraph': {
      const text = esc(resolved || String(base.text || ''))
      return `<p class="ud-paragraph" dir="${dirAttr}">${text}</p>`
    }
    case 'list': {
      const items = Array.isArray(base.items) ? base.items : []
      const tag = base.ordered ? 'ol' : 'ul'
      const lis = items.map(item => `<li>${esc(String(item))}</li>`).join('')
      return `<${tag} class="ud-list" dir="${dirAttr}">${lis}</${tag}>`
    }
    case 'table': {
      const headers = Array.isArray(base.headers) ? base.headers : []
      const rows = Array.isArray(base.rows) ? base.rows : []
      const thead = headers.length
        ? `<thead><tr>${headers.map(h => `<th>${esc(String(h))}</th>`).join('')}</tr></thead>`
        : ''
      const tbody = `<tbody>${rows.map(row =>
        `<tr>${(Array.isArray(row) ? row : []).map(cell => `<td>${esc(String(cell))}</td>`).join('')}</tr>`
      ).join('')}</tbody>`
      return `<div class="ud-table-wrap"><table class="ud-table">${thead}${tbody}</table></div>`
    }
    case 'image': {
      const src = esc(String(base.src || ''))
      const alt = esc(String(base.alt || ''))
      const caption = base.caption ? `<figcaption class="ud-caption">${esc(String(base.caption))}</figcaption>` : ''
      return `<figure class="ud-figure"><img src="${src}" alt="${alt}" class="ud-image">${caption}</figure>`
    }
    case 'code': {
      const code = esc(String(base.code || ''))
      const lang = base.language ? `<div class="ud-code-lang">${esc(String(base.language))}</div>` : ''
      return `<div class="ud-code-wrap">${lang}<pre class="ud-pre"><code>${code}</code></pre></div>`
    }
    case 'divider':
      return `<hr class="ud-divider">`
    default:
      return `<div class="ud-unknown">Unsupported block: ${esc(String(block.type))}</div>`
  }
}

function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  :host { display: block; font-family: system-ui, -apple-system, sans-serif; color: #111827; }
  * { box-sizing: border-box; }

  .ud-shell { max-width: 780px; margin: 0 auto; padding: 1.5rem; }

  /* Status bar */
  .ud-status { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .ud-badge { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.02em; }
  .ud-badge-uds { background: #1e2d3d; color: #fff; }
  .ud-badge-udr { background: #bfdbfe; color: #1e40af; }
  .ud-badge-type { background: #f3f4f6; color: #374151; }
  .ud-badge-intact { background: #d1fae5; color: #065f46; }
  .ud-badge-modified { background: #fee2e2; color: #991b1b; }
  .ud-badge-unverified { background: #f3f4f6; color: #6b7280; }
  .ud-badge-expired { background: #fef3c7; color: #92400e; }
  .ud-badge-revoked { background: #fee2e2; color: #991b1b; }

  /* Header */
  .ud-header { padding-bottom: 1.25rem; border-bottom: 2px solid #e5e7eb; margin-bottom: 1.5rem; }
  .ud-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0.4rem 0 0.5rem; line-height: 1.25; }
  .ud-meta { font-size: 0.85rem; color: #6b7280; display: flex; gap: 1.25rem; flex-wrap: wrap; align-items: center; }
  .ud-save-btn { background: none; border: 1px solid #e5e7eb; border-radius: 0.4rem; padding: 0.2rem 0.6rem; font-size: 0.78rem; color: #6b7280; cursor: pointer; font-family: inherit; }
  .ud-save-btn:hover { border-color: #9ca3af; color: #374151; }

  /* Alerts */
  .ud-alert { padding: 1rem 1.25rem; border-radius: 0.75rem; margin-bottom: 1rem; font-weight: 600; }
  .ud-alert-expired { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
  .ud-alert-revoked { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

  /* Controls */
  .ud-controls { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; padding: 0.85rem 1rem; background: #f9fafb; border-radius: 0.75rem; border: 1px solid #e5e7eb; }
  .ud-ctrl-group { display: flex; align-items: center; gap: 0.5rem; }
  .ud-ctrl-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .ud-ctrl-btn { padding: 0.28rem 0.65rem; border-radius: 999px; border: 2px solid #e5e7eb; background: #fff; color: #374151; font-size: 0.8rem; cursor: pointer; font-family: inherit; transition: all 0.12s; }
  .ud-ctrl-btn.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; font-weight: 600; }

  /* Blocks */
  .ud-blocks { line-height: 1.7; }
  .ud-heading { font-weight: 700; color: #111827; margin: 1.5rem 0 0.75rem; line-height: 1.3; }
  .ud-h1 { font-size: 2rem; }
  .ud-h2 { font-size: 1.5rem; }
  .ud-h3 { font-size: 1.25rem; }
  .ud-h4 { font-size: 1.1rem; }
  .ud-paragraph { margin: 0.75rem 0; line-height: 1.7; color: #374151; }
  .ud-list { margin: 0.75rem 0; padding-inline-start: 1.5rem; color: #374151; }
  .ud-list li { margin: 0.25rem 0; }
  .ud-table-wrap { overflow-x: auto; margin: 1rem 0; }
  .ud-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .ud-table th { background: #f3f4f6; padding: 0.6rem 0.75rem; border: 1px solid #e5e7eb; font-weight: 600; text-align: left; }
  .ud-table td { padding: 0.6rem 0.75rem; border: 1px solid #e5e7eb; color: #374151; }
  .ud-figure { margin: 1.5rem 0; text-align: center; }
  .ud-image { max-width: 100%; border-radius: 0.5rem; }
  .ud-caption { margin-top: 0.5rem; font-size: 0.85rem; color: #6b7280; }
  .ud-code-wrap { margin: 1rem 0; }
  .ud-code-lang { background: #1f2937; color: #9ca3af; font-size: 0.75rem; padding: 0.4rem 1rem; border-radius: 0.5rem 0.5rem 0 0; font-family: monospace; }
  .ud-pre { background: #111827; color: #f9fafb; padding: 1rem; overflow-x: auto; border-radius: 0 0 0.5rem 0.5rem; font-size: 0.875rem; font-family: monospace; line-height: 1.6; margin: 0; }
  .ud-code-wrap:not(:has(.ud-code-lang)) .ud-pre { border-radius: 0.5rem; }
  .ud-divider { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  .ud-unknown { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 0.5rem; padding: 0.75rem 1rem; margin: 0.75rem 0; font-size: 0.875rem; color: #92400e; }

  /* Chain of custody */
  .ud-chain { margin-top: 2.5rem; border-top: 1px solid #e5e7eb; padding-top: 1.25rem; }
  .ud-chain-toggle { background: none; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; color: #6b7280; padding: 0; font-family: inherit; display: flex; align-items: center; gap: 0.4rem; }
  .ud-chain-toggle:hover { color: #374151; }
  .ud-chain-list { margin-top: 0.75rem; }
  .ud-chain-entry { display: flex; gap: 1rem; align-items: baseline; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.84rem; flex-wrap: wrap; }
  .ud-chain-event { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 999px; background: #f3f4f6; color: #374151; font-size: 0.72rem; font-weight: 600; }
  .ud-chain-actor { color: #374151; }
  .ud-chain-time { color: #9ca3af; margin-inline-start: auto; white-space: nowrap; }
  .ud-chain-note { color: #6b7280; font-size: 0.8rem; width: 100%; }
  .ud-hash { margin-top: 0.75rem; font-size: 0.75rem; color: #9ca3af; font-family: monospace; word-break: break-all; }

  /* Footer */
  .ud-footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; font-size: 0.72rem; color: #d1d5db; text-align: center; }

  /* Loading / error */
  .ud-loading { padding: 2rem; text-align: center; color: #6b7280; font-size: 0.95rem; }
  .ud-error { padding: 1.25rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.75rem; color: #991b1b; font-size: 0.9rem; }
  .ud-error strong { display: block; margin-bottom: 0.4rem; }

  /* Drop zone */
  .ud-drop { border: 2px dashed #e5e7eb; border-radius: 0.75rem; padding: 2.5rem; text-align: center; cursor: pointer; transition: all 0.15s; color: #6b7280; font-size: 0.9rem; }
  .ud-drop:hover, .ud-drop.drag-over { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
  .ud-drop input { display: none; }
`

// ─── Web Component ────────────────────────────────────────────────────────────

class UDReader extends HTMLElement {
  static get observedAttributes() { return ['src', 'theme'] }

  constructor() {
    super()
    this._shadow = this.attachShadow({ mode: 'open' })
    this._doc = null
    this._activeLayer = 'default'
    this._activeLang = 'en'
    this._showChain = false
    this._hashStatus = 'unverified'
  }

  connectedCallback() {
    this._render()
    const src = this.getAttribute('src')
    if (src) this.load(src)
  }

  attributeChangedCallback(name, _old, newVal) {
    if (name === 'src' && newVal && this.isConnected) this.load(newVal)
  }

  // Public API

  async load(url) {
    this._setState('loading')
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      this._open(data)
    } catch (e) {
      this._setState('error', `Could not load document from URL. ${e.message}`)
    }
  }

  loadFile(file) {
    if (!file) return
    this._setState('loading')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        this._open(data)
      } catch {
        this._setState('error', 'Could not parse file. Make sure it is a valid .uds or .udr file.')
      }
    }
    reader.readAsText(file)
  }

  getMetadata() {
    return this._doc ? { ...this._doc.metadata } : null
  }

  setLayer(layerId) {
    this._activeLayer = layerId
    this._renderDoc()
  }

  // Private

  async _open(data) {
    const { valid, errors } = validateDoc(data)
    if (!valid) {
      this._setState('error', errors.join(' · '))
      return
    }
    this._doc = data
    this._activeLang = data.manifest?.base_language || 'en'
    this._activeLayer = data.manifest?.clarity_layer_manifest?.[0]?.id || 'default'
    this._hashStatus = 'unverified'
    this._showChain = false
    verifyHash(data).then(status => {
      this._hashStatus = status
      this._renderDoc()
    })
    this._renderDoc()
    this.dispatchEvent(new CustomEvent('ud:loaded', { detail: data.metadata, bubbles: true }))
    if (checkExpiry(data)) this.dispatchEvent(new CustomEvent('ud:expired', { bubbles: true }))
    if (checkRevoked(data)) this.dispatchEvent(new CustomEvent('ud:revoked', { bubbles: true }))
  }

  _setState(state, message) {
    const s = this._shadow
    if (state === 'idle') {
      s.innerHTML = `<style>${STYLES}</style><div class="ud-shell">${this._renderDropZone()}</div>`
      this._bindDropZone()
    } else if (state === 'loading') {
      s.innerHTML = `<style>${STYLES}</style><div class="ud-shell"><div class="ud-loading">Loading document…</div></div>`
    } else if (state === 'error') {
      s.innerHTML = `<style>${STYLES}</style><div class="ud-shell"><div class="ud-error"><strong>Could not open document</strong>${esc(message || '')}</div></div>`
    }
  }

  _render() {
    if (this._doc) {
      this._renderDoc()
    } else {
      this._setState('idle')
    }
  }

  _renderDoc() {
    if (!this._doc) return
    const doc = this._doc
    const meta = doc.metadata
    const manifest = doc.manifest || {}
    const layers = manifest.clarity_layer_manifest || []
    const languages = manifest.language_manifest || []
    const seal = doc.seal
    const isExpired = checkExpiry(doc)
    const isRevoked = checkRevoked(doc)
    const dir = languages.find(l => l.code === this._activeLang)?.direction || 'ltr'

    // State badge
    const stateBadge = doc.state === 'UDS'
      ? `<span class="ud-badge ud-badge-uds">UDS</span>`
      : `<span class="ud-badge ud-badge-udr">UDR</span>`

    const typeBadge = meta.document_type
      ? `<span class="ud-badge ud-badge-type">${esc(meta.document_type)}</span>`
      : ''

    const hashBadge = doc.state === 'UDS' ? (() => {
      const cls = `ud-badge ud-badge-${this._hashStatus}`
      const label = this._hashStatus === 'intact' ? '✓ Intact' : this._hashStatus === 'modified' ? '⚠ Modified' : '· Unverified'
      return `<span class="${cls}">${label}</span>`
    })() : ''

    const expiredBadge = isExpired ? `<span class="ud-badge ud-badge-expired">Expired</span>` : ''
    const revokedBadge = isRevoked ? `<span class="ud-badge ud-badge-revoked">Revoked</span>` : ''

    // Alerts
    const alerts = [
      isRevoked ? `<div class="ud-alert ud-alert-revoked">This document has been revoked and should not be relied upon.</div>` : '',
      isExpired ? `<div class="ud-alert ud-alert-expired">This document expired on ${new Date(meta.expiry).toLocaleDateString()} and may no longer be current.</div>` : '',
    ].join('')

    // Save button
    const ext = doc.state === 'UDS' ? 'uds' : 'udr'
    const saveBtn = `<button class="ud-save-btn" data-action="save">Save as .${ext} ↓</button>`

    // Meta line
    const metaItems = [
      `Created by <strong>${esc(meta.created_by)}</strong>`,
      meta.organisation && meta.organisation !== meta.created_by ? esc(meta.organisation) : '',
      new Date(meta.created_at).toLocaleDateString(),
      meta.expiry && !isExpired ? `Expires ${new Date(meta.expiry).toLocaleDateString()}` : '',
    ].filter(Boolean).map(s => `<span>${s}</span>`).join('')

    // Controls (language + layer switcher)
    const langButtons = languages.length > 1
      ? `<div class="ud-ctrl-group">
          <span class="ud-ctrl-label">Language</span>
          ${languages.map(l => `<button class="ud-ctrl-btn${this._activeLang === l.code ? ' active' : ''}" data-lang="${esc(l.code)}">${esc(l.label)}</button>`).join('')}
        </div>`
      : ''

    const layerButtons = layers.length > 0
      ? `<div class="ud-ctrl-group">
          <span class="ud-ctrl-label">View</span>
          ${layers.map(l => `<button class="ud-ctrl-btn${this._activeLayer === l.id ? ' active' : ''}" data-layer="${esc(l.id)}">${esc(l.label)}</button>`).join('')}
        </div>`
      : ''

    const controls = (langButtons || layerButtons)
      ? `<div class="ud-controls">${langButtons}${layerButtons}</div>`
      : ''

    // Blocks
    const blocksHtml = doc.blocks
      .map(b => renderBlock(b, this._activeLayer, this._activeLang, dir))
      .join('')

    // Chain of custody
    let chainHtml = ''
    if (seal?.chain_of_custody?.length) {
      const entries = this._showChain
        ? seal.chain_of_custody.map(e => `
            <div class="ud-chain-entry">
              <span class="ud-chain-event">${esc(e.event)}</span>
              <span class="ud-chain-actor">${esc(e.actor)}</span>
              <span class="ud-chain-time">${new Date(e.timestamp).toLocaleString()}</span>
              ${e.note ? `<span class="ud-chain-note">${esc(e.note)}</span>` : ''}
            </div>`).join('') + `<div class="ud-hash">SHA-256: ${esc(seal.hash)}</div>`
        : ''

      chainHtml = `
        <div class="ud-chain">
          <button class="ud-chain-toggle" data-action="toggle-chain">
            ${this._showChain ? '▾' : '▸'} Chain of Custody (${seal.chain_of_custody.length} events)
          </button>
          ${this._showChain ? `<div class="ud-chain-list">${entries}</div>` : ''}
        </div>`
    }

    const html = `
      <style>${STYLES}</style>
      <div class="ud-shell">
        <div class="ud-header">
          <div class="ud-status">
            ${stateBadge}${typeBadge}${hashBadge}${expiredBadge}${revokedBadge}
          </div>
          <div class="ud-title">${esc(meta.title)}</div>
          <div class="ud-meta">
            ${metaItems}
            ${saveBtn}
          </div>
        </div>
        ${alerts}
        ${controls}
        <div class="ud-blocks">${blocksHtml}</div>
        ${chainHtml}
        <div class="ud-footer">Universal Document™ v${esc(doc.ud_version)} · iSDK v1.0 · <a href="https://ud.hive.baby" target="_blank" style="color:inherit">ud.hive.baby</a></div>
      </div>`

    this._shadow.innerHTML = html
    this._bindEvents()
  }

  _renderDropZone() {
    return `
      <div class="ud-drop" id="ud-drop">
        <div style="font-size:2rem;margin-bottom:0.5rem">📄</div>
        <div style="font-weight:600;margin-bottom:0.25rem">Drop a .uds or .udr file here</div>
        <div style="font-size:0.85rem">or click to browse</div>
        <input type="file" accept=".uds,.udr,.json" id="ud-file-input">
      </div>`
  }

  _bindDropZone() {
    const s = this._shadow
    const drop = s.getElementById('ud-drop')
    const input = s.getElementById('ud-file-input')
    if (!drop || !input) return

    drop.addEventListener('click', () => input.click())
    input.addEventListener('change', e => {
      const file = e.target.files?.[0]
      if (file) this.loadFile(file)
    })
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over') })
    drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'))
    drop.addEventListener('drop', e => {
      e.preventDefault()
      drop.classList.remove('drag-over')
      const file = e.dataTransfer.files?.[0]
      if (file) this.loadFile(file)
    })
  }

  _bindEvents() {
    const s = this._shadow

    // Language buttons
    s.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeLang = btn.dataset.lang
        this._renderDoc()
      })
    })

    // Layer buttons
    s.querySelectorAll('[data-layer]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._activeLayer = btn.dataset.layer
        this._renderDoc()
      })
    })

    // Save button
    s.querySelector('[data-action="save"]')?.addEventListener('click', () => {
      const ext = this._doc.state === 'UDS' ? 'uds' : 'udr'
      const blob = new Blob([JSON.stringify(this._doc, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(this._doc.metadata.title || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    })

    // Chain of custody toggle
    s.querySelector('[data-action="toggle-chain"]')?.addEventListener('click', () => {
      this._showChain = !this._showChain
      this._renderDoc()
    })
  }
}

customElements.define('ud-reader', UDReader)
