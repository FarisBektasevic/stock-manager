import { useState } from 'react'

interface SkuSearchProps {
  onSearch: (sku: string) => void
  loading: boolean
}

export function SkuSearch({ onSearch, loading }: SkuSearchProps) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const val = value.trim()
    if (val) {
      onSearch(val)
      setValue('')
    }
  }

  return (
    <form className="sku-search" onSubmit={handleSubmit}>
      <div className="sku-search__titlebar">
        <div className="sku-search__titlebar-dots">
          <span className="sku-search__dot sku-search__dot--r" />
          <span className="sku-search__dot sku-search__dot--y" />
          <span className="sku-search__dot sku-search__dot--g" />
        </div>
        <span className="sku-search__titlebar-label">PRETRAGA PROIZVODA</span>
      </div>
      <div className="sku-search__body">
        <div className="sku-search__label">&gt;_ UNESI SKU PROIZVODA</div>
        <div className="sku-search__row">
          <input
            className="sku-search__input"
            type="text"
            name="sku"
            placeholder="npr. BLUE-XL-001"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? '...' : '[ PRETRAŽI ]'}
          </button>
        </div>
      </div>
    </form>
  )
}
