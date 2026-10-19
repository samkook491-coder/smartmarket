import { ArrowLeft, ImageOff, MapPin, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { formatFCFA } from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Product } from '../types/database'

export function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!isSupabaseConfigured) {
        setError('Connectez Supabase pour afficher la fiche produit.')
        setLoading(false)
        return
      }
      if (!id) {
        setError('Identifiant de produit manquant.')
        setLoading(false)
        return
      }
      const { data, error: queryError } = await supabase.from('products')
        .select('*, shop:shops(name, commune, whatsapp, status), product_images(*)').eq('id', id).single()
      if (!active) return
      if (queryError) setError(queryError.message)
      else setProduct(data as Product)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [id])

  const images = [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position)
  const whatsapp = product?.shop?.whatsapp?.replace(/\D/g, '')

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content detail-content">
        <Link className="back-link inline" to="/home"><ArrowLeft size={17} /> Retour au marché</Link>
        {loading ? <Loading label="Chargement du produit…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : product && <>
          <div className="product-detail">
            <div className="detail-photo">
              {images[imageIndex] ? <img src={images[imageIndex].url} alt={product.name} /> : <ImageOff size={48} />}
              {images.length > 1 && <div className="carousel-dots">{images.map((image, index) => <button key={image.id} aria-label={`Photo ${index + 1}`} className={index === imageIndex ? 'current' : ''} onClick={() => setImageIndex(index)} />)}</div>}
            </div>
            <div className="detail-copy">
              <span className={`status-pill ${product.in_stock ? 'available' : 'unavailable'}`}>{product.in_stock ? 'En stock' : 'En rupture'}</span>
              <h1>{product.name}</h1>
              <div className="detail-price">{formatFCFA(product.price)} <span>/ {product.unit}</span></div>
              {product.description && <p>{product.description}</p>}
              <div className="seller-panel"><div className="seller-avatar">S</div><div><strong>{product.shop?.name ?? 'Vendeur Smartmarket'}</strong><span><MapPin size={14} /> {product.shop?.commune ?? 'Abidjan'}</span></div></div>
              {whatsapp
                ? <a className="button primary full" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par ${product.name}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Contacter le vendeur</a>
                : <div className="feedback notice">Ce vendeur n’a pas encore renseigné son numéro WhatsApp.</div>}
              <p className="muted detail-phase-note">La commande en ligne arrive bientôt. Contactez le vendeur directement pour le moment.</p>
            </div>
          </div>
        </>}
      </main>
      <BottomNav />
    </div>
  )
}
