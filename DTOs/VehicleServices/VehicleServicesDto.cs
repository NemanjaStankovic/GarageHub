public class VehicleServicesDto
{
    public int Id { get; set; }
    public int VehicleId { get; set; }
    public int? ServiceId { get; set; }
    public int? MechanicId { get; set; }

    public string? CustomerDescription { get; set; }
    public string? MechanicNote { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public ServiceStatus Status { get; set; } = ServiceStatus.Requested;
    public decimal? FinalPrice { get; set; }

}