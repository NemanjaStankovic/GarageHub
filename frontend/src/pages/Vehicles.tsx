import { useCallback, useEffect, useState, type FormEvent } from 'react'
import * as vehiclesApi from '../api/vehicles.ts'
import { ApiError } from '../api/client.ts'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import type { Vehicle } from '../types/vehicle.ts'

export function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadVehicles = useCallback(async () => {
    setLoadError(null)
    try {
      const data = await vehiclesApi.getMyVehicles()
      setVehicles(data)
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load vehicles.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      await vehiclesApi.createVehicle({
        make: make.trim(),
        model: model.trim(),
      })
      setMake('')
      setModel('')
      await loadVehicles()
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Failed to create vehicle.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage vehicles linked to your account."
      />

      <div className="mb-8 rounded-xl border border-border bg-surface-elevated p-5">
        <h2 className="mb-4 text-sm font-medium text-text-secondary">Add vehicle</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formError && (
            <p
              role="alert"
              className="sm:col-span-2 lg:col-span-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {formError}
            </p>
          )}
          <div>
            <label htmlFor="make" className="mb-1.5 block text-sm font-medium text-text-secondary">
              Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Toyota"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-text-secondary">
              Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Corolla"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Adding…' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <p className="text-sm text-text-secondary">Loading vehicles…</p>
      )}

      {loadError && (
        <p role="alert" className="text-sm text-red-300">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && vehicles.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-secondary">
          No vehicles yet. Add your first vehicle above.
        </p>
      )}

      {!isLoading && !loadError && vehicles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              className="rounded-xl border border-border bg-surface-elevated p-5 transition hover:border-accent/40"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <CarIcon />
              </div>
              <h3 className="text-lg font-semibold">
                {vehicle.make} {vehicle.model}
              </h3>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-text-secondary">Make</dt>
                  <dd className="font-medium">{vehicle.make}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-secondary">Model</dt>
                  <dd className="font-medium">{vehicle.model}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-secondary">ID</dt>
                  <dd className="font-mono text-xs text-text-secondary">#{vehicle.id}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function CarIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 17h.01M16 17h.01M5 11h14l-1-4H6l-1 4zm2-6h6m-6 0l-1 4m7-4l1 4"
      />
    </svg>
  )
}
