namespace Vital.Application.DTOs;

public record ReportIncidentRequest(Guid ContractId);

public record IncidentDto(
    Guid Id,
    string ContractNumber,
    string BranchName,
    string Description,
    int Status,
    DateTime ReportedAt
);

public record IncidentAlertDto(
    Guid Id,
    string ContractNumber,
    string ServiceAddress,
    string Parish,
    string Municipality,
    string State,
    string CitizenName,
    string CitizenPhone,
    string CitizenIdentityCard,
    DateTime ReportedAt
);

public record AssignedIncidentDto(
    Guid Id,
    string ContractNumber,
    string ServiceAddress,
    string Parish,
    string Municipality,
    string State,
    string CitizenName,
    string CitizenPhone,
    string CitizenIdentityCard,
    DateTime ReportedAt,
    DateTime? AttendedAt,
    int Status
);

public record ResolveIncidentRequest(string? ResolutionNotes);
