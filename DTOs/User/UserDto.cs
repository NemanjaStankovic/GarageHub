public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }

    public bool IsActive { get; set; }
}