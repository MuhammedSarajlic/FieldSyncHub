using backend.Models;
using backend.Response;
using backend.Services.WorkspaceService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/workspace")]
public class WorkspaceController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;

    public WorkspaceController(IWorkspaceService workspaceService)
    {
        _workspaceService = workspaceService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<Workspace>>> GetWorkspaces()
    {
        return await _workspaceService.GetWorkspaces();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<Workspace>> GetWorkspaceById(Guid id)
    {
        return await _workspaceService.GetWorkspaceById(id);
    }

    [HttpPost]
    public async Task<IActionResult> AddWorkspace([FromQuery] Workspace newWorkspace)
    {
        await _workspaceService.AddWorkspace(newWorkspace);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateWorkspace([FromQuery] Workspace updatedWorkspace)
    {
        await _workspaceService.UpdateWorkspace(updatedWorkspace);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkspace(Guid id)
    {
        await _workspaceService.DeleteWorkspace(id);
        return Ok();
    }
}