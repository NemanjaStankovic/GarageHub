import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'

export function MechanicRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-text-secondary">
        Loading…
      </div>
    )
  }

  if (!user || user.role !== 'Mechanic') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
