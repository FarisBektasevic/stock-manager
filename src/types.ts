export interface Variation {
  variation_id: number
  name: string
  sku: string
  stock_quantity: number | null
}

export interface GetVariationsResponse {
  success: boolean
  product_name?: string
  variations?: Variation[]
  message?: string
}

export interface UpdateItem {
  sku: string
  quantity: number
}

export interface UpdateResult {
  sku: string
  success: boolean
  new_stock?: number
  message?: string
}

export interface UpdateStockResponse {
  results?: UpdateResult[]
}

export type RowStatus = 'idle' | 'success' | 'error'

export interface VariationRow extends Variation {
  inputValue: string
  status: RowStatus
  statusMessage?: string
}
