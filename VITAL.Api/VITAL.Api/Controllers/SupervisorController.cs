using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor")]
public class SupervisorController : ControllerBase
{
    private readonly ISupervisorService _supervisorService;

    public SupervisorController(ISupervisorService supervisorService) =>
        _supervisorService = supervisorService;

    [HttpGet("metrics")]
    public async Task<IActionResult> GetGlobalMetrics()
    {
        var metrics = await _supervisorService.GetGlobalMetricsAsync();
        return Ok(metrics);
    }

    [HttpGet("metrics/{branchId:guid}")]
    public async Task<IActionResult> GetBranchMetrics(Guid branchId)
    {
        try
        {
            var metrics = await _supervisorService.GetBranchMetricsAsync(branchId);
            return Ok(metrics);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("report")]
    public async Task<IActionResult> DownloadReport(
        [FromQuery] Guid? branchId,
        [FromQuery] string type)
    {
        var validTypes = new[] { "technicians", "inspectors", "cases", "contracts" };
        if (string.IsNullOrWhiteSpace(type) || !validTypes.Contains(type.ToLower()))
            return BadRequest(new { message = "Tipo de reporte inválido. Use: technicians, inspectors, cases, contracts." });

        var csv = await _supervisorService.GenerateCsvReportAsync(branchId, type);
        var fileName = $"vital-{type}-{DateTime.UtcNow:yyyyMMdd}.csv";
        return File(csv, "text/csv; charset=utf-8", fileName);
    }
}
