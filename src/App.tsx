import { useEffect } from 'react'
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AddProduct } from './pages/AddProduct'
import { CategoryPage } from './pages/CategoryPage'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { ProductDetail } from './pages/ProductDetail'
import { Register } from './pages/Register'
import { RegisterRole } from './pages/RegisterRole'
import { RegisterShop } from './pages/RegisterShop'
import { SellerDashboard } from './pages/SellerDashboard'
import { useAuthStore } from './store/authStore'

function RootRedirect() {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <div className="page-loading">Préparation de Smartmarket…</div>
  if (!user) return <Navigate to="/onboarding" replace />
  if (profile?.role === 'seller') return <Navigate to="/seller/dashboard" replace />
  if (profile?.role === 'buyer') return <Navigate to="/home" replace />
  return <Navigate to="/register/role" replace />
}

function NotFound() {
  return <main className="not-found"><span>404</span><h1>Cette page n’existe pas</h1><Link to="/">Retour à l’accueil</Link></main>
}

function AppRoutes() {
  const initialize = useAuthStore((state) => state.initialize)
  useEffect(() => initialize(), [initialize])

  return <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/register/role" element={<RegisterRole />} />
      <Route element={<ProtectedRoute role="seller" />}>
        <Route path="/register/shop" element={<RegisterShop />} />
      </Route>
      <Route element={<ProtectedRoute role="buyer" />}>
        <Route path="/home" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Route>
      <Route element={<ProtectedRoute role="seller" />}>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/product/new" element={<AddProduct />} />
        <Route path="/seller/product/:id/edit" element={<AddProduct />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
}

export default function App() {
  return <HashRouter><AppRoutes /></HashRouter>
}
