using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;

    public IncidentsController(IIncidentService incidentService) => _incidentService = incidentService;

    [HttpPost]
    [Authorize(Roles = "Citizen,Technician,Inspector")]
    public async Task<IActionResult> ReportIncident([FromBody] ReportIncidentRequest request)
    {
        var citizenId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var incident = await _incidentService.ReportIncidentAsync(request, citizenId);
            return Ok(incident);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("alerts")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> GetAlerts()
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var alerts = await _incidentService.GetAlertsForTechnicianAsync(technicianId);
        return Ok(alerts);
    }

    [HttpPut("{id:guid}/acknowledge")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> Acknowledge(Guid id)
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            await _incidentService.AcknowledgeIncidentAsync(id, technicianId);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("assigned")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> GetAssigned()
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var incidents = await _incidentService.GetAssignedIncidentsAsync(technicianId);
        return Ok(incidents);
    }

    [HttpPut("{id:guid}/resolve")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> Resolve(Guid id, [FromForm] string? resolutionNotes, [FromForm] List<IFormFile>? photos)
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var photoStreams = (photos ?? [])
            .Where(f => f.Length > 0)
            .Select(f => (f.OpenReadStream(), f.FileName))
            .ToList();
        try
        {
            await _incidentService.ResolveIncidentAsync(id, technicianId, resolutionNotes, photoStreams);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
