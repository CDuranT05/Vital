using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vital.Application.DTOs;
using Vital.Application.Interfaces;

namespace VITAL.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContractsController : ControllerBase
{
    private readonly IContractService _contractService;

    public ContractsController(IContractService contractService) => _contractService = contractService;

    [HttpGet]
    public async Task<IActionResult> GetMyContracts()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var contracts = await _contractService.GetUserContractsAsync(userId);
        return Ok(contracts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetContract(Guid id)
    {
        var contract = await _contractService.GetContractByIdAsync(id);
        return contract is null ? NotFound() : Ok(contract);
    }

    [HttpPost]
    [Authorize(Roles = "Technician")]
    public async Task<IActionResult> CreateContract([FromBody] CreateContractRequest request)
    {
        try
        {
            var contract = await _contractService.CreateContractAsync(request);
            return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contract);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
