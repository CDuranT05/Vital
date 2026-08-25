namespace Vital.Application.Interfaces;

/// <summary>
/// Abstracción del gateway bancario.
/// Implementar una clase concreta por banco (BancoVenezuela, Mercantil, etc.)
/// y registrarla en Program.cs según configuración.
/// </summary>
public interface IPaymentGateway
{
    /// <summary>
    /// Consulta en el banco si la referencia de pago existe y corresponde al monto indicado.
    /// </summary>
    Task<PaymentVerificationResult> VerifyPaymentAsync(PaymentVerificationRequest request);
}

public record PaymentVerificationRequest(
    string ReferenceNumber,
    decimal ExpectedAmount,
    string PayerPhone,        // para verificar en pago móvil
    DateTime ExpectedDate     // el banco confirma que la transacción fue en esa fecha
);

public record PaymentVerificationResult(
    bool IsValid,
    string? TransactionId,    // ID interno del banco si confirmó
    decimal? ConfirmedAmount,
    DateTime? TransactionDate,
    string? FailureReason
);
