public class Service
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
    public decimal BasePrice { get; set; }

    public List<VehicleService> VehicleServices { get; set; } = new();
}