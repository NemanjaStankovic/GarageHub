import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  UserDto,
} from '../types/auth.ts'
import { apiRequest } from './client.ts'

export function register(credentials: RegisterRequest) {
  return apiRequest<UserDto>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function login(credentials: LoginRequest) {
  return apiRequest<LoginResponse>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getMe() {
  return apiRequest<MeResponse>('/api/users/me')
}
