public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "";

    public bool IsActive { get; set; } = true;
    public List<Vehicle> Vehicles { get; set; } = new();
}