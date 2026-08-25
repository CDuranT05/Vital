using System.Text;
using Microsoft.EntityFrameworkCore;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;
using Vital.Domain.Enums;
using Vital.Infrastructure.Identity;
using Vital.Infrastructure.Persistence;

namespace Vital.Infrastructure.Services;

public class SupervisorService : ISupervisorService
{
    private readonly VitalDbContext _db;

    public SupervisorService(VitalDbContext db) => _db = db;

    public async Task<GlobalMetricsDto> GetGlobalMetricsAsync()
    {
        var branches = await _db.Branches.Where(b => b.IsActive).OrderBy(b => b.Name).ToListAsync();
        var branchMetrics = new List<BranchMetricsDto>();
        foreach (var b in branches)
            branchMetrics.Add(await BuildBranchMetrics(b.Id, b.Name, b.City));

        return new GlobalMetricsDto(
            branchMetrics.Sum(b => b.ActiveContracts),
            branchMetrics.Sum(b => b.TotalIncidents),
            branchMetrics.Sum(b => b.ResolvedIncidents),
            branchMetrics.Sum(b => b.TotalTransfers),
            branchMetrics.Sum(b => b.CompletedTransfers),
            branchMetrics.Sum(b => b.TotalCases),
            branchMetrics.Sum(b => b.ApprovedCases),
            branchMetrics
        );
    }

    public async Task<BranchMetricsDto> GetBranchMetricsAsync(Guid branchId)
    {
        var branch = await _db.Branches.FindAsync(branchId)
            ?? throw new InvalidOperationException("Sucursal no encontrada.");
        return await BuildBranchMetrics(branch.Id, branch.Name, branch.City);
    }

    private async Task<BranchMetricsDto> BuildBranchMetrics(Guid branchId, string name, string city)
    {
        var activeContracts = await _db.Contracts
            .CountAsync(c => c.BranchId == branchId && c.Status == ContractStatus.Active);

        var incidents = await _db.Incidents
            .Where(i => i.BranchId == branchId)
            .Select(i => new { i.Status, i.AttendedByTechnicianId })
            .ToListAsync();

        var transfers = await _db.TransferRequests
            .Include(t => t.Contract)
            .Where(t => t.Contract.BranchId == branchId)
            .Select(t => new { t.Status, t.AssignedTechnicianId, t.InspectorId })
            .ToListAsync();

        var cases = await _db.VulnerabilityCases
            .Include(v => v.Contract)
            .Where(v => v.Contract.BranchId == branchId)
            .Select(v => new { v.Status })
            .ToListAsync();

        // Technicians in this branch
        var techIds = await _db.Shifts
            .Where(s => s.BranchId == branchId && s.IsActive)
            .Select(s => s.TechnicianId)
            .Distinct()
            .ToListAsync();

        var techUsers = await _db.Users
            .OfType<ApplicationUser>()
            .Where(u => techIds.Contains(u.Id))
            .ToListAsync();

        var techMetrics = techUsers.Select(u => new TechnicianMetricDto(
            u.Id,
            $"{u.FirstName} {u.LastName}",
            u.IdentityCard,
            incidents.Count(i => i.AttendedByTechnicianId == u.Id),
            incidents.Count(i => i.AttendedByTechnicianId == u.Id && i.Status == IncidentStatus.Resolved),
            incidents.Count(i => i.AttendedByTechnicianId == u.Id && i.Status != IncidentStatus.Resolved && i.Status != IncidentStatus.Cancelled),
            transfers.Count(t => t.AssignedTechnicianId == u.Id && t.Status == TransferRequestStatus.Completed)
        )).ToList();

        // Inspectors in this branch
        var inspectorUsers = await _db.Users
            .OfType<ApplicationUser>()
            .Where(u => u.BranchId == branchId && u.Role == UserRole.Inspector)
            .ToListAsync();

        var inspectorMetrics = inspectorUsers.Select(u => new InspectorMetricDto(
            u.Id,
            $"{u.FirstName} {u.LastName}",
            u.IdentityCard,
            cases.Count(),  // reviewed = approved + rejected
            cases.Count(c => c.Status == CaseStatus.Approved),
            cases.Count(c => c.Status == CaseStatus.Rejected),
            transfers.Count(t => t.InspectorId == u.Id),
            transfers.Count(t => t.InspectorId == u.Id && (t.Status == TransferRequestStatus.ApprovedPendingTechnician || t.Status == TransferRequestStatus.Completed)),
            transfers.Count(t => t.InspectorId == u.Id && t.Status == TransferRequestStatus.Rejected)
        )).ToList();

        return new BranchMetricsDto(
            branchId, name, city,
            activeContracts,
            incidents.Count,
            incidents.Count(i => i.Status == IncidentStatus.Resolved),
            incidents.Count(i => i.Status == IncidentStatus.Pending || i.Status == IncidentStatus.Assigned),
            transfers.Count,
            transfers.Count(t => t.Status == TransferRequestStatus.Pending || t.Status == TransferRequestStatus.ApprovedPendingTechnician),
            transfers.Count(t => t.Status == TransferRequestStatus.Completed),
            cases.Count,
            cases.Count(c => c.Status == CaseStatus.Pending || c.Status == CaseStatus.UnderReview),
            cases.Count(c => c.Status == CaseStatus.Approved),
            cases.Count(c => c.Status == CaseStatus.Rejected),
            techMetrics,
            inspectorMetrics
        );
    }

