using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Vital.Application.Interfaces;

namespace Vital.Infrastructure.Services;

/// <summary>
/// Gateway de pagos stub — simula respuesta del banco hasta que se integre la API real.
/// Para integrar un banco real: crear BancoVenezuelaGateway : IPaymentGateway
/// e inyectarlo en Program.cs en lugar de este.
/// </summary>
public class StubPaymentGateway : IPaymentGateway
{
    private readonly IConfiguration _config;

    public StubPaymentGateway(IConfiguration config) => _config = config;

    public Task<PaymentVerificationResult> VerifyPaymentAsync(PaymentVerificationRequest request)
    {
        // En producción: llamar a la API REST del banco con HMAC-SHA256 firmado.
        // Cabeceras requeridas típicas:
        //   X-Api-Key: {apiKey}
        //   X-Timestamp: {utcNow:yyyyMMddHHmmss}
        //   X-Signature: HMAC-SHA256(apiKey + timestamp + referenceNumber, secretKey)
        //
        // Ejemplo de llamada real:
        //   var response = await _httpClient.PostAsJsonAsync(
        //       "https://api.banco.com/v1/verify-payment",
        //       new { reference = request.ReferenceNumber, amount = request.ExpectedAmount }
        //   );

        // Stub: cualquier referencia de 10+ dígitos se considera válida
        var isValid = request.ReferenceNumber.Length >= 10 &&
                      request.ReferenceNumber.All(char.IsDigit);

        var result = isValid
            ? new PaymentVerificationResult(
                IsValid: true,
                TransactionId: $"TXN-{Guid.NewGuid():N}"[..16],
                ConfirmedAmount: request.ExpectedAmount,
                TransactionDate: DateTime.UtcNow,
                FailureReason: null)
            : new PaymentVerificationResult(
                IsValid: false,
                TransactionId: null,
                ConfirmedAmount: null,
                TransactionDate: null,
                FailureReason: "Referencia no encontrada en el sistema bancario.");

        return Task.FromResult(result);
    }

    // Utilidad para firmar peticiones al banco cuando se integre
    public static string ComputeHmacSignature(string apiKey, string timestamp, string reference, string secretKey)
    {
        var payload = $"{apiKey}{timestamp}{reference}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLower();
    }
}
