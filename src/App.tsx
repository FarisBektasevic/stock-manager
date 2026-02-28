import { useState, useCallback } from 'react'
import { SkuSearch } from './components/SkuSearch'
import { VariationTable } from './components/VariationTable'
import type {
  VariationRow,
  GetVariationsResponse,
  UpdateStockResponse,
} from './types'
import './App.css'

const WEBHOOK_GET = import.meta.env.VITE_WEBHOOK_GET_VARIATIONS as string
const WEBHOOK_UPDATE = import.meta.env.VITE_WEBHOOK_UPDATE_STOCK as string

type AppState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'results'; productName: string; rows: VariationRow[] }

export default function App() {
  const [state, setState] = useState<AppState>({ phase: 'idle' })
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSearch = useCallback(async (sku: string) => {
    setState({ phase: 'loading' })
    try {
      const res = await fetch(WEBHOOK_GET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku }),
      })
      const data: GetVariationsResponse = await res.json()

      if (!data.success || !data.variations || data.variations.length === 0) {
        setState({
          phase: 'error',
          message: data.message ?? 'Proizvod nije pronađen.',
        })
        return
      }

      const rows: VariationRow[] = data.variations.map((v) => ({
        ...v,
        inputValue: '',
        status: 'idle',
      }))

      setState({
        phase: 'results',
        productName: sku,
        rows,
      })
    } catch {
      setState({
        phase: 'error',
        message: 'Greška pri komunikaciji sa serverom.',
      })
    }
  }, [])

  const handleRowChange = useCallback((sku: string, value: string) => {
    setState((prev) => {
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
    if (state.phase !== 'results') return

    const updates = state.rows
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

      setState((prev) => {
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
              stock_quantity: result.success
                ? (result.new_stock ?? r.stock_quantity)
                : r.stock_quantity,
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
  }, [state])

  return (
    <div className="app">
      <main className="app__main">
        <SkuSearch
          onSearch={handleSearch}
          loading={state.phase === 'loading'}
        />

        {state.phase === 'loading' && (
          <div className="status-box status-box--loading">
            <span className="blink">█</span> PRETRAŽUJEM...
          </div>
        )}

        {state.phase === 'error' && (
          <div className="status-box status-box--error">
            ✗ {state.message}
          </div>
        )}

        {state.phase === 'results' && (
          <VariationTable
            productName={state.productName}
            rows={state.rows}
            onRowChange={handleRowChange}
            onUpdate={handleUpdate}
            updating={updating}
          />
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}

      <footer className="app__footer">
        <span>[ STOCK MANAGER v0.1 ]</span>
      </footer>
    </div>
  )
}
