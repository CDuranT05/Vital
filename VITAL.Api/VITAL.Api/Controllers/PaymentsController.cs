using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Citizen,Technician,Inspector")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService) => _paymentService = paymentService;

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> SubmitPayment(
        [FromForm] Guid invoiceId,
        [FromForm] string referenceNumber,
        [FromForm] int paymentMethod,
        IFormFile? receipt)
    {
        string? receiptPath = null;

        if (receipt is { Length: > 0 })
        {
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "receipts");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(receipt.FileName)}";
            receiptPath = Path.Combine("uploads", "receipts", fileName);
            using var stream = System.IO.File.Create(Path.Combine(Directory.GetCurrentDirectory(), receiptPath));
            await receipt.CopyToAsync(stream);
        }

        try
        {
            var request = new SubmitPaymentRequest(invoiceId, referenceNumber, paymentMethod);
            var result = await _paymentService.SubmitPaymentAsync(request, receiptPath);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
