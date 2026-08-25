namespace Vital.Application.DTOs;

public record SubmitPaymentRequest(
    Guid InvoiceId,
    string ReferenceNumber,
    int PaymentMethod
);

public record PaymentDto(
    Guid Id,
    Guid InvoiceId,
    string ContractNumber,
    decimal Amount,
    DateTime PaymentDate,
    string ReferenceNumber,
    int PaymentMethod,
    string? ReceiptPath
);
