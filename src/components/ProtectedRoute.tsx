import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/database'

export function ProtectedRoute({ role }: { role?: UserRole }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <div className="page-loading">Chargement de votre espace…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) {
    return <Navigate to={profile?.role === 'seller' ? '/seller/dashboard' : '/home'} replace />
  }
  return <Outlet />
}
