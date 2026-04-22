using Microsoft.EntityFrameworkCore;

public class GarageDbContext : DbContext
{
    public GarageDbContext(DbContextOptions<GarageDbContext> options)
        : base(options) { }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<MechanicProfile>().HasKey(x => x.UserId);
        modelBuilder.Entity<CustomerProfile>().HasKey(x => x.UserId);
        modelBuilder.Entity<User>().HasMany(u => u.Vehicles).WithOne(v => v.User).HasForeignKey(v => v.UserId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Vehicle>().HasMany(v => v.VehicleServices).WithOne(vs => vs.Vehicle).HasForeignKey(vs => vs.VehicleId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<VehicleService>().HasOne(vs => vs.Service).WithMany(s => s.VehicleServices).HasForeignKey(vs => vs.ServiceId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VehicleService>().HasOne(vs => vs.Mechanic).WithMany(s => s.AssignedVehicleServices).HasForeignKey(vs => vs.MechanicId).OnDelete(DeleteBehavior.NoAction);

    }
    public DbSet<User> Users => Set<User>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<VehicleService> VehicleServices => Set<VehicleService>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    public DbSet<MechanicProfile> MechanicProfiles => Set<MechanicProfile>();
}