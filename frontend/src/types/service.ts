export type Service = {
  id: number
  name: string
  basePrice: number
  isActive: boolean
}

export type CreateServiceRequest = {
  name: string
  basePrice: number
}
