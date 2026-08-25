using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IContractService
{
    Task<List<ContractDto>> GetUserContractsAsync(string userId);
    Task<ContractDto?> GetContractByIdAsync(Guid id);
    Task<ContractDto> CreateContractAsync(CreateContractRequest request);
}
