import type { AdminStats, RegisterMechanicRequest, UserDto } from '../types/user.ts'
import { apiRequest } from './client.ts'

export function getAdminStats() {
  return apiRequest<AdminStats>('/api/users/stats')
}

export function getMechanics() {
  return apiRequest<UserDto[]>('/api/users/mechanics')
}

export function getUserById(id: number) {
  return apiRequest<UserDto>(`/api/users/${id}`)
}

export function addAdmin() {
  return apiRequest<string>('/api/users/addAdmin', {
    method: 'POST',
  })
}

export function registerMechanic(data: RegisterMechanicRequest) {
  return apiRequest<UserDto>('/api/users/registerMechanic', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
