import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as servicesApi from '../api/services.ts'
import * as vehiclesApi from '../api/vehicles.ts'
import * as vehicleServicesApi from '../api/vehicleServices.ts'
import { ApiError } from '../api/client.ts'
import { PageHeader } from '../components/ui/PageHeader.tsx'
import { StatusBadge } from '../components/ui/StatusBadge.tsx'
import { formatDate, formatPrice } from '../lib/format.ts'
import type { Service } from '../types/service.ts'
import type { Vehicle } from '../types/vehicle.ts'
import type { ServiceStatus, VehicleService } from '../types/vehicleService.ts'

type StatusFilter = 'All' | ServiceStatus

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Requested', label: 'Requested' },
  { value: 'InService', label: 'In service' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const NO_SERVICE = ''

export function ServiceRequests() {
  const [requests, setRequests] = useState<VehicleService[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All')

  const [vehicleId, setVehicleId] = useState('')
  const [serviceId, setServiceId] = useState(NO_SERVICE)
  const [customerDescription, setCustomerDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const activeServices = useMemo(
    () => services.filter((s) => s.isActive),
    [services],
  )

  const serviceNameById = useMemo(() => {
    const map = new Map<number, string>()
    services.forEach((s) => map.set(s.id, s.name))
    return map
  }, [services])

  const vehicleLabelById = useMemo(() => {
    const map = new Map<number, string>()
    vehicles.forEach((v) => map.set(v.id, `${v.make} ${v.model}`))
    return map
  }, [vehicles])

  const loadPageData = useCallback(async () => {
    setLoadError(null)
    try {
      const [requestsData, vehiclesData, servicesData] = await Promise.all([
        vehicleServicesApi.getMyVehicleServices(),
        vehiclesApi.getMyVehicles(),
        servicesApi.getServices(),
      ])
      setRequests(requestsData)
      setVehicles(vehiclesData)
      setServices(servicesData)
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load service requests.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPageData()
  }, [loadPageData])

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'All') return requests
    return requests.filter((r) => r.status === activeFilter)
  }, [requests, activeFilter])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const parsedVehicleId = Number(vehicleId)
    if (!vehicleId || Number.isNaN(parsedVehicleId)) {
      setFormError('Please select a vehicle.')
      return
    }

    const parsedServiceId =
      serviceId === NO_SERVICE ? undefined : Number(serviceId)
    const validServiceId =
      parsedServiceId != null && !Number.isNaN(parsedServiceId) && parsedServiceId > 0
        ? parsedServiceId
        : undefined

    setIsSubmitting(true)
    try {
      await vehicleServicesApi.createVehicleService({
        vehicleId: parsedVehicleId,
        serviceId: validServiceId,
        customerDescription: customerDescription.trim() || undefined,
      })
      setCustomerDescription('')
      setServiceId(NO_SERVICE)
      setFormSuccess('Service request submitted successfully.')
      await loadPageData()
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Failed to submit service request.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Service Requests"
        description="Submit new requests and track workshop jobs."
      />

      <div className="mb-8 rounded-xl border border-border bg-surface-elevated p-5">
        <h2 className="mb-1 text-sm font-medium text-text-secondary">New service request</h2>
        <p className="mb-4 text-xs text-text-secondary">
          Vehicle is required. Service type and description are optional.
        </p>

        {vehicles.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Add a vehicle first on the{' '}
            <Link to="/vehicles" className="text-accent hover:text-accent-hover">
              Vehicles
            </Link>{' '}
            page.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {formSuccess}
              </p>
            )}

            <div>
              <label htmlFor="vehicle" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Vehicle <span className="text-accent">*</span>
              </label>
              <select
                id="vehicle"
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="">Select your vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Service type <span className="font-normal text-text-secondary">(optional)</span>
              </label>
              <select
                id="service"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value={NO_SERVICE}>No specific service</option>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(s.basePrice)}
                  </option>
                ))}
              </select>
            </div>

            {activeServices.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-text-secondary">Available services</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {activeServices.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-2 text-text-secondary">{formatPrice(s.basePrice)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Description <span className="font-normal text-text-secondary">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={customerDescription}
                onChange={(e) => setCustomerDescription(e.target.value)}
                placeholder="Describe the issue or what you need…"
                className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-text-secondary/60 focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeFilter === value
                ? 'bg-accent/15 text-accent'
                : 'bg-surface-muted text-text-secondary hover:text-text-primary'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-sm text-text-secondary">Loading service requests…</p>
      )}

      {loadError && (
        <p role="alert" className="text-sm text-red-300">
          {loadError}
        </p>
      )}

      {!isLoading && !loadError && filteredRequests.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-secondary">
          {requests.length === 0
            ? 'No service requests yet.'
            : 'No requests match this filter.'}
        </p>
      )}

      {!isLoading && !loadError && filteredRequests.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {filteredRequests.map((request) => (
            <li
              key={request.id}
              className="rounded-xl border border-border bg-surface-elevated p-5"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-secondary">
                  Request #{request.id}
                  {(request.vehicleMake || request.vehicleModel || vehicleLabelById.has(request.vehicleId)) && (
                    <>
                      {' '}
                      ·{' '}
                      {request.vehicleMake || request.vehicleModel
                        ? `${request.vehicleMake ?? ''} ${request.vehicleModel ?? ''}`.trim()
                        : vehicleLabelById.get(request.vehicleId)}
                    </>
                  )}
                </p>
                <StatusBadge status={request.status} />
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-text-secondary">Date</dt>
                  <dd className="mt-0.5 font-medium">
                    {formatDate(request.requestedAt)}
                    {request.completedAt && (
                      <span className="text-text-secondary">
                        {' '}
                        · Completed {formatDate(request.completedAt)}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Service</dt>
                  <dd className="mt-0.5 font-medium">
                    {request.serviceId != null
                      ? serviceNameById.get(request.serviceId) ?? `Service #${request.serviceId}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Description</dt>
                  <dd className="mt-0.5 font-medium">
                    {request.customerDescription?.trim() || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Price</dt>
                  <dd className="mt-0.5 font-medium text-accent">
                    {formatPrice(request.finalPrice)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
