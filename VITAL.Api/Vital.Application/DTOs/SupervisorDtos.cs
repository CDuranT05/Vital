namespace Vital.Application.DTOs;

public record TechnicianMetricDto(
    string Id,
    string Name,
    string IdentityCard,
    int IncidentsAssigned,
    int IncidentsResolved,
    int IncidentsPending,
    int TransfersCompleted
);

public record InspectorMetricDto(
    string Id,
    string Name,
    string IdentityCard,
    int CasesReviewed,
    int CasesApproved,
    int CasesRejected,
    int TransfersReviewed,
    int TransfersApproved,
    int TransfersRejected
);

public record BranchMetricsDto(
    Guid BranchId,
    string BranchName,
    string City,
    int ActiveContracts,
    int TotalIncidents,
    int ResolvedIncidents,
    int PendingIncidents,
    int TotalTransfers,
    int PendingTransfers,
    int CompletedTransfers,
    int TotalCases,
    int PendingCases,
    int ApprovedCases,
    int RejectedCases,
    List<TechnicianMetricDto> Technicians,
    List<InspectorMetricDto> Inspectors
);

public record GlobalMetricsDto(
    int TotalActiveContracts,
    int TotalIncidents,
    int TotalResolvedIncidents,
    int TotalTransfers,
    int TotalCompletedTransfers,
    int TotalCases,
    int TotalApprovedCases,
    List<BranchMetricsDto> Branches
);
