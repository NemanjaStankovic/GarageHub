public class CustomerProfile
{
    public int UserId { get; set; }
    public User? User { get; set; }

    public string PhoneNumber { get; set; } = "";
}