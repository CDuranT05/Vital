using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface ITransferService
{
    Task<TransferRequestDto> CreateRequestAsync(CreateTransferRequest request, string citizenId, List<(Stream Data, string FileName, string DocumentType)> documents);
    Task<List<TransferRequestDto>> GetPendingForInspectorAsync(string inspectorId);
    Task<TransferRequestDto> GetByIdAsync(Guid id);
    Task<TransferRequestDto> ApproveAsync(Guid id, string inspectorId, string? notes);
    Task<TransferRequestDto> RejectAsync(Guid id, string inspectorId, string notes);
    Task<List<TechnicianTransferDto>> GetAssignedForTechnicianAsync(string technicianId);
    Task<TechnicianTransferDto?> GetPendingForContractAsync(Guid contractId);
    Task CompleteAsync(Guid id, string technicianId);
}
