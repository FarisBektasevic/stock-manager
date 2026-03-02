import { VariationRow } from './VariationRow'
import type { VariationRow as VariationRowType } from '../types'

interface VariationTableProps {
  productName: string
  rows: VariationRowType[]
  onRowChange: (sku: string, value: string) => void
  onRowToggle: (sku: string, selected: boolean) => void
  onUpdate: () => void
  updating: boolean
}

export function VariationTable({
  productName,
  rows,
  onRowChange,
  onRowToggle,
  onUpdate,
  updating,
}: VariationTableProps) {
  const selectedCount = rows.filter((r) => r.selected && r.inputValue !== '').length

  return (
    <div className="variation-table">
      <div className="variation-table__titlebar">
        <div className="variation-table__titlebar-dots">
          <span className="variation-table__titlebar-dot variation-table__titlebar-dot--r" />
          <span className="variation-table__titlebar-dot variation-table__titlebar-dot--y" />
          <span className="variation-table__titlebar-dot variation-table__titlebar-dot--g" />
        </div>
        <span className="variation-table__titlebar-label">VARIJACIJE PROIZVODA</span>
      </div>
      <div className="variation-table__header">
        <span className="variation-table__product-name">{productName}</span>
        <span className="variation-table__count">
          {rows.length} VARIJACIJA
        </span>
      </div>

      <div className="variation-table__columns">
        <span>VARIJACIJA / SKU</span>
        <span>NOVO STANJE</span>
      </div>

      <div className="variation-table__rows">
        {rows.map((row) => (
          <VariationRow
            key={row.sku}
            row={row}
            onChange={onRowChange}
            onToggle={onRowToggle}
            disabled={updating}
          />
        ))}
      </div>

      <div className="variation-table__footer">
        {selectedCount > 0 && (
          <span className="variation-table__changed-hint">
            {selectedCount} odabrano za ažuriranje
          </span>
        )}
        <button
          className="btn btn--update"
          onClick={onUpdate}
          disabled={updating || selectedCount === 0}
        >
          {updating ? '[ AŽURIRANJE... ]' : `[ AŽURIRAJ STANJE ]`}
        </button>
      </div>
    </div>
  )
}
