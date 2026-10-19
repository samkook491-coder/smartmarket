import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { Navbar } from '../components/Navbar'
import { formatFCFA } from '../lib/constants'
import { quantityStep, useCartStore, type CartItem } from '../store/cartStore'

function whatsappOrder(items: CartItem[]): string {
  const first = items[0].product
  const lines = items.map(({ product, quantity }) =>
    `- ${product.name} : ${quantity} ${product.unit} (${formatFCFA(product.price * quantity)})`)
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const message = `Bonjour ${first.shop?.name ?? ''}, je souhaite commander :\n${lines.join('\n')}\nTotal estimé : ${formatFCFA(total)}`
  return `https://wa.me/${first.shop?.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

export function Cart() {
  const items = useCartStore((state) => state.items)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const groups = Object.values(items.reduce<Record<string, CartItem[]>>((grouped, item) => {
    const shopId = item.product.shop_id
    grouped[shopId] = [...(grouped[shopId] ?? []), item]
    return grouped
  }, {}))
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content cart-page">
        <Link className="back-link inline" to="/menu"><ArrowLeft size={17} /> Continuer mes achats</Link>
        <div className="section-heading cart-heading"><div><span className="eyebrow">Vos sélections</span><h1>Mon panier</h1></div></div>
        {items.length === 0
          ? <div className="empty-state"><ShoppingBasket size={34} /><h3>Votre panier est vide</h3><p>Ajoutez des produits au panier depuis le menu ou un rayon.</p><Link to="/menu">Parcourir le menu <ArrowLeft size={16} /></Link></div>
          : <>
            <div className="cart-list">{items.map(({ product, quantity }) => {
              const step = quantityStep(product.unit)
              const available = Number(product.available_quantity)
              const nextQuantity = Number((quantity + step).toFixed(2))
              return <article className="cart-row" key={product.id}>
                <div className="cart-item-info"><strong>{product.name}</strong><span>{formatFCFA(product.price)} / {product.unit} · {product.shop?.name ?? 'Vendeur Smartmarket'}</span></div>
                <div className="cart-quantity">
                  <button type="button" aria-label={`Diminuer ${product.name}`} onClick={() => setQuantity(product.id, quantity - step)}><Minus size={15} /></button>
                  <span>{quantity} {product.unit}</span>
                  <button type="button" aria-label={`Augmenter ${product.name}`} disabled={nextQuantity > available} onClick={() => setQuantity(product.id, nextQuantity)}><Plus size={15} /></button>
                </div>
                <strong className="cart-line-total">{formatFCFA(product.price * quantity)}</strong>
                <button type="button" className="cart-remove" aria-label={`Retirer ${product.name}`} onClick={() => removeItem(product.id)}><Trash2 size={17} /></button>
              </article>
            })}</div>
            <aside className="cart-summary">
              <div><span>Total estimé</span><strong>{formatFCFA(total)}</strong></div>
              <p>Les demandes sont envoyées séparément à chaque vendeur. Le prix final et la livraison seront confirmés avec lui.</p>
              {groups.map((group) => {
                const phone = group[0].product.shop?.whatsapp?.replace(/\D/g, '')
                return phone
                  ? <a key={group[0].product.shop_id} className="button primary full" href={whatsappOrder(group)} target="_blank" rel="noreferrer">Commander chez {group[0].product.shop?.name ?? 'le vendeur'}</a>
                  : <p className="feedback notice" key={group[0].product.shop_id}>Le vendeur {group[0].product.shop?.name ?? ''} n’a pas renseigné de numéro WhatsApp.</p>
              })}
            </aside>
          </>}
      </main>
      <BottomNav />
    </div>
  )
}
