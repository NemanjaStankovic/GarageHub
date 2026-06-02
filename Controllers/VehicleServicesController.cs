using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/vehicle-services")]
public class VehicleServicesController : ControllerBase
{
    private readonly GarageDbContext Context;

    public VehicleServicesController(GarageDbContext context)
    {
        Context = context;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<VehicleServicesDto>> CreateVehicleService(CreateVehicleServiceDto vehSer)
    {
        var userId = GetUserId();
        var vehicle = await Context.Vehicles.FirstOrDefaultAsync(v => v.Id == vehSer.VehicleId);
        var service = await Context.Services.FirstOrDefaultAsync(v => v.Id == vehSer.ServiceId);
        if (vehicle?.UserId != userId) return NotFound("You dont own vehicle with that id ");
        if (service == null) return NotFound("Service with that id doesnt exist");
        var vehicleService = new VehicleService
        {
            VehicleId = vehSer.VehicleId,
            ServiceId = vehSer.ServiceId ?? null,
            CustomerDescription = vehSer.CustomerDescription,
            RequestedAt = DateTime.UtcNow,
        };
        Context.VehicleServices.Add(vehicleService);
        await Context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicleServicesById), new { id = vehicleService.Id }, new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            ServiceId = vehicleService.ServiceId,
            MechanicId = vehicleService.MechanicId,
            CustomerDescription = vehicleService.CustomerDescription,
            MechanicNote = vehicleService.MechanicNote,
            RequestedAt = vehicleService.RequestedAt,
            CompletedAt = vehicleService.CompletedAt,
            Status = vehicleService.Status,
            FinalPrice = vehicleService.FinalPrice
        });
    }
    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<VehicleServicesDto>>> GetMyVehicleServices()
    {
        var currentUserId = GetUserId();
        var vehicleServices = await Context.VehicleServices.Include(vs => vs.Vehicle).Where(vs => vs.Vehicle != null && vs.Vehicle.UserId == currentUserId).Select(vs => new VehicleServicesDto
        {
            Id = vs.Id,
            VehicleId = vs.VehicleId,
            ServiceId = vs.ServiceId,
            MechanicId = vs.MechanicId,
            CustomerDescription = vs.CustomerDescription,
            MechanicNote = vs.MechanicNote,
            RequestedAt = vs.RequestedAt,
            CompletedAt = vs.CompletedAt,
            Status = vs.Status,
            FinalPrice = vs.FinalPrice
        }).ToListAsync();
        return Ok(vehicleServices);
    }
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehicleServicesDto>> GetVehicleServicesById(int id)
    {

        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var currentUserId = GetUserId();

        var vehicleService = await Context.VehicleServices
                .Include(vs => vs.Vehicle)
                .FirstOrDefaultAsync(vs => vs.Id == id);
        if (vehicleService == null)
            return NotFound();

        if (role != "Admin" && vehicleService.Vehicle?.UserId != currentUserId)
        {
            return NotFound();
        }

        return Ok(new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            ServiceId = vehicleService.ServiceId,
            MechanicId = vehicleService.MechanicId,
            CustomerDescription = vehicleService.CustomerDescription,
            MechanicNote = vehicleService.MechanicNote,
            RequestedAt = vehicleService.RequestedAt,
            CompletedAt = vehicleService.CompletedAt,
            Status = vehicleService.Status,
            FinalPrice = vehicleService.FinalPrice
        });
    }
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<VehicleServicesDto>> UpdateVehicleServices(int id, [FromBody] UpdateVehicleServicesDto vehSer)
    {
        var currentUserId = GetUserId();
        var vehicleService = await Context.VehicleServices.Include(vs => vs.Vehicle).FirstOrDefaultAsync(vs => vs.Id == id);
        if (vehicleService == null) return NotFound();
        if (vehicleService.Vehicle?.UserId != currentUserId) return NotFound();
        if (vehicleService.Status != ServiceStatus.Requested) return BadRequest("You cant edit data when service is in progress or completed!");
        vehicleService.ServiceId = vehSer.ServiceId ?? vehicleService.ServiceId;
        vehicleService.CustomerDescription =
            vehSer.CustomerDescription ?? vehicleService.CustomerDescription;

        await Context.SaveChangesAsync();
        return Ok(new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            ServiceId = vehicleService.ServiceId,
            MechanicId = vehicleService.MechanicId,
            CustomerDescription = vehicleService.CustomerDescription,
            MechanicNote = vehicleService.MechanicNote,
            RequestedAt = vehicleService.RequestedAt,
            CompletedAt = vehicleService.CompletedAt,
            Status = vehicleService.Status,
            FinalPrice = vehicleService.FinalPrice
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