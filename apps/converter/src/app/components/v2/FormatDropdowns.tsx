'use client'

// Side-by-side From / To dropdowns. Defaults: PDF for input, UDS for
// output. The To dropdown HIDES output formats that don't have a working
// converter from the selected input — fixes the PR #9 "bait-and-switch"
// where 18 inputs × 13 outputs implied 234 working pairs but only ~30
// were implemented in PR B.
//
// A "Don't see your format? Tell us" mailto link sits below the dropdowns
// so users can register demand for unimplemented pairs without us
// having to advertise them as "coming soon".

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

// Drop inputs that have no supported outputs at all before sorting. The To
// dropdown's filter handles per-input-pair gaps; this handles inputs where
// nothing pairs at all (odt, tsv, yaml, svg). Without this, picking one of
// those leaves the To dropdown on the UDS-only safety fallback and misleads
// the user into thinking it'll work.
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
  // Filter the To dropdown down to actually-supported pairs. UDS is in
  // SUPPORTED_PAIRS for every supported input, so it always survives.
  // If somehow no pair is supported (shouldn't happen with the v1
  // matrix), keep UDS as the safety fallback so the dropdown is never
  // empty.
  const visibleOutputFormats = sortedOutputFormats.filter(f => compatible.has(asOutputFormat(f)))
  const finalOutputs = visibleOutputFormats.length > 0
    ? visibleOutputFormats
    : sortedOutputFormats.filter(f => f.code === 'uds')

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
            {finalOutputs.map(f => {
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

      {/* Demand-capture for unimplemented pairs. PR #11 hid them from the
          dropdown rather than showing them disabled — this link gives
          users a way to register interest without us advertising
          unfinished work. The body pre-fills the user's currently-selected
          From so the recipient can see at a glance which converter pair
          was missed. Subject + body localized via the formats.formatRequest*
          locale keys. */}
      <a
        href={`mailto:hive@hive.baby?subject=${encodeURIComponent(s.formats.formatRequestSubject)}&body=${encodeURIComponent(s.formats.formatRequestBody.replace('{{from}}', inputFormat.toUpperCase()))}`}
        style={requestLinkStyle}
      >
        {s.formats.formatRequestPrompt} {s.formats.formatRequestCta} →
      </a>
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
  minHeight: 48,
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
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='%23${'D4AF37'}' d='M6 8 0 0h12z'/></svg>")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
}

const requestLinkStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  fontSize: 12,
  color: 'var(--ud-muted)',
  textDecoration: 'underline',
  marginTop: 2,
}
