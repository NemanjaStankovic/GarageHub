import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { PlaceholderCard } from '../components/ui/PlaceholderCard.tsx'
import { useAuth } from '../context/AuthContext.tsx'
import * as vehicleApi from '../api/vehicles.ts'
import * as vehicleServicesApi from '../api/vehicleServices.ts'

function isCompletedThisMonth(completedAt: string | null) {
  if (!completedAt) return false
  const completedDate = new Date(completedAt)
  if (Number.isNaN(completedDate.getTime())) return false
  const now = new Date()
  return (
    completedDate.getUTCFullYear() === now.getUTCFullYear() &&
    completedDate.getUTCMonth() === now.getUTCMonth()
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null)
  const [activeRequestsCount, setActiveRequestsCount] = useState<number | null>(null)
  const [completedThisMonthCount, setCompletedThisMonthCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'Customer') {
      return
    }

    let isCancelled = false

    async function loadDashboard() {
      const [vehicles, services] = await Promise.all([
        vehicleApi.getMyVehicles(),
        vehicleServicesApi.getMyVehicleServices(),
      ])

      if (isCancelled) return

      setVehiclesCount(vehicles.length)
      setActiveRequestsCount(
        services.filter((service) =>
          service.status === 'Requested' || service.status === 'InService',
        ).length,
      )
      setCompletedThisMonthCount(
        services.filter(
          (service) => service.status === 'Completed' && isCompletedThisMonth(service.completedAt),
        ).length,
      )
    }

    loadDashboard().catch(() => {
      if (!isCancelled) {
        setVehiclesCount(0)
        setActiveRequestsCount(0)
        setCompletedThisMonthCount(0)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [user])

  if (user?.role === 'Admin') {
    return <Navigate to="/admin" replace />
  }

  if (user?.role === 'Mechanic') {
    return <Navigate to="/mechanic" replace />
  }

  const formatValue = (value: number | null) =>
    value === null ? '—' : String(value)

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
          <p className="text-3xl font-semibold text-accent">{formatValue(activeRequestsCount)}</p>
          <p className="mt-1 text-xs text-text-secondary">In progress</p>
        </PlaceholderCard>
        <PlaceholderCard title="Your vehicles">
          <p className="text-3xl font-semibold text-text-primary">{formatValue(vehiclesCount)}</p>
          <p className="mt-1 text-xs text-text-secondary">Registered</p>
        </PlaceholderCard>
        <PlaceholderCard title="Completed this month">
          <p className="text-3xl font-semibold text-text-primary">{formatValue(completedThisMonthCount)}</p>
          <p className="mt-1 text-xs text-text-secondary">Services done</p>
        </PlaceholderCard>
      </div>
    </>
  )
}
