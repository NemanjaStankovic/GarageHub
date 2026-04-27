using System.Data.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/vehicles")]
public class VehicleController: ControllerBase
{
    private readonly GarageDbContext Context;

    public VehicleController(GarageDbContext context)
    {
        Context = context;
    }

    [HttpPost]
    public async Task<ActionResult<VehicleDto>> CreateVehicle(CreateVehicleDto vehicle)
    {
        var user = await Context.Users.AnyAsync(u => u.Id == vehicle.UserId);
        if(!user)
            return BadRequest("User doesnt exist");
        var createdVehicle = new Vehicle
        {
            Make = vehicle.Make,
            Model = vehicle.Model,
            UserId = vehicle.UserId,
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
        var vehicle = await Context.Vehicles.FirstOrDefaultAsync(u=>u.Id==id);

        if(vehicle==null)
            return NotFound();

            return Ok(new VehicleDto
            {
                Id = vehicle.Id,
                Make = vehicle.Make,
                Model = vehicle.Model,
                UserId = vehicle.UserId,
            });
    }
}