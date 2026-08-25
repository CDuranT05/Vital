using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IInvoiceService
{
    Task<List<InvoiceDto>> GetUserInvoicesAsync(string userId);
    Task<List<InvoiceDto>> GetContractInvoicesAsync(Guid contractId);
    Task<InvoiceDto?> GetInvoiceByIdAsync(Guid id);
    Task<GenerateInvoiceResultDto> GenerateFromMeterReadingAsync(Guid meterId, decimal currentReading);
}
