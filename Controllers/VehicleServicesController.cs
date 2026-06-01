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
        var vehicleService = new VehicleService
        {
            VehicleId = vehSer.VehicleId,
            ServiceId = vehSer.ServiceId ?? null,
            CustomerDescription = vehSer.CustomerDescription,
            RequestedAt = DateTime.Now,
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

    private int GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            throw new UnauthorizedAccessException();

        return int.Parse(userId);
    }
}