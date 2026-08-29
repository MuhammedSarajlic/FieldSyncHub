using backend.Dtos.WorkspaceDto;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.WorkspaceService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/workspace")]
public class WorkspaceController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;
    private readonly ICurrentUser _currentUser;

    public WorkspaceController(IWorkspaceService workspaceService, ICurrentUser currentUser)
    {
        _workspaceService = workspaceService;
        _currentUser = currentUser;
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return new ApiResponse<GetWorkspaceDto>
            {
                Success = false,
                Payload = null,
                ErrorMessage = $"Workspace with ID {id} not found."
            };
        }

        return await _workspaceService.GetWorkspaceById(id, callerWorkspaceId);
    }

    [HttpPost]
    public async Task<ActionResult<GetWorkspaceDto>> CreateWorkspace([FromBody] CreateWorkspaceDto createWorkspaceDto)
    {
        if (_currentUser.UserId is not Guid callerId)
        {
            return Forbid();
        }

        var workspace = await _workspaceService.CreateWorkspace(createWorkspaceDto, callerId);
        return Ok(workspace);
    }

    [HttpPut]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ActionResult<GetWorkspaceDto>> UpdateWorkspace([FromBody] UpdateWorkspaceDto updateWorkspaceDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var workspace = await _workspaceService.UpdateWorkspace(updateWorkspaceDto, callerWorkspaceId);
        return Ok(workspace);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> DeleteWorkspace(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _workspaceService.DeleteWorkspace(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }

        return Ok();
    }
}