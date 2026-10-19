import { ArrowRight, ShoppingBasket, Store } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorMessage } from '../components/Feedback'
import { getErrorMessage, requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/database'

export function RegisterRole() {
  const { user, profile, setProfile } = useAuthStore()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const choose = async (role: UserRole) => {
    setError('')
    setSaving(true)
    try {
      requireSupabaseConfiguration(isSupabaseConfigured)
      if (!user) throw new Error('Votre session a expiré. Veuillez vous reconnecter.')
      const { data, error: updateError } = await supabase.from('profiles').update({ role }).eq('id', user.id).select().single()
      if (updateError) throw updateError
      setProfile(data)
      navigate(role === 'seller' ? '/register/shop' : '/home')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-card role-card">
        <span className="eyebrow">Votre espace</span>
        <h1>Que souhaitez-vous faire ?</h1>
        <p className="muted">Bonjour{profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}, choisissez votre expérience.</p>
        <button className="role-option" disabled={saving} onClick={() => void choose('buyer')}>
          <span className="role-icon buyer-icon"><ShoppingBasket /></span><span><strong>Je veux acheter</strong><small>Découvrir les produits frais près de chez moi</small></span><ArrowRight />
        </button>
        <button className="role-option" disabled={saving} onClick={() => void choose('seller')}>
          <span className="role-icon seller-icon"><Store /></span><span><strong>Je veux vendre</strong><small>Créer ma boutique et présenter mes produits</small></span><ArrowRight />
        </button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!user && <p className="muted">Une session est nécessaire pour choisir votre rôle.</p>}
      </section>
    </main>
  )
}
