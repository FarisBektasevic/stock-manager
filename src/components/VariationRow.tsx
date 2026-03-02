import type { VariationRow as VariationRowType } from '../types'

interface VariationRowProps {
  row: VariationRowType
  onChange: (sku: string, value: string) => void
  onToggle: (sku: string, selected: boolean) => void
  disabled: boolean
}

export function VariationRow({ row, onChange, onToggle, disabled }: VariationRowProps) {
  const isTracked = row.stock_quantity !== null
  const willUpdate = row.selected && row.inputValue !== ''

  let rowClass = 'variation-row'
  if (row.status === 'success') rowClass += ' variation-row--success'
  if (row.status === 'error') rowClass += ' variation-row--error'
  if (willUpdate && row.status === 'idle') rowClass += ' variation-row--changed'

  return (
    <div className={rowClass}>
      <div className="variation-row__info">
        <span className="variation-row__name">{row.name}</span>
        <span className="variation-row__sku">{row.sku}</span>
      </div>
      <div className="variation-row__controls">
        <span className="variation-row__current">
          TRENUTNO: <strong>{isTracked ? row.stock_quantity : '—'}</strong>
        </span>
        <input
          className="variation-row__input"
          type="number"
          min="0"
          value={row.inputValue}
          onChange={(e) => onChange(row.sku, e.target.value)}
          disabled={disabled || !isTracked}
          placeholder="—"
        />
        <span className="variation-row__status">
          {row.status === 'success' && '✓ OK'}
          {row.status === 'error' && `✗ ${row.statusMessage ?? 'Greška'}`}
        </span>
        <button
          className={`variation-row__toggle ${row.selected ? 'variation-row__toggle--on' : 'variation-row__toggle--off'}`}
          onClick={() => onToggle(row.sku, !row.selected)}
          disabled={disabled || !isTracked}
          title={row.selected ? 'Ukloni iz liste za ažuriranje' : 'Dodaj u listu za ažuriranje'}
        >
          {row.selected ? '☑' : '☐'}
        </button>
      </div>
    </div>
  )
}
