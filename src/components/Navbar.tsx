import { ChefHat, LogOut, Search, ShoppingBasket, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

export function Navbar() {
  const { user, logout, profile } = useAuthStore()
  const itemCount = useCartStore((state) => state.items.length)
  const navigate = useNavigate()
  const signOut = async () => {
    try {
      await logout()
      navigate('/onboarding')
    } catch (error) {
      console.error('Déconnexion impossible :', error)
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="brand" to="/home"><span className="brand-mark">S</span>Smartmarket</Link>
        <div className="search-box"><Search size={18} /><span>Rechercher des produits frais</span></div>
        {profile?.role === 'buyer' && <nav className="navbar-links" aria-label="Navigation du marché">
          <Link to="/menu"><Store size={16} /> Menu</Link>
          <Link to="/wholesale"><ChefHat size={16} /> En gros</Link>
        </nav>}
        <div className="navbar-actions">
          <Link className="icon-link cart-nav-link" aria-label={`Panier${itemCount ? `, ${itemCount} articles` : ''}`} to="/cart"><ShoppingBasket />{itemCount > 0 && <span className="cart-count">{itemCount}</span>}</Link>
          {user && <button className="icon-link" aria-label="Se déconnecter" onClick={() => void signOut()}><LogOut /></button>}
        </div>
      </div>
    </header>
  )
}
