import { ArrowRight, ChefHat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

export function Wholesale() {
  const { products, loading, error } = useProducts()
  const availableProducts = products.filter((product) => product.in_stock && Number(product.available_quantity) > 0)

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content wholesale-page">
        <section className="wholesale-banner">
          <span className="eyebrow"><ChefHat size={15} /> Espace professionnels</span>
          <h1>Les achats en gros</h1>
          <p>Restaurants, maquis et professionnels : choisissez vos produits et quantités selon le stock disponible, puis envoyez votre demande directement au vendeur.</p>
          <Link className="button light-button" to="/cart">Voir mon panier <ArrowRight size={16} /></Link>
        </section>
        <div className="section-heading wholesale-heading"><div><span className="eyebrow">Volumes disponibles</span><h2>Approvisionnez votre cuisine</h2></div></div>
        {loading ? <Loading label="Chargement du stock disponible…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : availableProducts.length
          ? <div className="product-grid">{availableProducts.map((product) => <ProductCard key={product.id} product={product} wholesale />)}</div>
          : <div className="empty-state"><span>🧺</span><h3>Aucun produit disponible pour le moment</h3><p>Les produits seront proposés ici dès que les vendeurs auront renseigné leur stock.</p><Link to="/menu">Voir le menu du marché <ArrowRight size={16} /></Link></div>}
      </main>
      <BottomNav />
    </div>
  )
}
