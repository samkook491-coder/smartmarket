import { ArrowLeft, ShoppingBasket } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { RAYONS } from '../lib/constants'

export function CategoryPage() {
  const { slug } = useParams()
  const category = RAYONS.find((item) => item.slug === slug)
  const { products, loading, error } = useProducts(category?.id)
  if (!category) return <main className="not-found"><ShoppingBasket /><h1>Rayon introuvable</h1><Link to="/home">Retour à l’accueil</Link></main>
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <Link className="back-link inline" to="/home"><ArrowLeft size={17} /> Tous les rayons</Link>
        <div className="category-title"><span>{category.emoji}</span><div><span className="eyebrow">Rayon Smartmarket</span><h1>{category.name}</h1></div></div>
        {loading ? <Loading label="Chargement des produits…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : products.length
          ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          : <div className="empty-state"><span>{category.emoji}</span><h3>Pas encore de produits dans ce rayon</h3><p>Revenez bientôt, nos vendeurs préparent leurs étals.</p></div>}
      </main>
      <BottomNav />
    </div>
  )
}
