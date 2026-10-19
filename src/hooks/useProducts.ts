import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Product } from '../types/database'

interface ProductState {
  products: Product[]
  loading: boolean
  error: string | null
}

export function useProducts(categoryId?: number): ProductState {
  const [state, setState] = useState<ProductState>({ products: [], loading: true, error: null })

  useEffect(() => {
    let active = true
    if (!isSupabaseConfigured) {
      setState({ products: [], loading: false, error: 'Connectez Supabase pour afficher les produits.' })
      return () => { active = false }
    }

    const load = async () => {
      let query = supabase
        .from('products')
        .select('*, shop:shops(name, commune, whatsapp, status), product_images(*)')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (categoryId !== undefined) query = query.eq('category_id', categoryId)
      const { data, error } = await query
      if (!active) return
      if (error) setState({ products: [], loading: false, error: error.message })
      else setState({ products: (data ?? []) as Product[], loading: false, error: null })
    }
    void load()
    return () => { active = false }
  }, [categoryId])

  return state
}
