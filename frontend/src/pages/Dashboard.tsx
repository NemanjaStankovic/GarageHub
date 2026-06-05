import { Navigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { PlaceholderCard } from '../components/ui/PlaceholderCard.tsx'
import { useAuth } from '../context/AuthContext.tsx'

export function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />
  }

  if (user?.role === 'Mechanic') {
    return <Navigate to="/mechanic" replace />
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          user
            ? `Welcome back, ${user.email}. Overview of vehicles and service requests.`
            : 'Overview of vehicles and service requests.'
        }
      />
      {user && (
        <p className="-mt-4 mb-6 text-sm text-text-secondary">
          Signed in as <span className="font-medium text-accent">{user.email}</span>
          {' · '}
          {user.role}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PlaceholderCard title="Active requests">
          <p className="text-3xl font-semibold text-accent">—</p>
          <p className="mt-1 text-xs text-text-secondary">In progress</p>
        </PlaceholderCard>
        <PlaceholderCard title="Your vehicles">
          <p className="text-3xl font-semibold text-text-primary">—</p>
          <p className="mt-1 text-xs text-text-secondary">Registered</p>
        </PlaceholderCard>
        <PlaceholderCard title="Completed this month">
          <p className="text-3xl font-semibold text-text-primary">—</p>
          <p className="mt-1 text-xs text-text-secondary">Services done</p>
        </PlaceholderCard>
      </div>
    </>
  )
}
