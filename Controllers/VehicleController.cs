using System.Data.Common;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle(CreateVehicleDto vehicle)
    {
        var userIdClaim = GetUserId();

        var createdVehicle = new Vehicle
        {
            Make = vehicle.Make,
            Model = vehicle.Model,
            UserId = userIdClaim,
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

    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> My()
    {
        var userId = GetUserId();
        var vehicles = await Context.Vehicles
            .Where(v => v.UserId == userId)
            .Select(v => new VehicleDto
            {
                Id = v.Id, 
                Make = v.Make, 
                Model = v.Model, 
                UserId = v.UserId
            })
            .ToListAsync();
        
        return Ok(vehicles);
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehicleDto>> GetVehicleById(int id)
    {

        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var currentUserId = GetUserId();

        var vehicle = await Context.Vehicles.FirstOrDefaultAsync(u=>u.Id==id);

        if(vehicle == null)
            return NotFound();

        if(role != "Admin" && vehicle.UserId != currentUserId)
        {
            return NotFound();
        }

        return Ok(new VehicleDto
        {
            Id = vehicle.Id,
            Make = vehicle.Make,
            Model = vehicle.Model,
            UserId = vehicle.UserId
        });
    }
    private int GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            throw new UnauthorizedAccessException();

        return int.Parse(userId);
    }
}