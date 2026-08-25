using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MetersController : ControllerBase
{
    private readonly IMeterService _meterService;

    public MetersController(IMeterService meterService) => _meterService = meterService;

    [HttpGet("scan/{qrCode}")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> ScanQr(string qrCode)
    {
        var result = await _meterService.ScanQrAsync(qrCode);
        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> RegisterMeter([FromBody] RegisterMeterRequest request)
    {
        try
        {
            var meter = await _meterService.RegisterMeterAsync(request);
            return Ok(meter);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{meterId:guid}/readings")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> RecordReading(Guid meterId, [FromBody] RecordReadingRequest request)
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var reading = await _meterService.RecordReadingAsync(meterId, technicianId, request);
            return Ok(reading);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{meterId:guid}/readings")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> GetReadings(Guid meterId)
    {
        try
        {
            var readings = await _meterService.GetMeterReadingsAsync(meterId);
            return Ok(readings);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
