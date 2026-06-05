export type Vehicle = {
  id: number
  make: string
  model: string
  userId: number
}

export type CreateVehicleRequest = {
  make: string
  model: string
}
