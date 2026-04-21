public class VehicleService
{
    public int Id { get; set; }

    public int VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public int ServiceId { get; set; }
    public Service? Service { get; set; }

    public int? MechanicId { get; set; }
    public User? Mechanic { get; set; }

    public DateTime RequestedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public VehicleStatus Status { get; set; } = VehicleStatus.Available;

    public decimal PriceAtTime { get; set; }
}

public enum VehicleStatus
{
    Available,
    InService,
    Completed
}