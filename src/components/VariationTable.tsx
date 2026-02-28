import { VariationRow } from './VariationRow'
import type { VariationRow as VariationRowType } from '../types'

interface VariationTableProps {
  productName: string
  rows: VariationRowType[]
  onRowChange: (sku: string, value: string) => void
  onUpdate: () => void
  updating: boolean
}

export function VariationTable({
  productName,
  rows,
  onRowChange,
  onUpdate,
  updating,
}: VariationTableProps) {
  const changedCount = rows.filter(
    (r) => r.inputValue !== '' && Number(r.inputValue) !== r.stock_quantity
  ).length

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
            disabled={updating}
          />
        ))}
      </div>

      <div className="variation-table__footer">
        {changedCount > 0 && (
          <span className="variation-table__changed-hint">
            {changedCount} promjena za slanje
          </span>
        )}
        <button
          className="btn btn--update"
          onClick={onUpdate}
          disabled={updating || changedCount === 0}
        >
          {updating ? '[ AŽURIRANJE... ]' : `[ AŽURIRAJ STANJE ]`}
        </button>
      </div>
    </div>
  )
}
