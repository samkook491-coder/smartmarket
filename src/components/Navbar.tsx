import { LogOut, Search, ShoppingBasket } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Navbar() {
  const { user, logout } = useAuthStore()
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
        <div className="navbar-actions">
          <Link className="icon-link" aria-label="Panier" to="/home#panier"><ShoppingBasket /></Link>
          {user && <button className="icon-link" aria-label="Se déconnecter" onClick={() => void signOut()}><LogOut /></button>}
        </div>
      </div>
    </header>
  )
}
