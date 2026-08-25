using Vital.Application.DTOs;

namespace Vital.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentDto> SubmitPaymentAsync(SubmitPaymentRequest request, string? receiptPath);
}
