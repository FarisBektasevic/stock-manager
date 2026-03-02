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
  selected: boolean
  status: RowStatus
  statusMessage?: string
}

// --- SKU Manager types ---

export interface SkuVariation {
  variation_id: number
  name: string
  current_sku: string
  generated_sku: string
  needs_update: boolean
}

export interface GetSkuVariationsResponse {
  success: boolean
  product_name?: string
  product_id?: number
  variations?: SkuVariation[]
  message?: string
}

export interface SkuUpdateResult {
  variation_id: number
  new_sku: string
  success: boolean
  message?: string
}

export interface SkuUpdateResponse {
  results?: SkuUpdateResult[]
}

export interface SkuVariationRow extends SkuVariation {
  selected: boolean
  editedSku: string
  status: RowStatus
  statusMessage?: string
}
