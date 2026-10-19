import { create } from 'zustand'
import { requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Shop } from '../types/database'

interface ShopState {
  shop: Shop | null
  loading: boolean
  fetchShop: (userId: string) => Promise<void>
  setShop: (shop: Shop | null) => void
}

export const useShopStore = create<ShopState>((set) => ({
  shop: null,
  loading: false,
  fetchShop: async (userId) => {
    requireSupabaseConfiguration(isSupabaseConfigured)
    set({ loading: true })
    const { data, error } = await supabase.from('shops').select('*').eq('owner_id', userId).maybeSingle()
    set({ loading: false })
    if (error) throw error
    set({ shop: data as Shop | null })
  },
  setShop: (shop) => set({ shop }),
}))
