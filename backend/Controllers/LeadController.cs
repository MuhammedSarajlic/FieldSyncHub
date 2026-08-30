using backend.Dtos.LeadDto;
using backend.Dtos.Response;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.LeadService;
using Microsoft.AspNetCore.Authorization;
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


    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<LeadResponseDto>>> GetLeadById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var leads = await _leadService.GetLeadById(id, callerWorkspaceId);
        return Ok(leads.Map(payload => payload.ToResponse()));
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ActionResult<ApiResponse<List<LeadResponseDto>>>> GetLeadsByWorkspaceId(Guid workspaceId)
    {
        var leads = await _leadService.GetLeadsByWorkspaceId(workspaceId);
        return Ok(leads.MapList(lead => lead.ToResponse()));
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<ApiResponse<List<LeadResponseDto>>>> GetLeadsByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var leads = await _leadService.GetLeadsByCustomerId(customerId, callerWorkspaceId);
        return Ok(leads.MapList(lead => lead.ToResponse()));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LeadResponseDto>>> CreateLead([FromBody] CreateLeadDto createLeadDto)
    {
        var result = await _leadService.CreateLead(createLeadDto);
        return Ok(result.Map(payload => payload.ToResponse()));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<LeadResponseDto>>> UpdateLead([FromBody] UpdateLeadDto updatedLeadDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var result = await _leadService.UpdateLead(updatedLeadDto, callerWorkspaceId);
        return Ok(result.Map(payload => payload.ToResponse()));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Admin")]
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
