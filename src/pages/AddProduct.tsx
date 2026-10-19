import { ArrowLeft, ImagePlus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorMessage, Notice } from '../components/Feedback'
import { getErrorMessage, requireSupabaseConfiguration, RAYONS, UNITES } from '../lib/constants'
import { uploadProductImage } from '../lib/images'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'
import type { Product, ProductImage, ProductStatus, Unit } from '../types/database'

interface ProductValues {
  name: string
  category_id: number
  description: string
  price: number
  unit: Unit
  available_quantity: number
  status: ProductStatus
}

export function AddProduct() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { user } = useAuthStore()
  const { shop, fetchShop } = useShopStore()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [keptImages, setKeptImages] = useState<ProductImage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ProductValues>({
    defaultValues: { category_id: 1, unit: 'kg', available_quantity: 0, status: 'draft', price: 0 },
  })
  const requestedStatus = watch('status')

  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        requireSupabaseConfiguration(isSupabaseConfigured)
        if (!user) throw new Error('Connectez-vous pour gérer vos produits.')
        await fetchShop(user.id)
        if (id) {
          const currentShop = useShopStore.getState().shop
          if (!currentShop) throw new Error('Aucune boutique n’est associée à votre compte.')
          const { data, error: queryError } = await supabase.from('products')
            .select('*, product_images(*)').eq('id', id).eq('shop_id', currentShop.id).single()
          if (queryError) throw queryError
          if (!active) return
          const loaded = data as Product
          setProduct(loaded)
          setKeptImages(loaded.product_images ?? [])
          reset({
            name: loaded.name,
            category_id: loaded.category_id,
            description: loaded.description ?? '',
            price: loaded.price,
            unit: loaded.unit,
            available_quantity: Number(loaded.available_quantity),
            status: loaded.status,
          })
        }
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [fetchShop, id, reset, user])

  const submit = handleSubmit(async (values) => {
    setError('')
    setSaving(true)
    try {
      requireSupabaseConfiguration(isSupabaseConfigured)
      if (!user || !shop) throw new Error('Votre compte vendeur ne possède pas de boutique.')
      if (values.status === 'published' && shop.status !== 'active') {
        throw new Error(shop.status === 'suspended' ? 'La boutique est suspendue : la publication est désactivée.' : 'La boutique doit être validée avant de publier un produit.')
      }
      if (editing && !product) throw new Error('Le produit à modifier n’a pas pu être chargé.')
      if (!editing) {
        const { count, error: countError } = await supabase.from('products').select('id', { count: 'exact' }).eq('shop_id', shop.id)
        if (countError) throw countError
        if ((count ?? 0) >= 50) throw new Error('La limite de 50 produits par boutique est atteinte.')
      }

      const valuesToSave = {
        shop_id: shop.id,
        category_id: Number(values.category_id),
        name: values.name.trim(),
        description: values.description.trim() || null,
        price: Number(values.price),
        unit: values.unit,
        available_quantity: Number(values.available_quantity),
        in_stock: Number(values.available_quantity) > 0,
        status: values.status,
      }
      let productId = product?.id
      if (productId) {
        const { error: updateError } = await supabase.from('products').update(valuesToSave).eq('id', productId)
        if (updateError) throw updateError
      } else {
        const { data, error: insertError } = await supabase.from('products').insert(valuesToSave).select('id').single()
        if (insertError) throw insertError
        productId = data.id
      }

      const removedIds = (product?.product_images ?? []).filter((image) => !keptImages.some((kept) => kept.id === image.id)).map((image) => image.id)
      if (removedIds.length) {
        const { error: deleteImageError } = await supabase.from('product_images').delete().in('id', removedIds)
        if (deleteImageError) throw deleteImageError
      }
      const uploadedUrls = await Promise.all(files.map((file) => uploadProductImage(file, productId!)))
      if (uploadedUrls.length) {
        const savedProductId = productId
        const rows = uploadedUrls.map((url, index) => ({ product_id: savedProductId, url, position: keptImages.length + index }))
        const { error: imagesError } = await supabase.from('product_images').insert(rows)
        if (imagesError) throw imagesError
      }
      navigate('/seller/dashboard')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  })

  const addFiles = (selected: FileList | null) => {
    if (!selected) return
    const images = Array.from(selected).filter((file) => file.type.startsWith('image/'))
    if (images.length !== selected.length) setError('Seuls les fichiers image sont acceptés.')
    setFiles((current) => [...current, ...images].slice(0, Math.max(0, 3 - keptImages.length)))
  }

  const removeKeptImage = (imageId: string) => setKeptImages((current) => current.filter((image) => image.id !== imageId))
  const removeNewImage = (index: number) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))

  if (loading) return <div className="page-loading">Chargement du formulaire…</div>

  return (
    <div className="app-shell">
      <main className="content form-page">
        <Link className="back-link inline" to="/seller/dashboard"><ArrowLeft size={17} /> Mes produits</Link>
        <div className="form-page-heading"><span className="eyebrow">Espace vendeur</span><h1>{editing ? 'Modifier le produit' : 'Ajouter un produit'}</h1><p className="muted">Présentez votre produit aux acheteurs du marché.</p></div>
        {shop?.status !== 'active' && <Notice>{shop?.status === 'suspended' ? 'Boutique suspendue : vous pouvez enregistrer un brouillon, mais pas publier.' : 'Boutique en attente de validation : les produits peuvent être enregistrés en brouillon.'}</Notice>}
        <form className="product-form" onSubmit={(event) => void submit(event)}>
          <label>Nom du produit<input {...register('name', { required: 'Le nom du produit est obligatoire.', maxLength: { value: 100, message: '100 caractères maximum.' } })} placeholder="Ex. Tomates fraîches" /></label>
          {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          <label>Rayon<select {...register('category_id', { required: 'Choisissez un rayon.', valueAsNumber: true })}>{RAYONS.map((category) => <option key={category.id} value={category.id}>{category.emoji} {category.name}</option>)}</select></label>
          <label>Description <span className="muted">(facultatif)</span><textarea rows={4} {...register('description', { maxLength: { value: 1000, message: '1000 caractères maximum.' } })} placeholder="Origine, fraîcheur, conseils…" /></label>
          {errors.description && <ErrorMessage>{errors.description.message}</ErrorMessage>}
          <div className="form-two-cols">
            <label>Prix en FCFA<input type="number" min="0" step="1" {...register('price', { required: 'Le prix est obligatoire.', valueAsNumber: true, min: { value: 0, message: 'Le prix ne peut pas être négatif.' } })} /></label>
            <label>Unité<select {...register('unit', { required: 'Choisissez une unité.' })}>{UNITES.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></label>
          </div>
          {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
          <label>Quantité disponible ({watch('unit')})<input type="number" min="0" step={watch('unit') === 'kg' || watch('unit') === 'litre' ? '0.01' : '1'} {...register('available_quantity', { required: 'La quantité disponible est obligatoire.', valueAsNumber: true, min: { value: 0, message: 'La quantité ne peut pas être négative.' }, validate: (value) => Number.isFinite(value) || 'Saisissez une quantité valide.' })} /></label>
          {errors.available_quantity && <ErrorMessage>{errors.available_quantity.message}</ErrorMessage>}
          <p className="muted stock-help">Le produit sera indiqué comme disponible si la quantité est supérieure à zéro.</p>
          <fieldset className="status-fieldset"><legend>Publication</legend>
            <label className="radio-choice"><input type="radio" value="draft" {...register('status')} /><span><strong>Brouillon</strong><small>Visible uniquement dans votre espace vendeur</small></span></label>
            <label className="radio-choice"><input type="radio" value="published" {...register('status')} /><span><strong>Publié</strong><small>Visible par les acheteurs Smartmarket</small></span></label>
          </fieldset>
          {requestedStatus === 'published' && shop?.status !== 'active' && <Notice>La publication sera refusée tant que la boutique ne sera pas active.</Notice>}
          <div className="photo-section"><div><strong>Photos du produit</strong><span className="muted"> Jusqu’à 3 images · JPG, PNG</span></div>
            <div className="image-preview-grid">
              {keptImages.map((image) => <div className="image-preview" key={image.id}><img src={image.url} alt="Photo produit" /><button type="button" aria-label="Supprimer cette photo" onClick={() => removeKeptImage(image.id)}><X size={16} /></button></div>)}
              {previews.map((preview, index) => <div className="image-preview" key={preview}><img src={preview} alt={`Nouvelle photo ${index + 1}`} /><button type="button" aria-label="Retirer cette photo" onClick={() => removeNewImage(index)}><X size={16} /></button></div>)}
              {keptImages.length + files.length < 3 && <label className="image-add"><ImagePlus size={23} /><span>Ajouter une photo</span><input type="file" accept="image/*" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} /></label>}
            </div>
            <small className="muted">Les photos sont redimensionnées à 800 px et compressées avant l’envoi.</small>
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div className="form-actions"><Link className="button secondary" to="/seller/dashboard">Annuler</Link><button className="button primary" disabled={saving}><Save size={17} />{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          {editing && <button className="delete-button" type="button" onClick={async () => {
            if (!product || !window.confirm('Supprimer définitivement ce produit ?')) return
            setSaving(true)
            setError('')
            const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id)
            setSaving(false)
            if (deleteError) setError(getErrorMessage(deleteError))
            else navigate('/seller/dashboard')
          }} disabled={saving}><Trash2 size={16} /> Supprimer ce produit</button>}
        </form>
      </main>
    </div>
  )
}
