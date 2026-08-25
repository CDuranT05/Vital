using Vital.Domain.Enums;

namespace Vital.Domain.Entities;

public class Incident
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public Contract Contract { get; set; } = null!;
    public string CitizenId { get; set; } = string.Empty;
    public Guid BranchId { get; set; }
    public Branch Branch { get; set; } = null!;
    public string? AttendedByTechnicianId { get; set; }
    public string Description { get; set; } = string.Empty;
    public IncidentStatus Status { get; set; } = IncidentStatus.Pending;
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AttendedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolutionNotes { get; set; }
    public ICollection<IncidentEvidence> Evidences { get; set; } = new List<IncidentEvidence>();
}
