import { ArrowRight, CirclePlus, ImageOff, Pencil, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { formatFCFA, getErrorMessage, requireSupabaseConfiguration } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'
import type { Product } from '../types/database'

type Filter = 'all' | 'published' | 'draft'

export function SellerDashboard() {
  const { user } = useAuthStore()
  const { shop, loading: shopLoading, fetchShop } = useShopStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        requireSupabaseConfiguration(isSupabaseConfigured)
        if (!user) throw new Error('Connectez-vous pour accéder à votre boutique.')
        await fetchShop(user.id)
        const { data, error: queryError } = await supabase.from('products')
          .select('*, product_images(*)').order('created_at', { ascending: false })
        if (queryError) throw queryError
        if (active) setProducts((data ?? []) as Product[])
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [fetchShop, user])

  const shownProducts = products.filter((product) => filter === 'all' || product.status === filter)
  const statusText = shop?.status === 'active' ? 'Boutique active' : shop?.status === 'suspended' ? 'Boutique suspendue' : 'En attente de validation'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content seller-content">
        <div className="seller-heading">
          <div><span className="eyebrow"><Store size={14} /> Espace vendeur</span><h1>Mes produits</h1><p className="muted">{shop?.name ?? 'Votre boutique Smartmarket'}</p></div>
          {shop && <Link className="button primary" to="/seller/product/new"><CirclePlus size={18} /> Ajouter un produit</Link>}
        </div>
        {shop && <div className={`shop-status ${shop.status}`}><span className="status-dot" /><div><strong>{statusText}</strong><p>{shop.status === 'pending' ? 'Votre boutique sera validée sous 24 à 48 h. Vous pouvez préparer vos produits en brouillon.' : shop.status === 'suspended' ? 'La publication est désactivée. Contactez Smartmarket pour obtenir de l’aide.' : 'Votre boutique peut publier des produits.'}</p></div></div>}
        {loading || shopLoading ? <Loading label="Chargement de votre boutique…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : !shop
          ? <div className="empty-state"><span>🏪</span><h3>Aucune boutique trouvée</h3><p>Complétez d’abord votre profil boutique.</p><Link to="/register/shop">Créer ma boutique <ArrowRight size={16} /></Link></div>
          : <>
            <div className="dashboard-toolbar"><div className="filter-tabs">
              {(['all', 'published', 'draft'] as Filter[]).map((value) => <button key={value} className={filter === value ? 'selected' : ''} onClick={() => setFilter(value)}>{value === 'all' ? 'Tous' : value === 'published' ? 'Publiés' : 'Brouillons'}{value === 'all' && <span>{products.length}</span>}</button>)}
            </div><span className="muted">{products.length} / 50 produits</span></div>
            {shownProducts.length ? <div className="seller-product-list">{shownProducts.map((product) => {
              const image = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url
              return <article className="seller-product-row" key={product.id}>
                <div className="seller-product-photo">{image ? <img src={image} alt="" /> : <ImageOff size={22} />}</div>
                <div className="seller-product-info"><strong>{product.name}</strong><span>{formatFCFA(product.price)} / {product.unit}</span></div>
                <span className={`status-pill ${product.status}`}>{product.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                <Link className="icon-link edit-link" aria-label={`Modifier ${product.name}`} to={`/seller/product/${product.id}/edit`}><Pencil size={17} /></Link>
              </article>
            })}</div> : <div className="empty-state"><span>🥬</span><h3>{filter === 'all' ? 'Votre étal est encore vide' : 'Aucun produit dans ce filtre'}</h3><p>Ajoutez vos produits pour les présenter aux acheteurs.</p>{filter === 'all' && <Link to="/seller/product/new">Ajouter votre premier produit <ArrowRight size={16} /></Link>}</div>}
          </>}
      </main>
    </div>
  )
}
