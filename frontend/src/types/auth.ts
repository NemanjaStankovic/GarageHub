export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest

export type UserDto = {
  id: number
  email: string
  role: string
  isActive: boolean
}

export type LoginResponse = {
  accessToken: string
}

export type MeResponse = {
  userId: string
  email: string
  role: string
}

export type AuthUser = MeResponse
