using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Entities;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class IncidentService : IIncidentService
{
    private readonly VitalDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public IncidentService(VitalDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    public async Task<IncidentDto> ReportIncidentAsync(ReportIncidentRequest request, string citizenId)
    {
        var contract = await _db.Contracts
            .Include(c => c.Branch)
            .FirstOrDefaultAsync(c => c.Id == request.ContractId)
            ?? throw new InvalidOperationException("Contrato no encontrado.");

        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            ContractId = request.ContractId,
            CitizenId = citizenId,
            BranchId = contract.BranchId,
            Description = "Emergencia eléctrica",
            ReportedAt = DateTime.UtcNow
        };

        _db.Incidents.Add(incident);
        await _db.SaveChangesAsync();

        return new IncidentDto(
            incident.Id,
            contract.ContractNumber,
            contract.Branch?.Name ?? "",
            incident.Description,
            (int)incident.Status,
            incident.ReportedAt
        );
    }

    public async Task<List<IncidentAlertDto>> GetAlertsForTechnicianAsync(string technicianId)
    {
        // Buscar la sucursal del turno activo del técnico
        var shift = await _db.Shifts
            .Include(s => s.Branch)
            .Where(s => s.TechnicianId == technicianId && s.IsActive)
            .ToListAsync();

        var activeShift = shift.FirstOrDefault(s => s.IsOnDutyNow()) ?? shift.FirstOrDefault();
        if (activeShift is null) return [];

        var incidents = await _db.Incidents
            .Include(i => i.Contract)
                .ThenInclude(c => c.Property)
            .Where(i => i.BranchId == activeShift.BranchId && i.Status == IncidentStatus.Pending)
            .OrderByDescending(i => i.ReportedAt)
            .ToListAsync();

        var result = new List<IncidentAlertDto>();
        foreach (var incident in incidents)
        {
            var citizen = await _userManager.FindByIdAsync(incident.CitizenId);
            result.Add(new IncidentAlertDto(
                incident.Id,
                incident.Contract.ContractNumber,
                incident.Contract.ServiceAddress,
                incident.Contract.Property?.Parish ?? "",
                incident.Contract.Property?.Municipality ?? "",
                incident.Contract.Property?.State ?? "",
                citizen is null ? "Ciudadano" : $"{citizen.FirstName} {citizen.LastName}",
                citizen?.PhoneNumber ?? "",
                citizen?.IdentityCard ?? "",
                incident.ReportedAt
            ));
        }
        return result;
    }

    public async Task AcknowledgeIncidentAsync(Guid incidentId, string technicianId)
    {
        var incident = await _db.Incidents.FindAsync(incidentId)
            ?? throw new InvalidOperationException("Incidencia no encontrada.");

        incident.Status = IncidentStatus.InProgress;
        incident.AttendedByTechnicianId = technicianId;
        incident.AttendedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<List<AssignedIncidentDto>> GetAssignedIncidentsAsync(string technicianId)
    {
        var incidents = await _db.Incidents
            .Include(i => i.Contract)
                .ThenInclude(c => c.Property)
            .Where(i => i.AttendedByTechnicianId == technicianId && i.Status == IncidentStatus.InProgress)
            .OrderByDescending(i => i.AttendedAt)
            .ToListAsync();

        var result = new List<AssignedIncidentDto>();
        foreach (var incident in incidents)
        {
            var citizen = await _userManager.FindByIdAsync(incident.CitizenId);
            result.Add(new AssignedIncidentDto(
                incident.Id,
                incident.Contract.ContractNumber,
                incident.Contract.ServiceAddress,
                incident.Contract.Property?.Parish ?? "",
                incident.Contract.Property?.Municipality ?? "",
                incident.Contract.Property?.State ?? "",
                citizen is null ? "Ciudadano" : $"{citizen.FirstName} {citizen.LastName}",
                citizen?.PhoneNumber ?? "",
                citizen?.IdentityCard ?? "",
                incident.ReportedAt,
                incident.AttendedAt,
                (int)incident.Status
            ));
        }
        return result;
    }

    public async Task ResolveIncidentAsync(Guid incidentId, string technicianId, string? notes, List<(Stream Data, string FileName)> photos)
    {
        var incident = await _db.Incidents
            .Include(i => i.Evidences)
            .FirstOrDefaultAsync(i => i.Id == incidentId)
            ?? throw new InvalidOperationException("Incidencia no encontrada.");

        if (incident.AttendedByTechnicianId != technicianId)
            throw new InvalidOperationException("No tienes permiso para resolver esta incidencia.");

        var uploadsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "incident-evidences", incidentId.ToString());
        Directory.CreateDirectory(uploadsDir);

        foreach (var (data, originalName) in photos)
        {
            var ext = Path.GetExtension(originalName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);
            await using var stream = File.Create(filePath);
            await data.CopyToAsync(stream);

            _db.IncidentEvidences.Add(new IncidentEvidence
            {
                Id = Guid.NewGuid(),
                IncidentId = incidentId,
                FileName = fileName,
                FilePath = filePath
            });
        }

        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = DateTime.UtcNow;
        incident.ResolutionNotes = notes;
        await _db.SaveChangesAsync();
    }

}