    public async Task<byte[]> GenerateCsvReportAsync(Guid? branchId, string reportType)
    {
        var sb = new StringBuilder();

        switch (reportType.ToLower())
        {
            case "technicians":
                sb.AppendLine("Nombre,Cedula,Sucursal,Incidentes Asignados,Resueltos,Pendientes,Transferencias Completadas");
                var techShifts = await _db.Shifts
                    .Include(s => s.Branch)
                    .Where(s => s.IsActive && (branchId == null || s.BranchId == branchId))
                    .Select(s => new { s.TechnicianId, BranchName = s.Branch!.Name })
                    .Distinct()
                    .ToListAsync();

                var techUserIds = techShifts.Select(s => s.TechnicianId).Distinct().ToList();
                var techUsers2 = await _db.Users.OfType<ApplicationUser>().Where(u => techUserIds.Contains(u.Id)).ToListAsync();
                var allIncidents = await _db.Incidents
                    .Where(i => branchId == null || i.BranchId == branchId)
                    .Select(i => new { i.AttendedByTechnicianId, i.Status })
                    .ToListAsync();
                var allTransfers = await _db.TransferRequests
                    .Include(t => t.Contract)
                    .Where(t => (branchId == null || t.Contract.BranchId == branchId) && t.Status == TransferRequestStatus.Completed)
                    .Select(t => t.AssignedTechnicianId)
                    .ToListAsync();

                foreach (var u in techUsers2.OrderBy(u => u.LastName))
                {
                    var branch = techShifts.FirstOrDefault(s => s.TechnicianId == u.Id)?.BranchName ?? "";
                    var assigned = allIncidents.Count(i => i.AttendedByTechnicianId == u.Id);
                    var resolved = allIncidents.Count(i => i.AttendedByTechnicianId == u.Id && i.Status == IncidentStatus.Resolved);
                    var pending = allIncidents.Count(i => i.AttendedByTechnicianId == u.Id && i.Status != IncidentStatus.Resolved && i.Status != IncidentStatus.Cancelled);
                    var transfersDone = allTransfers.Count(id => id == u.Id);
                    sb.AppendLine($"{u.FirstName} {u.LastName},{u.IdentityCard},{branch},{assigned},{resolved},{pending},{transfersDone}");
                }
                break;

            case "inspectors":
                sb.AppendLine("Nombre,Cedula,Sucursal,Casos Revisados,Aprobados,Rechazados,Transferencias Revisadas,Aprobadas,Rechazadas");
                var inspectors = await _db.Users
                    .OfType<ApplicationUser>()
                    .Where(u => u.Role == UserRole.Inspector && (branchId == null || u.BranchId == branchId))
                    .ToListAsync();

                var inspBranches = await _db.Branches.ToDictionaryAsync(b => b.Id, b => b.Name);
                var inspTransfers = await _db.TransferRequests
                    .Include(t => t.Contract)
                    .Where(t => branchId == null || t.Contract.BranchId == branchId)
                    .Select(t => new { t.InspectorId, t.Status })
                    .ToListAsync();
                var inspCases = await _db.VulnerabilityCases
                    .Include(v => v.Contract)
                    .Where(v => branchId == null || v.Contract.BranchId == branchId)
                    .Select(v => v.Status)
                    .ToListAsync();

                foreach (var u in inspectors.OrderBy(u => u.LastName))
                {
                    var branchName = u.BranchId.HasValue && inspBranches.TryGetValue(u.BranchId.Value, out var bn) ? bn : "";
                    var casesReviewed = inspCases.Count(s => s == CaseStatus.Approved || s == CaseStatus.Rejected);
                    var casesApproved = inspCases.Count(s => s == CaseStatus.Approved);
                    var casesRejected = inspCases.Count(s => s == CaseStatus.Rejected);
                    var tReviewed = inspTransfers.Count(t => t.InspectorId == u.Id);
                    var tApproved = inspTransfers.Count(t => t.InspectorId == u.Id && (t.Status == TransferRequestStatus.ApprovedPendingTechnician || t.Status == TransferRequestStatus.Completed));
                    var tRejected = inspTransfers.Count(t => t.InspectorId == u.Id && t.Status == TransferRequestStatus.Rejected);
                    sb.AppendLine($"{u.FirstName} {u.LastName},{u.IdentityCard},{branchName},{casesReviewed},{casesApproved},{casesRejected},{tReviewed},{tApproved},{tRejected}");
                }
                break;

            case "cases":
                sb.AppendLine("Fecha,Ciudadano,Contrato,Tipo Solicitud,Estado,Sucursal");
                var socialCases = await _db.VulnerabilityCases
                    .Include(v => v.Contract).ThenInclude(c => c.Branch)
                    .Where(v => branchId == null || v.Contract.BranchId == branchId)
                    .OrderByDescending(v => v.RequestDate)
                    .ToListAsync();

                var caseOwnerIds = socialCases.Select(c => c.Contract.ApplicationUserId).Distinct().ToList();
                var caseOwners = await _db.Users
                    .OfType<ApplicationUser>()
                    .Where(u => caseOwnerIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => $"{u.FirstName} {u.LastName}");

                foreach (var c in socialCases)
                {
                    var citizen = caseOwners.TryGetValue(c.Contract.ApplicationUserId, out var cn) ? cn : "";
                    var tipo = c.RequestType switch
                    {
                        SocialRequestType.ElderlyAbandoned => "Anciano Abandonado",
                        SocialRequestType.TerminalIllness => "Enfermedad Terminal",
                        SocialRequestType.SingleMother => "Madre Soltera",
                        _ => "General"
                    };
                    var status = c.Status switch
                    {
                        CaseStatus.Pending => "Pendiente",
                        CaseStatus.UnderReview => "En Revisión",
                        CaseStatus.Approved => "Aprobado",
                        CaseStatus.Rejected => "Rechazado",
                        _ => ""
                    };
                    sb.AppendLine($"{c.RequestDate:dd/MM/yyyy},{Csv(citizen)},{c.Contract.ContractNumber},{tipo},{status},{c.Contract.Branch?.Name ?? ""}");
                }
                break;

            case "contracts":
                sb.AppendLine("Fecha Registro,Numero Contrato,Direccion,Sucursal,Titular,Cedula,Estado");
                var contracts = await _db.Contracts
                    .Include(c => c.Branch)
                    .Where(c => branchId == null || c.BranchId == branchId)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var contractOwnerIds = contracts.Select(c => c.ApplicationUserId).Distinct().ToList();
                var contractOwners = await _db.Users
                    .OfType<ApplicationUser>()
                    .Where(u => contractOwnerIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id, u => new { Name = $"{u.FirstName} {u.LastName}", u.IdentityCard });

                foreach (var c in contracts)
                {
                    var owner = contractOwners.TryGetValue(c.ApplicationUserId, out var o) ? o : null;
                    var status = c.Status switch
                    {
                        ContractStatus.Active => "Activo",
                        ContractStatus.Transferred => "Transferido",
                        ContractStatus.Suspended => "Suspendido",
                        _ => ""
                    };
                    sb.AppendLine($"{c.CreatedAt:dd/MM/yyyy},{c.ContractNumber},{Csv(c.ServiceAddress)},{c.Branch?.Name ?? ""},{Csv(owner?.Name ?? "")},{owner?.IdentityCard ?? ""},{status}");
                }
                break;
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string Csv(string value) =>
        value.Contains(',') || value.Contains('"') || value.Contains('\n')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
}
