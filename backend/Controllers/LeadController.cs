using backend.Dtos.LeadDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.LeadService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/lead")]
public class LeadController : ControllerBase
{
    private readonly ILeadService _leadService;
    private readonly ICurrentUser _currentUser;

    public LeadController(ILeadService leadService, ICurrentUser currentUser)
    {
        _leadService = leadService;
        _currentUser = currentUser;
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Lead>>> GetLeadById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var leads = await _leadService.GetLeadById(id, callerWorkspaceId);
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
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var leads = await _leadService.GetLeadsByCustomerId(customerId, callerWorkspaceId);
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
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _leadService.UpdateLead(updatedLeadDto, callerWorkspaceId);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLead(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _leadService.DeleteLead(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }
}
