public class VehicleServiceQueryDto
{
    public int? VehicleId { get; set; }
    public int? MechanicId { get; set; }
    public List<ServiceStatus>? ServiceStatuses { get; set; }
}