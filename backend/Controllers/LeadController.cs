using backend.Dtos.LeadDto;
using backend.Models;
using backend.Response;
using backend.Services.LeadService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/lead")]
public class LeadController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<Lead>>>> GetAllLeads()
    {
        var leads = await _leadService.GetAllLeads();
        return Ok(leads);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Lead>>> GetLeadById(Guid id)
    {
        var leads = await _leadService.GetLeadById(id);
        return Ok(leads);
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<ApiResponse<List<Lead>>>> GetLeadsByWorkspaceId(Guid workspaceId)
    {
        var leads = await _leadService.GetLeadsByWorkspaceId(workspaceId);
        return Ok(leads);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<List<Lead>>>> GetLeadsByCustomerId(Guid customerId)
    {
        var leads = await _leadService.GetLeadsByCustomerId(customerId);
        return Ok(leads);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<Lead>>> CreateLead([FromBody] CreateLeadDto createLeadDto)
    {
        var result = await _leadService.CreateLead(createLeadDto);
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Lead>>> UpdateLead([FromBody] UpdateLeadDto updatedLeadDto)
    {
        var result = await _leadService.UpdateLead(updatedLeadDto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLead(Guid id)
    {
        await _leadService.DeleteLead(id);
        return Ok();
    }
}
