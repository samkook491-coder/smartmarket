import { ImageOff, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatFCFA } from '../lib/constants'
import type { Product } from '../types/database'

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const image = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url

  return (
    <button className="product-card" onClick={() => navigate(`/product/${product.id}`)} type="button">
      <div className="product-image">
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <ImageOff size={28} />}
        {!product.in_stock && <span className="stock-badge">Rupture</span>}
      </div>
      <div className="product-card-copy">
        <span className="product-name">{product.name}</span>
        <strong>{formatFCFA(product.price)}</strong>
        <span className="muted">/ {product.unit}</span>
        {product.shop?.commune && <span className="product-location"><MapPin size={13} />{product.shop.commune}</span>}
      </div>
    </button>
  )
}
