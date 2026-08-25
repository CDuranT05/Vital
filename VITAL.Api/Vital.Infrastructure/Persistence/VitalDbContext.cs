using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Vital.Domain.Entities;
using Vital.Infrastructure.Identity;

namespace Vital.Infrastructure.Persistence;

public class VitalDbContext : IdentityDbContext<ApplicationUser>
{
    public VitalDbContext(DbContextOptions<VitalDbContext> options) : base(options) { }

    public DbSet<Property> Properties => Set<Property>();
    public DbSet<Meter> Meters => Set<Meter>();
    public DbSet<MeterReading> MeterReadings => Set<MeterReading>();
    public DbSet<Contract> Contracts => Set<Contract>();
    public DbSet<Tariff> Tariffs => Set<Tariff>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<VulnerabilityCase> VulnerabilityCases => Set<VulnerabilityCase>();
    public DbSet<CaseEvidence> CaseEvidences => Set<CaseEvidence>();
    public DbSet<HomeVisit> HomeVisits => Set<HomeVisit>();
    public DbSet<HomeVisitPhoto> HomeVisitPhotos => Set<HomeVisitPhoto>();
    public DbSet<NeighborStatement> NeighborStatements => Set<NeighborStatement>();
    public DbSet<SocialBenefit> SocialBenefits => Set<SocialBenefit>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Shift> Shifts => Set<Shift>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<IncidentEvidence> IncidentEvidences => Set<IncidentEvidence>();
    public DbSet<OwnershipTransferRequest> TransferRequests => Set<OwnershipTransferRequest>();
    public DbSet<TransferDocument> TransferDocuments => Set<TransferDocument>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Contract>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.ContractNumber).IsRequired().HasMaxLength(50);
            e.Property(c => c.ApplicationUserId).IsRequired().HasMaxLength(450);
            e.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(c => c.ApplicationUserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Property).WithMany().HasForeignKey(c => c.PropertyId);
            e.HasOne(c => c.Branch).WithMany().HasForeignKey(c => c.BranchId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(c => c.Invoices).WithOne(i => i.Contract).HasForeignKey(i => i.ContractId);
            e.HasMany(c => c.VulnerabilityCases).WithOne(v => v.Contract).HasForeignKey(v => v.ContractId);
        });

        builder.Entity<Invoice>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Amount).HasColumnType("TEXT");
            e.Property(i => i.DiscountAmount).HasColumnType("TEXT");
            e.Property(i => i.TotalAmount).HasColumnType("TEXT");
            e.Property(i => i.ConsumptionKwh).HasColumnType("TEXT");
            e.HasOne(i => i.Tariff).WithMany().HasForeignKey(i => i.TariffId);
            e.HasMany(i => i.Payments).WithOne(p => p.Invoice).HasForeignKey(p => p.InvoiceId);
        });

        builder.Entity<Tariff>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.PricePerKwh).HasColumnType("TEXT");
            e.Property(t => t.Name).IsRequired().HasMaxLength(100);
        });

        builder.Entity<Meter>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasIndex(m => m.QrCode).IsUnique();
            e.HasIndex(m => m.MeterNumber).IsUnique();
            e.HasOne(m => m.Property).WithMany(p => p.Meters).HasForeignKey(m => m.PropertyId);
            e.HasMany(m => m.Readings).WithOne(r => r.Meter).HasForeignKey(r => r.MeterId);
        });

        builder.Entity<MeterReading>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.CurrentReading).HasColumnType("TEXT");
        });

        builder.Entity<VulnerabilityCase>(e =>
        {
            e.HasKey(v => v.Id);
            e.HasMany(v => v.Evidences).WithOne(ev => ev.VulnerabilityCase).HasForeignKey(ev => ev.VulnerabilityCaseId);
            e.HasMany(v => v.HomeVisits).WithOne(h => h.VulnerabilityCase).HasForeignKey(h => h.VulnerabilityCaseId);
        });

        builder.Entity<HomeVisit>(e =>
        {
            e.HasKey(h => h.Id);
            e.Property(h => h.InspectorId).IsRequired().HasMaxLength(450);
            e.Property(h => h.Latitude).HasColumnType("TEXT");
            e.Property(h => h.Longitude).HasColumnType("TEXT");
            e.HasMany(h => h.Photos).WithOne(p => p.HomeVisit).HasForeignKey(p => p.HomeVisitId);
            e.HasMany(h => h.NeighborStatements).WithOne(n => n.HomeVisit).HasForeignKey(n => n.HomeVisitId);
        });

        builder.Entity<SocialBenefit>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.DiscountPercentage).HasColumnType("TEXT");
        });

        builder.Entity<Payment>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Amount).HasColumnType("TEXT");
        });

        builder.Entity<Branch>(e =>
        {
            e.HasKey(b => b.Id);
            e.Property(b => b.Name).IsRequired().HasMaxLength(100);
            e.Property(b => b.City).IsRequired().HasMaxLength(100);
        });

        builder.Entity<Shift>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.TechnicianId).IsRequired().HasMaxLength(450);
            e.HasOne(s => s.Branch).WithMany(b => b.Shifts).HasForeignKey(s => s.BranchId);
        });

        builder.Entity<Incident>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.CitizenId).IsRequired().HasMaxLength(450);
            e.Property(i => i.AttendedByTechnicianId).HasMaxLength(450);
            e.HasOne(i => i.Contract).WithMany().HasForeignKey(i => i.ContractId);
            e.HasOne(i => i.Branch).WithMany(b => b.Incidents).HasForeignKey(i => i.BranchId);
            e.HasMany(i => i.Evidences).WithOne(ev => ev.Incident).HasForeignKey(ev => ev.IncidentId);
        });

        builder.Entity<IncidentEvidence>(e =>
        {
            e.HasKey(ev => ev.Id);
        });

        builder.Entity<OwnershipTransferRequest>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.NewOwnerIdentityCard).IsRequired().HasMaxLength(50);
            e.Property(t => t.NewOwnerFirstName).IsRequired().HasMaxLength(100);
            e.Property(t => t.NewOwnerLastName).IsRequired().HasMaxLength(100);
            e.Property(t => t.InspectorId).HasMaxLength(450);
            e.Property(t => t.AssignedTechnicianId).HasMaxLength(450);
            e.HasOne(t => t.Contract).WithMany().HasForeignKey(t => t.ContractId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(t => t.Documents).WithOne(d => d.TransferRequest).HasForeignKey(d => d.TransferRequestId);
        });

        builder.Entity<TransferDocument>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.DocumentType).HasMaxLength(100);
        });
    }
}
