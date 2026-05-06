'use client'

// Side-by-side From / To dropdowns. Defaults: PDF for input, UDS for
// output. Auto-disable incompatible To options based on the selected
// From — driven by client-formats.ts SUPPORTED_PAIRS matrix.

import {
  INPUT_FORMATS,
  OUTPUT_FORMATS,
  compatibleOutputs,
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

const sortedInputFormats = [...INPUT_FORMATS].sort((a, b) => {
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

  return (
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
          {sortedOutputFormats.map(f => {
            const code = asOutputFormat(f)
            const enabled = compatible.has(code)
            return (
              <option
                key={code}
                value={code}
                disabled={!enabled}
                title={enabled ? undefined : s.formats.comingSoonTitle}
              >
                {f.label}{f.priority === 0 ? s.formats.defaultSuffix : ''}{!enabled ? s.formats.comingSoonSuffix : ''}
              </option>
            )
          })}
        </select>
      </DropdownColumn>
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
