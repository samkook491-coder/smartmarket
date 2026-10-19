import { ArrowLeft, ArrowRight, ImagePlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorMessage, Notice } from '../components/Feedback'
import { COMMUNES_ABIDJAN, getErrorMessage, requireSupabaseConfiguration } from '../lib/constants'
import { uploadShopLogo } from '../lib/images'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'

interface ShopValues {
  name: string
  description: string
  commune: string
  whatsapp: string
}

export function RegisterShop() {
  const { user } = useAuthStore()
  const setShop = useShopStore((state) => state.setShop)
  const [logo, setLogo] = useState<File | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ShopValues>()

  const submit = handleSubmit(async (values) => {
    setError('')
    try {
      requireSupabaseConfiguration(isSupabaseConfigured)
      if (!user) throw new Error('Connectez-vous pour enregistrer une boutique.')
      let logoUrl: string | null = null
      if (logo) logoUrl = await uploadShopLogo(logo, user.id)
      const { data, error: insertError } = await supabase.from('shops').insert({
        owner_id: user.id,
        name: values.name.trim(),
        description: values.description.trim() || null,
        commune: values.commune,
        whatsapp: values.whatsapp.trim(),
        logo_url: logoUrl,
        status: 'pending',
      }).select().single()
      if (insertError) throw insertError
      setShop(data)
      navigate('/seller/dashboard')
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  })

  return (
    <main className="auth-layout">
      <Link className="back-link" to="/register/role"><ArrowLeft size={17} /> Retour</Link>
      <section className="auth-card">
        <span className="eyebrow">Espace vendeur</span>
        <h1>Présentez votre boutique.</h1>
        <p className="muted">Quelques informations pour créer votre vitrine sur Smartmarket.</p>
        <form className="form-stack" onSubmit={(event) => void submit(event)}>
          <label>Nom de la boutique<input {...register('name', { required: 'Le nom de boutique est obligatoire.' })} placeholder="Ex. Les Jardins d’Awa" /></label>
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          <label>Description <span className="muted">(facultatif)</span><textarea maxLength={200} rows={3} {...register('description')} placeholder="Présentez vos produits en quelques mots" /></label>
          <label>Commune<select defaultValue="" {...register('commune', { required: 'Choisissez une commune.' })}><option value="" disabled>Choisir une commune</option>{COMMUNES_ABIDJAN.map((commune) => <option key={commune}>{commune}</option>)}</select></label>
          {errors.commune && <ErrorMessage>{errors.commune.message}</ErrorMessage>}
          <label>WhatsApp de contact<input type="tel" placeholder="+225 07 00 00 00 00" {...register('whatsapp', { required: 'Le numéro WhatsApp est obligatoire.', pattern: { value: /^\+225\d{10}$/, message: 'Format attendu : +225XXXXXXXXXX.' } })} /></label>
          {errors.whatsapp && <ErrorMessage>{errors.whatsapp.message}</ErrorMessage>}
          <label className="upload-control"><ImagePlus size={20} />{logo ? logo.name : 'Ajouter le logo de la boutique'}<input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></label>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Notice>Votre boutique sera soumise à une validation administrative, généralement effectuée sous 24 heures. Vous pourrez préparer vos produits en brouillon pendant l’examen.</Notice>
          <button className="button primary full" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement…' : 'Enregistrer ma boutique'} <ArrowRight size={18} /></button>
        </form>
      </section>
    </main>
  )
}
