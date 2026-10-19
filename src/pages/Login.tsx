import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorMessage } from '../components/Feedback'
import { getErrorMessage, requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface LoginValues {
  email: string
  password: string
}

export function Login() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>()

  const submit = handleSubmit(async ({ email, password }) => {
    setError('')
    try {
      requireSupabaseConfiguration(isSupabaseConfigured)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (signInError) throw signInError
      if (!data.user) throw new Error('La connexion n’a retourné aucun utilisateur.')

      await useAuthStore.getState().refreshProfile(data.user.id)
      const role = useAuthStore.getState().profile?.role
      navigate(role === 'seller' ? '/seller/dashboard' : role === 'buyer' ? '/home' : '/register/role')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  })

  return (
    <main className="auth-layout">
      <Link className="back-link" to="/onboarding"><ArrowLeft size={17} /> Retour</Link>
      <section className="auth-card">
        <Link className="brand" to="/"><span className="brand-mark">S</span>Smartmarket</Link>
        <span className="eyebrow">Heureux de vous revoir</span>
        <h1>Se connecter.</h1>
        <p className="muted">Connectez-vous avec votre adresse e-mail et votre mot de passe.</p>
        <form className="form-stack" onSubmit={(event) => void submit(event)}>
          <label>Adresse e-mail
            <input type="email" autoComplete="email" {...register('email', { required: 'Saisissez votre adresse e-mail.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Saisissez une adresse e-mail valide.' } })} placeholder="awa@example.com" />
          </label>
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          <label>Mot de passe<input type="password" autoComplete="current-password" {...register('password', { required: 'Saisissez votre mot de passe.' })} /></label>
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <button className="button primary full" disabled={isSubmitting}>
            {isSubmitting ? 'Patientez…' : 'Se connecter'}
            <LockKeyhole size={18} />
          </button>
        </form>
        <p className="auth-footer">Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
      </section>
    </main>
  )
}
