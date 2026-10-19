export type UserRole = 'buyer' | 'seller'
export type ShopStatus = 'pending' | 'active' | 'suspended'
export type ProductStatus = 'draft' | 'published'
export type Unit = 'kg' | 'sachet' | 'botte' | 'pièce' | 'litre'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole | null
  avatar_url: string | null
}

export interface Shop {
  id: string
  owner_id: string
  name: string
  description: string | null
  commune: string | null
  whatsapp: string | null
  logo_url: string | null
  status: ShopStatus
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  position: number
}

export interface Product {
  id: string
  shop_id: string
  category_id: number
  name: string
  description: string | null
  price: number
  unit: Unit
  available_quantity: number
  in_stock: boolean
  status: ProductStatus
  created_at: string
  shop?: Pick<Shop, 'name' | 'commune' | 'whatsapp' | 'status'>
  product_images?: ProductImage[]
}
