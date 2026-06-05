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
        if (vehicle?.UserId != userId) return NotFound("You dont own vehicle with that id ");

        int? serviceId = vehSer.ServiceId is > 0 ? vehSer.ServiceId : null;

        if (serviceId != null)
        {
            var service = await Context.Services.FirstOrDefaultAsync(v => v.Id == serviceId);
            if (service == null) return NotFound("Service with that id doesnt exist");
        }

        var vehicleService = new VehicleService
        {
            VehicleId = vehSer.VehicleId,
            ServiceId = serviceId,
            CustomerDescription = vehSer.CustomerDescription,
            RequestedAt = DateTime.UtcNow,
        };
        Context.VehicleServices.Add(vehicleService);
        await Context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicleServicesById), new { id = vehicleService.Id }, new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            VehicleMake = vehicle?.Make,
            VehicleModel = vehicle?.Model,
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
    [HttpGet("")]
    public async Task<ActionResult<List<VehicleServicesDto>>> FilterVehicleServices([FromQuery] VehicleServiceQueryDto vehSer)
    {
        var currentUserId = GetUserId();
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var vehicleServices = Context.VehicleServices.Include(vs => vs.Vehicle).AsQueryable();

        if (role == "Customer")
        {
            vehicleServices = vehicleServices.Where(vs => vs.Vehicle != null && vs.Vehicle.UserId == currentUserId);
        }

        if (vehSer.MechanicId != null)
        {
            vehicleServices = vehicleServices.Where(vs => vs.MechanicId == vehSer.MechanicId);
        }
        if (vehSer.VehicleId != null)
        {
            vehicleServices = vehicleServices.Where(vs => vs.VehicleId == vehSer.VehicleId);
        }
        if (vehSer.ServiceStatuses != null && vehSer.ServiceStatuses.Any())
        {
            vehicleServices = vehicleServices.Where(vs => vehSer.ServiceStatuses.Contains(vs.Status));
        }
        var result = await vehicleServices.Select(vs => new VehicleServicesDto
        {
            Id = vs.Id,
            VehicleId = vs.VehicleId,
            VehicleMake = vs.Vehicle != null ? vs.Vehicle.Make : null,
            VehicleModel = vs.Vehicle != null ? vs.Vehicle.Model : null,
            ServiceId = vs.ServiceId,
            MechanicId = vs.MechanicId,
            CustomerDescription = vs.CustomerDescription,
            MechanicNote = vs.MechanicNote,
            RequestedAt = vs.RequestedAt,
            CompletedAt = vs.CompletedAt,
            Status = vs.Status,
            FinalPrice = vs.FinalPrice
        }
        ).ToListAsync();
        return Ok(result);
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
            VehicleMake = vs.Vehicle!.Make,
            VehicleModel = vs.Vehicle!.Model,
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

        if (
        role != "Admin" &&
        vehicleService.Vehicle?.UserId != currentUserId &&
        vehicleService.MechanicId != currentUserId
        )
        {
            return NotFound();
        }

        return Ok(new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            VehicleMake = vehicleService.Vehicle?.Make,
            VehicleModel = vehicleService.Vehicle?.Model,
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
            VehicleMake = vehicleService.Vehicle?.Make,
            VehicleModel = vehicleService.Vehicle?.Model,
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
    [Authorize(Roles = "Mechanic")]
    [HttpPut("{id:int}/work")]
    public async Task<ActionResult<VehicleServicesDto>> UpdateVehicleServicesWork(int id, [FromBody] UpdateVehicleServicesWorkDto vehSer)
    {
        var userId = GetUserId();
        var vehicleService = await Context.VehicleServices.Include(vs => vs.Vehicle).FirstOrDefaultAsync(vs => vs.Id == id);
        if (vehicleService == null) return BadRequest("Vehicle service with this id doesnt exist!");
        if (vehSer.Status != null && vehSer.Status != vehicleService.Status)
        {
            vehicleService.Status = vehSer.Status.Value;

            if (vehSer.Status == ServiceStatus.Completed)
            {
                vehicleService.CompletedAt = DateTime.UtcNow;
            }
        }

        if (!string.IsNullOrWhiteSpace(vehSer.MechanicNote))
        {
            vehicleService.MechanicNote +=
                $"\n[{DateTime.UtcNow:u}] {vehSer.MechanicNote}";
        }

        vehicleService.FinalPrice =
            vehSer.FinalPrice ?? vehicleService.FinalPrice;

        vehicleService.MechanicId = userId;
        await Context.SaveChangesAsync();
        return Ok(new VehicleServicesDto
        {
            Id = vehicleService.Id,
            VehicleId = vehicleService.VehicleId,
            VehicleMake = vehicleService.Vehicle?.Make,
            VehicleModel = vehicleService.Vehicle?.Model,
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