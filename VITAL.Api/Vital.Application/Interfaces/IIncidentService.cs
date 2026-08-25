using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IIncidentService
{
    Task<IncidentDto> ReportIncidentAsync(ReportIncidentRequest request, string citizenId);
    Task<List<IncidentAlertDto>> GetAlertsForTechnicianAsync(string technicianId);
    Task AcknowledgeIncidentAsync(Guid incidentId, string technicianId);
    Task<List<AssignedIncidentDto>> GetAssignedIncidentsAsync(string technicianId);
    Task ResolveIncidentAsync(Guid incidentId, string technicianId, string? notes, List<(Stream Data, string FileName)> photos);
}
