using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly GarageDbContext Context;

    public UserController(GarageDbContext context)
    {
        Context = context;
    }
    [Route("user")]
    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");
        var exists = await Context.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists)
            return BadRequest("User already exists");

        if (dto.Password.Length < 8)
            return BadRequest("Password must be at least 8 characters long");

        if (!dto.Password.Any(char.IsUpper))
            return BadRequest("Password must contain at least one uppercase letter");

        if (!dto.Password.Any(char.IsDigit))
            return BadRequest("Password must contain at least one number");

        if (!dto.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            return BadRequest("Password must contain at least one special character");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = UserRole.Customer,
            IsActive = true
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(int id)
    {
        var user = await Context.Users.FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive
        });
    }
}