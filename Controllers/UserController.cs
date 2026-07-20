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

    [Authorize(Roles = "Admin")]
    [HttpGet("mechanics")]
    public async Task<IActionResult> GetAllMechanics()
    {
        var mechanics = await Context.Users.Where(u => u.Role == UserRole.Mechanic).Select(v => new UserDto
        {
            Id = v.Id,
            Email = v.Email,
            Role = v.Role,
            IsActive = v.IsActive
        }).ToListAsync();
        return Ok(mechanics);
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

    [Authorize(Roles = "Admin")]
    [HttpPost("registerMechanic")]
    public async Task<ActionResult<UserDto>> RegisterMechanic([FromBody] CreateUserDto userDto)
    {
        var emailNotVaild = this.ValidateEmail(userDto.Email);
        if (emailNotVaild != null)
            return BadRequest(emailNotVaild);
        var passwordNotValid = this.ValidatePassword(userDto.Password);
        if (passwordNotValid != null)
            return BadRequest(passwordNotValid);

        var exists = await Context.Users.AnyAsync(u => u.Email == userDto.Email);
        if (exists)
            return BadRequest("User already exists");

        var user = new User
        {
            Email = userDto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
            Role = UserRole.Mechanic,
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

    [Authorize(Roles = "Admin")]
    [HttpGet("stats")]
    public async Task<IActionResult> GetAdminStats()
    {
        return Ok(new
        {
            usersCount = await Context.Users.CountAsync(),
            mechanicsCount = await Context.Users.CountAsync(u => u.Role == UserRole.Mechanic),
            vehiclesCount = await Context.Vehicles.CountAsync(),
            openRequestsCount = await Context.VehicleServices.CountAsync(vs =>
                vs.Status == ServiceStatus.Requested || vs.Status == ServiceStatus.InService)
        });
    }

    [Authorize]
    [HttpGet("{id:int}")]
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

    private string? ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "Email is required";
        return null;
    }

    private string? ValidatePassword(string password)
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