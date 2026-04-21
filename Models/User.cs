public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; } = "";
    public UserRole Role { get; set; } = UserRole.Customer;

    public bool IsActive { get; set; } = true;
    public List<Vehicle> Vehicles { get; set; } = new();
    public List<VehicleService> AssignedVehicleServices { get; set; } = new();
}

public enum UserRole
{
    Admin,
    Customer,
    Mechanic,
}