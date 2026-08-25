using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoicesController(IInvoiceService invoiceService) => _invoiceService = invoiceService;

    [HttpGet]
    public async Task<IActionResult> GetMyInvoices()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var invoices = await _invoiceService.GetUserInvoicesAsync(userId);
        return Ok(invoices);
    }

    [HttpGet("contract/{contractId:guid}")]
    public async Task<IActionResult> GetContractInvoices(Guid contractId)
    {
        var invoices = await _invoiceService.GetContractInvoicesAsync(contractId);
        return Ok(invoices);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetInvoice(Guid id)
    {
        var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
        return invoice is null ? NotFound() : Ok(invoice);
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> GenerateInvoice([FromBody] GenerateInvoiceRequest request)
    {
        try
        {
            var result = await _invoiceService.GenerateFromMeterReadingAsync(request.MeterId, request.CurrentReading);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
