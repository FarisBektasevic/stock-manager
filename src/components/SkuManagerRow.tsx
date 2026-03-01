import type { SkuVariationRow } from '../types'

interface SkuManagerRowProps {
  row: SkuVariationRow
  onToggle: (variationId: number, selected: boolean) => void
  onSkuEdit: (variationId: number, value: string) => void
  disabled: boolean
}

export function SkuManagerRow({ row, onToggle, onSkuEdit, disabled }: SkuManagerRowProps) {
  let rowClass = 'sku-row'
  if (row.status === 'success') rowClass += ' sku-row--success'
  if (row.status === 'error') rowClass += ' sku-row--error'
  if (row.needs_update && row.status === 'idle') rowClass += ' sku-row--pending'

  return (
    <div className={rowClass}>
      <span className="sku-row__name">{row.name}</span>

      <span className="sku-row__sku sku-row__sku--current">
        {row.current_sku || <em className="sku-row__empty">—</em>}
      </span>

      <div className="sku-row__sku sku-row__sku--new">
        {row.status === 'idle' ? (
          <input
            type="text"
            className="sku-row__sku-input"
            value={row.editedSku}
            placeholder={row.needs_update ? row.generated_sku : '✓ ispravno'}
            onChange={(e) => onSkuEdit(row.variation_id, e.target.value)}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
          />
        ) : row.status === 'success' ? (
          <span className="sku-row__ok">✓ {row.current_sku}</span>
        ) : (
          <span className="sku-row__err">✗ greška</span>
        )}
      </div>

      <div className="sku-row__action">
        {row.status === 'success' && (
          <span className="sku-row__status sku-row__status--ok">✓</span>
        )}
        {row.status === 'error' && (
          <span className="sku-row__status sku-row__status--err">✗</span>
        )}
        {row.status === 'idle' && (
          <button
            type="button"
            className={`sku-row__toggle ${row.selected ? 'sku-row__toggle--on' : 'sku-row__toggle--off'}`}
            onClick={() => onToggle(row.variation_id, !row.selected)}
            disabled={disabled}
          >
            {row.selected ? '✓' : '○'}
          </button>
        )}
      </div>
    </div>
  )
}
