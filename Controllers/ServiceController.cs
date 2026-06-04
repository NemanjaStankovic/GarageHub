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

    [Authorize(Roles = "Admin")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceDto>> GetServiceById(int id)
    {

        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        var service = await Context.Services.FirstOrDefaultAsync(u => u.Id == id);

        if (service == null)
            return NotFound();

        return Ok(new ServiceDto
        {
            Id = service.Id,
            Name = service.Name,
            BasePrice = service.BasePrice,
            IsActive = service.IsActive
        });
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<ServiceDto>>> GetServices()
    {
        return Ok(await Context.Services
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                BasePrice = s.BasePrice,
                IsActive = s.IsActive
            })
            .ToListAsync());
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