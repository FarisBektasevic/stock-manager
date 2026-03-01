import { SkuManagerRow } from './SkuManagerRow'
import type { SkuVariationRow } from '../types'

interface SkuManagerTableProps {
  productName: string
  rows: SkuVariationRow[]
  onRowToggle: (variationId: number, selected: boolean) => void
  onSkuEdit: (variationId: number, value: string) => void
  onApply: () => void
  applying: boolean
}

export function SkuManagerTable({
  productName,
  rows,
  onRowToggle,
  onSkuEdit,
  onApply,
  applying,
}: SkuManagerTableProps) {
  const selectedCount = rows.filter((r) => r.selected && r.status === 'idle').length
  const totalNeedUpdate = rows.filter((r) => r.needs_update).length

  return (
    <div className="sku-table">
      <div className="sku-table__titlebar">
        <div className="sku-table__titlebar-dots">
          <span className="sku-table__dot sku-table__dot--r" />
          <span className="sku-table__dot sku-table__dot--y" />
          <span className="sku-table__dot sku-table__dot--g" />
        </div>
        <span className="sku-table__titlebar-label">SKU MENADŽER</span>
      </div>

      <div className="sku-table__header">
        <span className="sku-table__product-name">{productName}</span>
        <span className="sku-table__count">{totalNeedUpdate} / {rows.length} TREBA UPDATE</span>
      </div>

      <div className="sku-table__columns">
        <span>VARIJACIJA</span>
        <span>TRENUTNI SKU</span>
        <span>NOVI SKU</span>
        <span>✓</span>
      </div>

      <div className="sku-table__rows">
        {rows.map((row) => (
          <SkuManagerRow
            key={row.variation_id}
            row={row}
            onToggle={onRowToggle}
            onSkuEdit={onSkuEdit}
            disabled={applying}
          />
        ))}
      </div>

      <div className="sku-table__footer">
        {selectedCount > 0 && (
          <span className="sku-table__selected-hint">
            {selectedCount} odabrano za update
          </span>
        )}
        <button
          className="btn btn--sku-apply"
          onClick={onApply}
          disabled={applying || selectedCount === 0}
        >
          {applying ? '[ AŽURIRANJE... ]' : `[ PRIMIJENI ODABRANE ]`}
        </button>
      </div>
    </div>
  )
}
