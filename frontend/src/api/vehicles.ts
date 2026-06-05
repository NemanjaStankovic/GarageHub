import type { CreateVehicleRequest, Vehicle } from '../types/vehicle.ts'
import { apiRequest } from './client.ts'

export function getMyVehicles() {
  return apiRequest<Vehicle[]>('/api/vehicles/my')
}

export function getVehicleById(id: number) {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`)
}

export function createVehicle(data: CreateVehicleRequest) {
  return apiRequest<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateVehicle(id: number, data: CreateVehicleRequest) {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteVehicle(id: number) {
  return apiRequest<void>(`/api/vehicles/${id}`, {
    method: 'DELETE',
  })
}
