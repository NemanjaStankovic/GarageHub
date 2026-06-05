import type {
  CreateVehicleServiceRequest,
  ServiceStatus,
  UpdateVehicleServiceRequest,
  UpdateVehicleServiceWorkRequest,
  VehicleService,
  VehicleServiceQuery,
} from '../types/vehicleService.ts'
import { apiRequest } from './client.ts'

const STATUS_BY_NUMBER: Record<number, ServiceStatus> = {
  0: 'Requested',
  1: 'InService',
  2: 'Completed',
  3: 'Cancelled',
}

type RawVehicleService = Omit<VehicleService, 'status'> & {
  status: ServiceStatus | number
}

function normalizeStatus(status: ServiceStatus | number): ServiceStatus {
  if (typeof status === 'string') return status
  return STATUS_BY_NUMBER[status] ?? 'Requested'
}

function normalizeService(raw: RawVehicleService): VehicleService {
  return { ...raw, status: normalizeStatus(raw.status) }
}

function buildQueryString(query?: VehicleServiceQuery) {
  if (!query) return ''
  const params = new URLSearchParams()
  if (query.vehicleId != null) params.append('vehicleId', String(query.vehicleId))
  if (query.mechanicId != null) params.append('mechanicId', String(query.mechanicId))
  query.serviceStatuses?.forEach((status) => params.append('serviceStatuses', status))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function fetchVehicleServices(path: string) {
  const data = await apiRequest<RawVehicleService[]>(path)
  return data.map(normalizeService)
}

export function getVehicleServices(query?: VehicleServiceQuery) {
  return fetchVehicleServices(`/api/vehicle-services${buildQueryString(query)}`)
}

export function getMyVehicleServices() {
  return fetchVehicleServices('/api/vehicle-services/my')
}

export async function createVehicleService(data: CreateVehicleServiceRequest) {
  const body: Record<string, unknown> = { vehicleId: data.vehicleId }

  if (data.serviceId != null && data.serviceId > 0) {
    body.serviceId = data.serviceId
  }

  const description = data.customerDescription?.trim()
  if (description) {
    body.customerDescription = description
  }

  const raw = await apiRequest<RawVehicleService>('/api/vehicle-services', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return normalizeService(raw)
}

export async function updateVehicleServiceWork(
  id: number,
  data: UpdateVehicleServiceWorkRequest,
) {
  const raw = await apiRequest<RawVehicleService>(`/api/vehicle-services/${id}/work`, {
    method: 'PUT',
    body: JSON.stringify({
      status: data.status,
      mechanicNote: data.mechanicNote,
      finalPrice: data.finalPrice,
    }),
  })
  return normalizeService(raw)
}

export async function updateVehicleService(
  id: number,
  data: UpdateVehicleServiceRequest,
) {
  const raw = await apiRequest<RawVehicleService>(`/api/vehicle-services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return normalizeService(raw)
}
