using backend.Dtos.WorkspaceDto;
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
    public async Task<ApiResponse<List<GetWorkspaceDto>>> GetWorkspaces()
    {
        return await _workspaceService.GetWorkspaces();
    }

    [HttpGet("{id:guid}")]
    public async Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id)
    {
        return await _workspaceService.GetWorkspaceById(id);
    }

    [HttpPost("{createdById:guid}")]
    public async Task<ActionResult<GetWorkspaceDto>> CreateWorkspace([FromBody] CreateWorkspaceDto createWorkspaceDto, Guid createdById)
    {
        var workspace = await _workspaceService.CreateWorkspace(createWorkspaceDto, createdById);
        return Ok(workspace);
    }

    [HttpPut]
    public async Task<ActionResult<GetWorkspaceDto>> UpdateWorkspace([FromBody] UpdateWorkspaceDto updateWorkspaceDto)
    {
        var workspace = await _workspaceService.UpdateWorkspace(updateWorkspaceDto);
        return Ok(workspace);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteWorkspace(Guid id)
    {
        await _workspaceService.DeleteWorkspace(id);
        return Ok();
    }
}