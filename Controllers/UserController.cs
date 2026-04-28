using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly GarageDbContext Context;
    private readonly AuthService _authService;

    public UserController(GarageDbContext context, AuthService authService)
    {
        Context = context;
        _authService = authService;
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        
        return Ok(new
        {
            userId,
            email,
            role
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        var emailNotVaild = this.ValidateEmail(dto.Email);
        if (emailNotVaild != null)
            return BadRequest(emailNotVaild);
        var passwordNotValid = this.ValidatePassword(dto.Password);
        if (passwordNotValid != null)
            return BadRequest(passwordNotValid);

        var exists = await Context.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists)
            return BadRequest("User already exists");

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

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto login)
    {
        var user = await Context.Users.FirstOrDefaultAsync(u => u.Email == login.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
            return Unauthorized("Wrong email or password");

        var token = _authService.CreateToken(user);

        return Ok(new
        {
            accessToken = token
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

    [NonAction]
    public string? ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "Email is required";
        return null;
    }

    [NonAction]
    public string? ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return "Password is required";

        if (password.Length < 8)
            return "Password must be at least 8 characters long";

        if (!password.Any(char.IsUpper))
            return "Password must contain at least one uppercase letter";

        if (!password.Any(char.IsDigit))
            return "Password must contain at least one number";

        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            return "Password must contain at least one special character";
        return null;
    }
}