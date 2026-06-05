import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import * as usersApi from '../api/users.ts'
import * as vehicleServicesApi from '../api/vehicleServices.ts'
import * as servicesApi from '../api/services.ts'
import { ApiError } from '../api/client.ts'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import type { AdminStats, UserDto } from '../types/user.ts'
import type { ServiceStatus, VehicleService } from '../types/vehicleService.ts'
import type { Service } from '../types/service.ts'

type StatusFilter = 'All' | ServiceStatus

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Requested', label: 'Requested' },
  { value: 'InService', label: 'In service' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated p-5 glass-panel">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-accent">{value}</p>
    </div>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [mechanics, setMechanics] = useState<UserDto[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [jobs, setJobs] = useState<VehicleService[]>([])
  const [jobStatusFilter, setJobStatusFilter] = useState<StatusFilter>('All')
  const [jobMechanicFilter, setJobMechanicFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJobsLoading, setIsJobsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoadError(null)
    try {
      const [statsData, mechanicsData] = await Promise.all([
        usersApi.getAdminStats(),
        usersApi.getMechanics(),
      ])
      setStats(statsData)
      setMechanics(mechanicsData)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadServices = useCallback(async () => {
    setServicesError(null)
    try {
      const servicesData = await servicesApi.getServices()
      setServices(servicesData)
    } catch (err) {
      setServicesError(err instanceof ApiError ? err.message : 'Failed to load services.')
      setServices([])
    }
  }, [])

  const loadJobs = useCallback(async () => {
    setJobsError(null)
    setIsJobsLoading(true)
    try {
      const query: {
        mechanicId?: number
        serviceStatuses?: ServiceStatus[]
      } = {}

      if (jobMechanicFilter) {
        const mechanicId = Number(jobMechanicFilter)
        if (!Number.isNaN(mechanicId)) {
          query.mechanicId = mechanicId
        }
      }

      if (jobStatusFilter !== 'All') {
        query.serviceStatuses = [jobStatusFilter]
      }

      const jobsData = await vehicleServicesApi.getVehicleServices(query)
      setJobs(jobsData)
    } catch (err) {
      setJobsError(err instanceof ApiError ? err.message : 'Failed to load service jobs.')
    } finally {
      setIsJobsLoading(false)
    }
  }, [jobMechanicFilter, jobStatusFilter])

  useEffect(() => {
    loadDashboard()
    loadServices()
  }, [loadDashboard, loadServices])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  async function handleRegisterMechanic(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setIsSubmitting(true)

    try {
      const created = await usersApi.registerMechanic({
        email: email.trim(),
        password,
      })
      setEmail('')
      setPassword('')
      setFormSuccess(`Mechanic ${created.email} created successfully.`)
      await loadDashboard()
      await loadJobs()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to register mechanic.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const mechanicOptions = useMemo(
    () => [{ id: 0, email: 'All mechanics', role: '', isActive: true }, ...mechanics],
    [mechanics],
  )

  const mechanicEmailById = useMemo(() => {
    const map = new Map<number, string>()
    mechanics.forEach((mechanic) => map.set(mechanic.id, mechanic.email))
    return map
  }, [mechanics])

  const serviceNameById = useMemo(() => {
    const map = new Map<number, string>()
    services.forEach((service) => map.set(service.id, service.name))
    return map
  }, [services])

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of the workshop and user management."
      />

      {isLoading && <p className="text-sm text-text-secondary">Loading dashboard…</p>}

      {loadError && (
        <p role="alert" className="mb-6 text-sm text-red-300">
          {loadError}
        </p>
      )}

      {servicesError && (
        <p role="alert" className="mb-6 text-sm text-red-300">
          {servicesError}
        </p>
      )}

      {!isLoading && !loadError && stats && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Users" value={stats.usersCount} />
            <StatCard label="Mechanics" value={stats.mechanicsCount} />
            <StatCard label="Vehicles" value={stats.vehiclesCount} />
            <StatCard label="Open requests" value={stats.openRequestsCount} />
          </div>

          <div className="mb-8 rounded-xl border border-border bg-surface-elevated p-5 glass-panel">
            <div className="mb-6 grid gap-4 md:grid-cols-3 md:items-end">
              <div>
                <h2 className="text-sm font-medium text-text-secondary">All service requests</h2>
                <p className="mt-1 text-xs text-text-secondary">
                  View every vehicle service request and filter by mechanic or status.
                </p>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs text-text-secondary">Mechanic</span>
                <select
                  value={jobMechanicFilter}
                  onChange={(e) => setJobMechanicFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {mechanicOptions.map((mechanic) => (
                    <option key={mechanic.id} value={mechanic.id === 0 ? '' : mechanic.id}>
                      {mechanic.id === 0 ? mechanic.email : mechanic.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs text-text-secondary">Status</span>
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value as StatusFilter)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {statusFilters.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isJobsLoading && (
              <p className="text-sm text-text-secondary">Loading service jobs…</p>
            )}

            {jobsError && (
              <p role="alert" className="mb-4 text-sm text-red-300">
                {jobsError}
              </p>
            )}

            {!isJobsLoading && !jobsError && jobs.length === 0 && (
              <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-secondary">
                No service jobs found.
              </p>
            )}

            {!isJobsLoading && !jobsError && jobs.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-muted text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Vehicle</th>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Mechanic</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Requested</th>
                      <th className="px-4 py-3 font-medium">Completed</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{job.id}</td>
                        <td className="px-4 py-3">
                          #{job.vehicleId}
                          {job.vehicleMake && job.vehicleModel ? ` — ${job.vehicleMake} ${job.vehicleModel}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          {job.serviceId != null
                            ? serviceNameById.get(job.serviceId) ?? `Service #${job.serviceId}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {job.mechanicId
                            ? mechanicEmailById.get(job.mechanicId) ?? `#${job.mechanicId}`
                            : 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{job.status}</td>
                        <td className="px-4 py-3">{new Date(job.requestedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{job.completedAt ? new Date(job.completedAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-accent">{job.finalPrice ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-8 rounded-xl border border-border bg-surface-elevated p-5 glass-panel">
            <h2 className="mb-4 text-sm font-medium text-text-secondary">Register mechanic</h2>
            <form
              onSubmit={handleRegisterMechanic}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {formError && (
                <p
                  role="alert"
                  className="sm:col-span-2 lg:col-span-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                >
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="sm:col-span-2 lg:col-span-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {formSuccess}
                </p>
              )}
              <div>
                <label htmlFor="mechanic-email" className="mb-1.5 block text-sm text-text-secondary">
                  Email
                </label>
                <input
                  id="mechanic-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mechanic@example.com"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label htmlFor="mechanic-password" className="mb-1.5 block text-sm text-text-secondary">
                  Password
                </label>
                <input
                  id="mechanic-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <p className="mt-2 text-xs text-text-secondary">
                  Min. 8 chars, uppercase, number, and special character.
                </p>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating…' : 'Create mechanic'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-5 glass-panel">
            <h2 className="mb-4 text-sm font-medium text-text-secondary">Mechanics</h2>
            {mechanics.length === 0 ? (
              <p className="text-sm text-text-secondary">No mechanics registered yet.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-muted text-text-secondary">
                    <tr>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mechanics.map((mechanic) => (
                      <tr key={mechanic.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{mechanic.email}</td>
                        <td className="hidden px-4 py-3 text-text-secondary sm:table-cell">
                          {mechanic.role}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${mechanic.isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-surface-muted text-text-secondary'
                              }`}
                          >
                            {mechanic.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
