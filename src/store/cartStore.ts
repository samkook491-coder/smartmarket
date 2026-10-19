import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Product } from '../types/database'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

export const quantityStep = (unit: Product['unit']): number =>
  unit === 'kg' || unit === 'litre' ? 0.1 : 1

const roundQuantity = (quantity: number): number => Math.round(quantity * 100) / 100

export const useCartStore = create<CartState>()(persist((set) => ({
  items: [],
  addItem: (product, quantity = quantityStep(product.unit)) => set((state) => {
    const available = Math.max(0, Number(product.available_quantity))
    if (!product.in_stock || available <= 0 || quantity <= 0) return state
    const existing = state.items.find((item) => item.product.id === product.id)
    const nextQuantity = roundQuantity(Math.min(available, (existing?.quantity ?? 0) + quantity))
    if (existing) {
      return { items: state.items.map((item) => item.product.id === product.id
        ? { product, quantity: nextQuantity }
        : item) }
    }
    return { items: [...state.items, { product, quantity: roundQuantity(Math.min(available, quantity)) }] }
  }),
  setQuantity: (productId, quantity) => set((state) => ({
    items: state.items.flatMap((item) => {
      if (item.product.id !== productId) return [item]
      const available = Number(item.product.available_quantity)
      if (quantity <= 0 || available <= 0) return []
      return [{ ...item, quantity: roundQuantity(Math.min(available, quantity)) }]
    }),
  })),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),
  clear: () => set({ items: [] }),
}), {
  name: 'smartmarket-cart',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ items: state.items }),
}))
