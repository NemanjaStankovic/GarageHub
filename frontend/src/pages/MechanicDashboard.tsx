import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import * as vehicleServicesApi from '../api/vehicleServices.ts'
import { ApiError } from '../api/client.ts'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { StatusBadge } from '../components/ui/StatusBadge.tsx'
import { formatDate, formatPrice } from '../lib/format.ts'
import type { ServiceStatus, VehicleService } from '../types/vehicleService.ts'

type StatusFilter = 'All' | ServiceStatus

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Requested', label: 'Requested' },
  { value: 'InService', label: 'In service' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const statusOptions: { value: ServiceStatus; label: string }[] = [
  { value: 'Requested', label: 'Requested' },
  { value: 'InService', label: 'In service' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

type WorkFormState = {
  status: ServiceStatus
  mechanicNote: string
  finalPrice: string
}

function defaultWorkForm(job: VehicleService): WorkFormState {
  return {
    status: job.status,
    mechanicNote: '',
    finalPrice: job.finalPrice != null && job.finalPrice > 0 ? String(job.finalPrice) : '',
  }
}

function JobWorkCard({
  job,
  onUpdated,
}: {
  job: VehicleService
  onUpdated: () => void
}) {
  const [form, setForm] = useState<WorkFormState>(() => defaultWorkForm(job))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setForm(defaultWorkForm(job))
    setError(null)
    setSuccess(false)
  }, [job])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    const priceValue = form.finalPrice.trim()
    const parsedPrice = priceValue === '' ? undefined : Number(priceValue)

    if (parsedPrice !== undefined && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setError('Enter a valid price.')
      setIsSubmitting(false)
      return
    }

    try {
      await vehicleServicesApi.updateVehicleServiceWork(job.id, {
        status: form.status,
        mechanicNote: form.mechanicNote.trim() || undefined,
        finalPrice: parsedPrice,
      })
      setForm((prev) => ({ ...prev, mechanicNote: '' }))
      setSuccess(true)
      onUpdated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update job.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <li className="rounded-xl border border-border bg-surface-elevated p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-text-secondary">
            Job #{job.id} · Vehicle #{job.vehicleId}
          </p>
          <p className="mt-1 text-sm font-medium">{formatDate(job.requestedAt)}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mb-5 space-y-2 text-sm">
        <div>
          <dt className="text-text-secondary">Customer description</dt>
          <dd className="font-medium">{job.customerDescription?.trim() || '—'}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Current price</dt>
          <dd className="font-medium text-accent">{formatPrice(job.finalPrice)}</dd>
        </div>
        {job.mechanicNote?.trim() && (
          <div>
            <dt className="text-text-secondary">Mechanic notes</dt>
            <dd className="whitespace-pre-wrap rounded-lg bg-surface px-3 py-2 text-xs font-medium">
              {job.mechanicNote.trim()}
            </dd>
          </div>
        )}
      </dl>

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-4">
        <p className="text-sm font-medium text-text-primary">Update job</p>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Job updated successfully.
          </p>
        )}

        <div>
          <label htmlFor={`status-${job.id}`} className="mb-1.5 block text-sm text-text-secondary">
            Status
          </label>
          <select
            id={`status-${job.id}`}
            value={form.status}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, status: e.target.value as ServiceStatus }))
            }
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`note-${job.id}`} className="mb-1.5 block text-sm text-text-secondary">
            Note
          </label>
          <textarea
            id={`note-${job.id}`}
            rows={3}
            value={form.mechanicNote}
            onChange={(e) => setForm((prev) => ({ ...prev, mechanicNote: e.target.value }))}
            placeholder="Add a work note…"
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor={`price-${job.id}`} className="mb-1.5 block text-sm text-text-secondary">
            Final price
          </label>
          <input
            id={`price-${job.id}`}
            type="number"
            min="0"
            step="0.01"
            value={form.finalPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, finalPrice: e.target.value }))}
            placeholder="0.00"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </li>
  )
}

export function MechanicDashboard() {
  const [jobs, setJobs] = useState<VehicleService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All')

  const loadJobs = useCallback(async () => {
    setLoadError(null)
    try {
      const data = await vehicleServicesApi.getVehicleServices()
      setJobs(data)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load jobs.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'All') return jobs
    return jobs.filter((j) => j.status === activeFilter)
  }, [jobs, activeFilter])

  return (
    <>
      <PageHeader
        title="Mechanic Dashboard"
        description="View and update workshop jobs."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              activeFilter === value
                ? 'bg-accent/15 text-accent'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-text-secondary">Loading jobs…</p>}

      {loadError && (
        <p role="alert" className="text-sm text-red-300">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && filteredJobs.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-secondary">
          {jobs.length === 0 ? 'No jobs in the queue.' : 'No jobs match this filter.'}
        </p>
      )}

      {!isLoading && !loadError && filteredJobs.length > 0 && (
        <ul className="grid gap-4 xl:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobWorkCard key={job.id} job={job} onUpdated={loadJobs} />
          ))}
        </ul>
      )}
    </>
  )
}
