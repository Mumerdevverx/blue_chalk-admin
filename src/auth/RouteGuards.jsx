import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

function AuthLoading() {
  return <div className="min-h-screen flex items-center justify-center">Checking session...</div>
}

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
