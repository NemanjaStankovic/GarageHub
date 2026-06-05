export type ServiceStatus = 'Requested' | 'InService' | 'Completed' | 'Cancelled'

export type VehicleService = {
  id: number
  vehicleId: number
  vehicleMake: string | null
  vehicleModel: string | null
  serviceId: number | null
  mechanicId: number | null
  customerDescription: string | null
  mechanicNote: string | null
  requestedAt: string
  completedAt: string | null
  status: ServiceStatus
  finalPrice: number | null
}

export type UpdateVehicleServiceWorkRequest = {
  status?: ServiceStatus
  mechanicNote?: string
  finalPrice?: number
}

export type UpdateVehicleServiceRequest = {
  serviceId?: number
  mechanicId?: number
  customerDescription?: string | null
  mechanicNote?: string | null
  status?: ServiceStatus
  finalPrice?: number
}

export type VehicleServiceQuery = {
  vehicleId?: number
  mechanicId?: number
  serviceStatuses?: ServiceStatus[]
}

export type CreateVehicleServiceRequest = {
  vehicleId: number
  serviceId?: number | null
  customerDescription?: string | null
}
