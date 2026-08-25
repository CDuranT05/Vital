using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransfersController : ControllerBase
{
    private readonly ITransferService _transferService;
    public TransfersController(ITransferService transferService) => _transferService = transferService;

    [HttpPost]
    [Authorize(Roles = "Citizen")]
    public async Task<IActionResult> Create([FromForm] CreateTransferRequest request, [FromForm] List<IFormFile>? documents)
    {
        var citizenId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var docs = (documents ?? [])
            .Where(f => f.Length > 0)
            .Select(f => (f.OpenReadStream(), f.FileName, f.ContentType.Contains("pdf") ? "PDF" : "Imagen"))
            .ToList();
        try
        {
            var result = await _transferService.CreateRequestAsync(request, citizenId, docs);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Inspector")]
    public async Task<IActionResult> GetPending()
    {
        var inspectorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var list = await _transferService.GetPendingForInspectorAsync(inspectorId);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Inspector,Technician")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var dto = await _transferService.GetByIdAsync(id);
            return Ok(dto);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/approve")]
    [Authorize(Roles = "Inspector")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveTransferRequest request)
    {
        var inspectorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await _transferService.ApproveAsync(id, inspectorId, request.ReviewNotes);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/reject")]
    [Authorize(Roles = "Inspector")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectTransferRequest request)
    {
        var inspectorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            var result = await _transferService.RejectAsync(id, inspectorId, request.ReviewNotes);
            return Ok(result);
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
        var list = await _transferService.GetAssignedForTechnicianAsync(technicianId);
        return Ok(list);
    }

    [HttpGet("contract/{contractId:guid}/pending")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> GetPendingForContract(Guid contractId)
    {
        var dto = await _transferService.GetPendingForContractAsync(contractId);
        return dto is null ? NoContent() : Ok(dto);
    }

    [HttpPut("{id:guid}/complete")]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> Complete(Guid id)
    {
        var technicianId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        try
        {
            await _transferService.CompleteAsync(id, technicianId);
            return Ok();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
