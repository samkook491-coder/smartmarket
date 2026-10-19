import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorMessage, Notice } from '../components/Feedback'
import { getErrorMessage, requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface RegisterValues {
  fullName: string
  phone: string
  password: string
  confirmPassword: string
}

export function Register() {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<RegisterValues>()

  const submit = handleSubmit(async ({ fullName, phone, password }) => {
    setError('')
    setNotice('')
    try {
      requireSupabaseConfiguration(isSupabaseConfigured)
      const { data, error: signUpError } = await supabase.auth.signUp({
        phone: phone.trim(),
        password,
        options: { data: { full_name: fullName.trim() } },
      })
      if (signUpError) throw signUpError
      if (!data.user) throw new Error('La création du compte n’a retourné aucun utilisateur.')

      if (!data.session) {
        setNotice('Compte créé. La confirmation du numéro est exigée par Supabase avant la connexion. Désactivez la confirmation téléphonique dans Supabase Auth pour utiliser le mot de passe sans code.')
        return
      }

      await useAuthStore.getState().refreshProfile(data.user.id)
      navigate('/register/role')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  })

  return (
    <main className="auth-layout">
      <Link className="back-link" to="/onboarding"><ArrowLeft size={17} /> Retour</Link>
      <section className="auth-card">
        <Link className="brand" to="/"><span className="brand-mark">S</span>Smartmarket</Link>
        <span className="eyebrow">Créer un compte</span>
        <h1>Bienvenue au marché.</h1>
        <p className="muted">Créez votre compte avec votre numéro et un mot de passe.</p>
        <form className="form-stack" onSubmit={(event) => void submit(event)}>
          <label>Prénom et nom<input autoComplete="name" {...register('fullName', { required: 'Votre nom est obligatoire.' })} placeholder="Ex. Awa Koné" /></label>
          {errors.fullName && <ErrorMessage>{errors.fullName.message}</ErrorMessage>}
          <label>Téléphone (+225)
            <input autoComplete="tel" type="tel" placeholder="+225 07 00 00 00 00"
              {...register('phone', { required: 'Votre numéro de téléphone est obligatoire.', pattern: { value: /^\+225\d{10}$/, message: 'Saisissez un numéro au format +225XXXXXXXXXX, sans espaces.' } })} />
          </label>
          {errors.phone && <ErrorMessage>{errors.phone.message}</ErrorMessage>}
          <label>Mot de passe<input type="password" autoComplete="new-password" {...register('password', { required: 'Choisissez un mot de passe.', minLength: { value: 8, message: 'Le mot de passe doit contenir au moins 8 caractères.' } })} /></label>
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          <label>Confirmer le mot de passe<input type="password" autoComplete="new-password" {...register('confirmPassword', { required: 'Confirmez votre mot de passe.', validate: (value) => value === getValues('password') || 'Les mots de passe ne correspondent pas.' })} /></label>
          {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {notice && <Notice>{notice}</Notice>}
          <button className="button primary full" disabled={isSubmitting}>
            {isSubmitting ? 'Patientez…' : 'Créer mon compte'}
            <ArrowRight size={18} />
          </button>
          <p className="muted">Utilisez au moins 8 caractères pour votre mot de passe.</p>
        </form>
        <p className="auth-footer">J’ai déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </section>
    </main>
  )
}
