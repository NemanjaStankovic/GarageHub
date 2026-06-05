import type { CreateServiceRequest, Service } from '../types/service.ts'
import { apiRequest } from './client.ts'

export function getServices() {
  return apiRequest<Service[]>('/api/services')
}

export function getServiceById(id: number) {
  return apiRequest<Service>(`/api/services/${id}`)
}

export function createService(data: CreateServiceRequest) {
  return apiRequest<Service>('/api/services', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
