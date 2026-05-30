using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/services")]
public class ServiceController : ControllerBase
{
    private readonly GarageDbContext Context;

    public ServiceController(GarageDbContext context)
    {
        Context = context;
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceDto>> GetServiceById(int id)
    {

        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var service = await Context.Services.FirstOrDefaultAsync(u => u.Id == id);

        if (service == null)
            return NotFound();

        if (role != "Admin")
        {
            return NotFound();
        }

        return Ok(new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            BasePrice = service.BasePrice,
            IsActive = service.IsActive
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ServiceDto>> CreateService(CreateServiceDto service)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var createdService = new Service
        {
            Name = service.Name,
            BasePrice = service.BasePrice,
            IsActive = true,
        };
        Context.Services.Add(createdService);
        await Context.SaveChangesAsync();

        return CreatedAtAction(
        nameof(GetServiceById),
        new { id = createdService.Id },
        new ServiceDto
        {
            Id = createdService.Id,
            Name = createdService.Name,
            BasePrice = createdService.BasePrice,
            IsActive = createdService.IsActive
        });
    }

}