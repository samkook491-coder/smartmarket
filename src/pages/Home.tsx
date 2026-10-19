import { ArrowRight, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { CategoryCard } from '../components/CategoryCard'
import { ErrorMessage, Loading } from '../components/Feedback'
import { Navbar } from '../components/Navbar'
import { ProductCard } from '../components/ProductCard'
import { RAYONS } from '../lib/constants'
import { useProducts } from '../hooks/useProducts'
import { useAuthStore } from '../store/authStore'

export function Home() {
  const { products, loading, error } = useProducts()
  const profile = useAuthStore((state) => state.profile)
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><MapPin size={14} /> Marché local · Abidjan</span>
            <h1>Le meilleur du marché,<br /><span>juste à côté.</span></h1>
            <p>Des produits frais de vendeurs locaux, à portée de main{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.</p>
            <a className="button light-button" href="#rayons">Explorer les rayons <ArrowRight size={17} /></a>
          </div>
          <div className="hero-illustration" aria-hidden="true"><span>🥑</span><span>🍅</span><span>🥬</span><i>100%<br />local</i></div>
        </section>
        <section className="section-block" id="rayons">
          <div className="section-heading"><div><span className="eyebrow">La fraîcheur au rendez-vous</span><h2>Explorer les rayons</h2></div><span className="section-aside">6 catégories</span></div>
          <div className="category-grid">{RAYONS.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
        </section>
        <section className="section-block">
          <div className="section-heading"><div><span className="eyebrow"><Sparkles size={14} /> Sélection du marché</span><h2>Produits récents</h2></div></div>
          {loading ? <Loading label="Recherche des nouveautés…" /> : error ? <ErrorMessage>{error}</ErrorMessage> : products.length ? <div className="product-grid">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>🧺</span><h3>Le marché se prépare</h3><p>Les nouveautés de nos vendeurs apparaîtront ici.</p><Link to="/category/legumes-frais">Découvrir les rayons <ArrowRight size={16} /></Link></div>}
        </section>
      </main>
      <footer className="site-footer"><span>Smartmarket · Le marché local, chez vous.</span><span>Fait avec soin en Côte d’Ivoire <b>♥</b></span></footer>
      <BottomNav />
    </div>
  )
}
