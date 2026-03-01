import { useState, useCallback } from 'react'
import { SkuSearch } from './components/SkuSearch'
import { VariationTable } from './components/VariationTable'
import { SkuManagerTable } from './components/SkuManagerTable'
import type {
  VariationRow,
  GetVariationsResponse,
  UpdateStockResponse,
  GetSkuVariationsResponse,
  SkuVariationRow,
  SkuUpdateResponse,
} from './types'
import './App.css'

const WEBHOOK_GET = import.meta.env.VITE_WEBHOOK_GET_VARIATIONS as string
const WEBHOOK_UPDATE = import.meta.env.VITE_WEBHOOK_UPDATE_STOCK as string
const WEBHOOK_UPDATE_SKU = import.meta.env.VITE_WEBHOOK_UPDATE_SKU as string

type AppMode = 'home' | 'stock' | 'sku'

type StockState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'results'; productName: string; rows: VariationRow[] }

type SkuState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'results'; productName: string; productId: number; rows: SkuVariationRow[] }

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [stockState, setStockState] = useState<StockState>({ phase: 'idle' })
  const [skuState, setSkuState] = useState<SkuState>({ phase: 'idle' })
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function goHome() {
    setMode('home')
    setStockState({ phase: 'idle' })
    setSkuState({ phase: 'idle' })
  }

  // === STOCK HANDLERS ===

  const handleSearch = useCallback(async (sku: string) => {
    setStockState({ phase: 'loading' })
    try {
      const res = await fetch(WEBHOOK_GET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, mode: 'stock' }),
      })
      const data: GetVariationsResponse = await res.json()

      if (!data.success || !data.variations || data.variations.length === 0) {
        setStockState({ phase: 'error', message: data.message ?? 'Proizvod nije pronađen.' })
        return
      }

      const rows: VariationRow[] = data.variations.map((v) => ({
        ...v,
        inputValue: '',
        status: 'idle',
      }))
      setStockState({ phase: 'results', productName: sku, rows })
    } catch {
      setStockState({ phase: 'error', message: 'Greška pri komunikaciji sa serverom.' })
    }
  }, [])

  const handleRowChange = useCallback((sku: string, value: string) => {
    setStockState((prev) => {
      if (prev.phase !== 'results') return prev
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.sku === sku ? { ...r, inputValue: value, status: 'idle' } : r
        ),
      }
    })
  }, [])

  const handleUpdate = useCallback(async () => {
    if (stockState.phase !== 'results') return

    const updates = stockState.rows
      .filter((r) => r.stock_quantity !== null && r.inputValue !== '' && Number(r.inputValue) !== r.stock_quantity)
      .map((r) => ({ sku: r.sku, quantity: Number(r.inputValue) }))

    if (updates.length === 0) {
      showToast('Nisi promijenio nijednu vrijednost!')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(WEBHOOK_UPDATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      const data: UpdateStockResponse = await res.json()

      if (!data.results) {
        showToast('Update poslan, čeka se potvrda od servera.')
        return
      }

      const resultMap = new Map(data.results.map((r) => [r.sku, r]))
      const successCount = data.results.filter((r) => r.success).length

      setStockState((prev) => {
        if (prev.phase !== 'results') return prev
        return {
          ...prev,
          rows: prev.rows.map((r) => {
            const result = resultMap.get(r.sku)
            if (!result) return r
            return {
              ...r,
              status: result.success ? 'success' : 'error',
              statusMessage: result.success ? undefined : result.message,
              stock_quantity: result.success ? (result.new_stock ?? r.stock_quantity) : r.stock_quantity,
              inputValue: result.success ? '' : r.inputValue,
            }
          }),
        }
      })

      showToast(`✓ Ažurirano ${successCount}/${updates.length} varijacija`)
    } catch {
      showToast('Greška pri slanju podataka!')
    } finally {
      setUpdating(false)
    }
  }, [stockState])

  // === SKU HANDLERS ===

  const handleSkuSearch = useCallback(async (sku: string) => {
    setSkuState({ phase: 'loading' })
    try {
      const res = await fetch(WEBHOOK_GET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, mode: 'sku' }),
      })
      const data: GetSkuVariationsResponse = await res.json()

      if (!data.success || !data.variations || data.variations.length === 0) {
        setSkuState({ phase: 'error', message: data.message ?? 'Proizvod nije pronađen.' })
        return
      }

      const rows: SkuVariationRow[] = data.variations.map((v) => ({
        ...v,
        selected: v.needs_update,
        editedSku: v.needs_update ? v.generated_sku : '',
        status: 'idle',
      }))
      setSkuState({ phase: 'results', productName: sku, productId: data.product_id!, rows })
    } catch {
      setSkuState({ phase: 'error', message: 'Greška pri komunikaciji sa serverom.' })
    }
  }, [])

  const handleSkuRowToggle = useCallback((variationId: number, selected: boolean) => {
    setSkuState((prev) => {
      if (prev.phase !== 'results') return prev
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.variation_id === variationId ? { ...r, selected } : r
        ),
      }
    })
  }, [])

  const handleSkuRowEdit = useCallback((variationId: number, value: string) => {
    setSkuState((prev) => {
      if (prev.phase !== 'results') return prev
      return {
        ...prev,
        rows: prev.rows.map((r) =>
          r.variation_id === variationId ? { ...r, editedSku: value } : r
        ),
      }
    })
  }, [])

  const handleSkuApply = useCallback(async () => {
    if (skuState.phase !== 'results') return

    const selected = skuState.rows.filter((r) => r.selected)
    if (selected.length === 0) {
      showToast('Nisi odabrao nijednu varijaciju!')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(WEBHOOK_UPDATE_SKU, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: skuState.productId,
          updates: selected.map((r) => ({ variation_id: r.variation_id, new_sku: r.editedSku })),
        }),
      })
      const data: SkuUpdateResponse = await res.json()

      if (!data.results) {
        showToast('Update poslan, čeka se potvrda od servera.')
        return
      }

      const resultMap = new Map(data.results.map((r) => [r.variation_id, r]))
      const successCount = data.results.filter((r) => r.success).length

      setSkuState((prev) => {
        if (prev.phase !== 'results') return prev
        return {
          ...prev,
          rows: prev.rows.map((r) => {
            const result = resultMap.get(r.variation_id)
            if (!result) return r
            return {
              ...r,
              status: result.success ? 'success' : 'error',
              statusMessage: result.success ? undefined : result.message,
              current_sku: result.success ? result.new_sku : r.current_sku,
              needs_update: result.success ? false : r.needs_update,
              selected: result.success ? false : r.selected,
            }
          }),
        }
      })

      showToast(`✓ Ažurirano ${successCount}/${selected.length} SKU-ova`)
    } catch {
      showToast('Greška pri slanju podataka!')
    } finally {
      setUpdating(false)
    }
  }, [skuState])

  return (
    <div className="app">
      <main className="app__main">

        {mode === 'home' && (
          <div className="home-menu">
            <div className="home-menu__logo">[ STOCK MANAGER ]</div>
            <div className="home-menu__subtitle">&gt;_ ODABERI FUNKCIJU</div>
            <div className="home-menu__buttons">
              <button className="btn btn--update home-menu__btn" onClick={() => setMode('stock')}>
                UPRAVLJANJE LAGERA
              </button>
              <button className="btn btn--sku home-menu__btn" onClick={() => setMode('sku')}>
                UPRAVLJANJE SKU-ova
              </button>
            </div>
          </div>
        )}

        {mode === 'stock' && (
          <>
            <SkuSearch onSearch={handleSearch} loading={stockState.phase === 'loading'} onBack={goHome} />
            {stockState.phase === 'loading' && (
              <div className="status-box status-box--loading">
                <span className="blink">█</span> PRETRAŽUJEM...
              </div>
            )}
            {stockState.phase === 'error' && (
              <div className="status-box status-box--error">✗ {stockState.message}</div>
            )}
            {stockState.phase === 'results' && (
              <VariationTable
                productName={stockState.productName}
                rows={stockState.rows}
                onRowChange={handleRowChange}
                onUpdate={handleUpdate}
                updating={updating}
              />
            )}
          </>
        )}

        {mode === 'sku' && (
          <>
            <SkuSearch onSearch={handleSkuSearch} loading={skuState.phase === 'loading'} onBack={goHome} />
            {skuState.phase === 'loading' && (
              <div className="status-box status-box--loading">
                <span className="blink">█</span> PRETRAŽUJEM...
              </div>
            )}
            {skuState.phase === 'error' && (
              <div className="status-box status-box--error">✗ {skuState.message}</div>
            )}
            {skuState.phase === 'results' && (
              <SkuManagerTable
                productName={skuState.productName}
                rows={skuState.rows}
                onRowToggle={handleSkuRowToggle}
                onSkuEdit={handleSkuRowEdit}
                onApply={handleSkuApply}
                applying={updating}
              />
            )}
          </>
        )}

      </main>

      {toast && <div className="toast">{toast}</div>}

      <footer className="app__footer">
        <span>[ STOCK MANAGER v0.2 ]</span>
      </footer>
    </div>
  )
}
