using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly GarageDbContext Context;

    public UserController(GarageDbContext context)
    {
        Context = context;
    }
    [Route("addUser")]
    [HttpPost]
    public async Task<ActionResult<UserDto>> addUser(CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = dto.Password,
            Role = UserRole.Customer,
            IsActive = true
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        return Ok(await Context.Users.Where(u => u.Email == dto.Email).FirstOrDefaultAsync());

    }
}