export type UserDto = {
  id: number
  email: string
  role: string
  isActive: boolean
}

export type AdminStats = {
  usersCount: number
  mechanicsCount: number
  vehiclesCount: number
  openRequestsCount: number
}

export type RegisterMechanicRequest = {
  email: string
  password: string
}
