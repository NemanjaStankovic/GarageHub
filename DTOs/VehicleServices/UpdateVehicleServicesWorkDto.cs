public class UpdateVehicleServicesWorkDto
{
    public int? ServiceId { get; set; }
    public string? MechanicNote { get; set; }
    public decimal? FinalPrice { get; set; }
    public ServiceStatus? Status { get; set; }
}