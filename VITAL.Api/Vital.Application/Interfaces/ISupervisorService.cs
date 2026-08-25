using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface ISupervisorService
{
    Task<GlobalMetricsDto> GetGlobalMetricsAsync();
    Task<BranchMetricsDto> GetBranchMetricsAsync(Guid branchId);
    Task<byte[]> GenerateCsvReportAsync(Guid? branchId, string reportType);
}
