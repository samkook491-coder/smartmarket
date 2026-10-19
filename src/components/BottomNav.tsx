import { Grid2X2, Home, Menu, ShoppingCart } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/home', label: 'Accueil', icon: Home },
  { to: '/home#rayons', label: 'Rayons', icon: Grid2X2 },
  { to: '/home#panier', label: 'Panier', icon: ShoppingCart },
  { to: '/home#menu', label: 'Menu', icon: Menu },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={label} to={to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
