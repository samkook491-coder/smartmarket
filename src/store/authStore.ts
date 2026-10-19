import { create } from 'zustand'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Profile } from '../types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  initialized: boolean
  initialize: () => () => void
  refreshProfile: (userId: string) => Promise<void>
  setProfile: (profile: Profile | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ loading: false, initialized: true })
      return () => undefined
    }

    let active = true
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) console.error('Impossible de récupérer la session :', error.message)
      if (!active) return
      const session = data.session
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        try {
          await useAuthStore.getState().refreshProfile(session.user.id)
        } catch (profileError) {
          console.error('Impossible de récupérer le profil :', profileError)
        }
      }
      if (active) set({ loading: false, initialized: true })
    }

    void loadSession()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        set({ session, user: session?.user ?? null })
        if (event === 'SIGNED_OUT') set({ profile: null })
        if (session?.user && event === 'SIGNED_IN') {
          void useAuthStore.getState().refreshProfile(session.user.id).catch((error: unknown) => {
            console.error('Impossible de récupérer le profil :', error)
          })
        }
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  },
  refreshProfile: async (userId) => {
    requireSupabaseConfiguration(isSupabaseConfigured)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    set({ profile: data as Profile })
  },
  setProfile: (profile) => set({ profile }),
  logout: async () => {
    requireSupabaseConfiguration(isSupabaseConfigured)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null, session: null })
  },
}))
