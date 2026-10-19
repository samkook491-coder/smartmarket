import { ArrowRight, Store } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { CategoryCard } from '../components/CategoryCard'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { RAYONS } from '../lib/constants'
import { useProducts } from '../hooks/useProducts'

export function MarketMenu() {
  const { products, loading, error } = useProducts()
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#rayons') document.getElementById('rayons')?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content market-menu-page">
        <section className="market-menu-banner">
          <span className="eyebrow"><Store size={14} /> Le marché Smartmarket</span>
          <h1>Le menu du marché</h1>
          <p>Parcourez les rayons, découvrez les produits de nos vendeurs et ajoutez vos achats au panier.</p>
          <Link className="button primary" to="/wholesale">Vous êtes restaurateur ? <ArrowRight size={16} /></Link>
        </section>
        <section className="section-block" id="rayons">
          <div className="section-heading"><div><span className="eyebrow">À découvrir</span><h2>Nos rayons</h2></div><span className="section-aside">{RAYONS.length} catégories</span></div>
          <div className="category-grid">{RAYONS.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
        </section>
        <section className="section-block">
          <div className="section-heading"><div><span className="eyebrow">Disponibles chez nos vendeurs</span><h2>Les produits du marché</h2></div></div>
          {loading ? <Loading label="Chargement des produits…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : products.length
            ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            : <div className="empty-state"><span>🧺</span><h3>Le marché se prépare</h3><p>Les produits publiés par nos vendeurs apparaîtront ici.</p></div>}
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
