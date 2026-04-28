using System.Data.Common;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/vehicles")]
public class VehicleController: ControllerBase
{
    private readonly GarageDbContext Context;
    private readonly AuthService _authService;

    public VehicleController(GarageDbContext context, AuthService authService)
    {
        Context = context;
        _authService = authService;
    }

    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle(CreateVehicleDto vehicle)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userIdClaim == null)
            return Unauthorized();

        var userId = int.Parse(userIdClaim);
        var user = await Context.Users.AnyAsync(u => u.Id == userId);
        
        if(!user)
            return BadRequest("User doesnt exist");
        var createdVehicle = new Vehicle
        {
            Make = vehicle.Make,
            Model = vehicle.Model,
            UserId = userId,
        };

        Context.Vehicles.Add(createdVehicle);
        await Context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicleById), new { id = createdVehicle.Id }, new VehicleDto
        {
            Id = createdVehicle.Id,
            Make = createdVehicle.Make,
            Model = createdVehicle.Model,
            UserId = createdVehicle.UserId,
        }); 
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CreateVehicleDto>> GetVehicleById(int id)
    {

        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(currentUserId == null)
            return Unauthorized();

        var currentUserIdInt = int.Parse(currentUserId);
        var vehicle = await Context.Vehicles.FirstOrDefaultAsync(u=>u.Id==id);

        if(vehicle == null)
            return NotFound();

        if(role != "Admin" && vehicle.UserId != currentUserIdInt)
        {
            return NotFound();
        }

        return Ok(new VehicleDto
        {
            Id = vehicle.Id,
            Make = vehicle.Make,
            Model = vehicle.Model,
            UserId = currentUserIdInt
        });
    }
}