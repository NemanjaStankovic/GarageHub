public class MechanicProfile
{
    public int UserId { get; set; }
    public User? User { get; set; }

    public decimal Salary { get; set; }
    public string Skills { get; set; } = "";
}