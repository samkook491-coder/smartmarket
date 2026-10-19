import { ChefHat, Grid2X2, Home, Menu, ShoppingCart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const items = [
  { to: '/home', label: 'Accueil', icon: Home, active: (path: string) => path === '/home' },
  { to: '/menu#rayons', label: 'Rayons', icon: Grid2X2, active: (path: string, hash: string) => path.startsWith('/category/') || (path === '/menu' && hash === '#rayons') },
  { to: '/cart', label: 'Panier', icon: ShoppingCart, active: (path: string) => path === '/cart' },
  { to: '/menu', label: 'Menu', icon: Menu, active: (path: string, hash: string) => path === '/menu' && hash !== '#rayons' },
  { to: '/wholesale', label: 'En gros', icon: ChefHat, active: (path: string) => path === '/wholesale' },
]

export function BottomNav() {
  const { pathname, hash } = useLocation()
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {items.map(({ to, label, icon: Icon, active }) => (
        <Link key={label} to={to} className={`bottom-nav-item${active(pathname, hash) ? ' active' : ''}`}>
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}
