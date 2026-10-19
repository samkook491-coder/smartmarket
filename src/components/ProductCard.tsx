import { ImageOff, MapPin, ShoppingBasket } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatFCFA } from '../lib/constants'
import { quantityStep, useCartStore } from '../store/cartStore'
import type { Product } from '../types/database'

export function ProductCard({ product, wholesale = false }: { product: Product; wholesale?: boolean }) {
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const image = [...(product.product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url
  const availableQuantity = Number(product.available_quantity)

  return (
    <article className={`product-card${wholesale ? ' wholesale-product-card' : ''}`}>
      <div className="product-image">
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <ImageOff size={28} />}
        {!product.in_stock || availableQuantity <= 0 ? <span className="stock-badge">Rupture</span> : null}
      </div>
      <button className="product-card-copy" onClick={() => navigate(`/product/${product.id}`)} type="button">
        <span className="product-name">{product.name}</span>
        <strong>{formatFCFA(product.price)}</strong>
        <span className="muted">/ {product.unit}</span>
        {product.shop?.commune && <span className="product-location"><MapPin size={13} />{product.shop.commune}</span>}
        <span className="product-availability">{availableQuantity} {product.unit} disponible(s)</span>
      </button>
      {wholesale && <WholesaleQuantity product={product} />}
      {!wholesale && <button
        className="add-to-cart-button"
        type="button"
        disabled={!product.in_stock || availableQuantity <= 0}
        onClick={() => addItem(product)}
      ><ShoppingBasket size={16} /> Ajouter au panier</button>}
    </article>
  )
}

function WholesaleQuantity({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const available = Number(product.available_quantity)
  const step = quantityStep(product.unit)
  const initialQuantity = Math.min(available, Math.max(step, step * 10))
  const [quantity, setQuantity] = useState(String(initialQuantity))
  const parsedQuantity = Number(quantity)
  const canOrder = product.in_stock && available > 0
  const validQuantity = quantity.trim() !== '' && Number.isFinite(parsedQuantity)
    && parsedQuantity > 0 && parsedQuantity <= available
  return (
    <div className="wholesale-card-actions">
      <label>Quantité ({product.unit})
        <input
          type="number"
          min={Math.min(step, available)}
          max={available}
          step={step}
          value={quantity}
          disabled={!canOrder}
          onChange={(event) => setQuantity(event.target.value)}
        />
      </label>
      <button type="button" className="add-to-cart-button" disabled={!canOrder || !validQuantity} onClick={() => addItem(product, parsedQuantity)}>
        <ShoppingBasket size={16} /> Ajouter
      </button>
    </div>
  )
}
