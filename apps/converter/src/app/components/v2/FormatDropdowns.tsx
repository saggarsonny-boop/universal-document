'use client'

// Side-by-side From / To dropdowns. Defaults: PDF for input, UDS for
// output. Auto-disable incompatible To options based on the selected
// From — driven by client-formats.ts SUPPORTED_PAIRS matrix.

import {
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  compatibleOutputs,
  isInputSupported,
  type ClientInputFormat,
  type ClientOutputFormat,
  type FormatMeta,
} from '@/lib/client-formats'
import { useStrings } from '@/lib/strings'

// Local narrowing helpers: FormatMeta.code is a wide union (input | output);
// when iterating INPUT_FORMATS / OUTPUT_FORMATS we know which side we're on.
function asInputFormat(f: FormatMeta): ClientInputFormat { return f.code as ClientInputFormat }
function asOutputFormat(f: FormatMeta): ClientOutputFormat { return f.code as ClientOutputFormat }

const GOLD = '#D4AF37'

type Props = {
  inputFormat: ClientInputFormat
  outputFormat: ClientOutputFormat
  onInputChange: (fmt: ClientInputFormat) => void
  onOutputChange: (fmt: ClientOutputFormat) => void
  disabled?: boolean
}

// Filter to formats the converter actually implements before sorting.
// `INPUT_FORMATS` lists every format the UI is wired to recognise (incl.
// future-ready labels); we only show the ones with at least one working
// pair, so the user never picks a From and finds an empty To dropdown.
const sortedInputFormats = [...INPUT_FORMATS]
  .filter(f => isInputSupported(f.code as ClientInputFormat))
  .sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.label.localeCompare(b.label)
  })
const sortedOutputFormats = [...OUTPUT_FORMATS].sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority
  return a.label.localeCompare(b.label)
})

export function FormatDropdowns({
  inputFormat, outputFormat,
  onInputChange, onOutputChange,
  disabled = false,
}: Props) {
  const s = useStrings()
  const compatible = compatibleOutputs(inputFormat)

  // mailto: surface for capturing v2 demand. The body pre-fills the
  // user's currently-selected From so the recipient can quickly see
  // which converter pair was missed. No JS — pure mailto link, works
  // offline, no privacy footprint beyond what the user's mail client
  // already does.
  const mailtoHref =
    `mailto:hive@hive.baby` +
    `?subject=${encodeURIComponent(s.formats.formatRequestSubject)}` +
    `&body=${encodeURIComponent(s.formats.formatRequestBody.replace('{{from}}', inputFormat.toUpperCase()))}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      alignItems: 'flex-end',
    }}>
      <DropdownColumn label={s.formats.fromLabel} htmlFor="from-select">
        <select
          id="from-select"
          value={inputFormat}
          onChange={(e) => onInputChange(e.target.value as ClientInputFormat)}
          disabled={disabled}
          style={selectStyle}
          aria-label={s.formats.fromAria}
        >
          {sortedInputFormats.map(f => (
            <option key={f.code} value={asInputFormat(f)}>
              {f.label}{f.priority === 0 ? s.formats.defaultSuffix : ''}
            </option>
          ))}
          {/* Always allow 'unknown' — when auto-detect fails, the user can still pick a real format manually */}
        </select>
      </DropdownColumn>

      <div aria-hidden="true" style={{
        fontSize: 24,
        color: GOLD,
        alignSelf: 'center',
        marginBottom: 6,
      }}>→</div>

      <DropdownColumn label={s.formats.toLabel} htmlFor="to-select">
        <select
          id="to-select"
          value={outputFormat}
          onChange={(e) => onOutputChange(e.target.value as ClientOutputFormat)}
          disabled={disabled}
          style={selectStyle}
          aria-label={s.formats.toAria}
        >
          {sortedOutputFormats
            // Hide pairs the converter doesn't implement. The previous
            // disabled-with-tooltip pattern advertised every output format
            // for every input — but PR B only built ~25 of the 18×13
            // matrix, so most were dead-end "coming soon" entries.
            .filter(f => compatible.has(asOutputFormat(f)))
            .map(f => {
              const code = asOutputFormat(f)
              return (
                <option key={code} value={code}>
                  {f.label}{f.priority === 0 ? s.formats.defaultSuffix : ''}
                </option>
              )
            })}
        </select>
      </DropdownColumn>
    </div>

    {/* Format-request affordance — captures demand for missing converter
        pairs without committing the engine to surface every option as a
        dead-end "coming soon" entry. */}
    <div style={{ fontSize: 12, color: 'var(--ud-muted)', textAlign: 'right' }}>
      <span>{s.formats.formatRequestPrompt}</span>{' '}
      <a
        href={mailtoHref}
        style={{ color: 'var(--ud-teal, #0a7a6a)', textDecoration: 'none', fontWeight: 600 }}
      >
        {s.formats.formatRequestCta} →
      </a>
    </div>
    </div>
  )
}

function DropdownColumn({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 140px', minWidth: 140 }}>
      <label htmlFor={htmlFor} style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--ud-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 48,  // touch target floor
  padding: '10px 14px',
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ud-ink)',
  background: '#fff',
  border: '1px solid var(--ud-border)',
  borderRadius: 10,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  // Inline arrow so the dropdown looks like a dropdown without a CSS file.
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23${'D4AF37'}' d='M6 8 0 0h12z'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
}
