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

    public string Status { get; set; } = "";

    public decimal PriceAtTime { get; set; }
}