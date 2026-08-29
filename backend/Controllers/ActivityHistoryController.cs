using backend.Response;
using backend.Services.ActivityHistoryService;
using backend.Services.CurrentUserService;
using backend.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// So "who deleted this invoice" actually has somewhere to be answered from, not
/// just a table nothing ever reads. Feeds the future UX-14/PROD-12 audit UI.
/// </summary>
[ApiController]
[Route("api/activity")]
public class ActivityHistoryController : ControllerBase
{
    private readonly IActivityHistoryService _activityHistoryService;
    private readonly ICurrentUser _currentUser;

    public ActivityHistoryController(IActivityHistoryService activityHistoryService, ICurrentUser currentUser)
    {
        _activityHistoryService = activityHistoryService;
        _currentUser = currentUser;
    }

    [HttpGet("entity/{entityType}/{entityId:guid}")]
    public async Task<ActionResult<ApiResponse<PagedResult<Models.ActivityHistory>>>> GetByEntity(
        string entityType,
        Guid entityId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return await _activityHistoryService.GetByEntityAsync(entityType, entityId, callerWorkspaceId, pageNumber, pageSize);
    }

    // An administrative view over the whole tenant's history, rather than one
    // record's - kept to Owner/Admin the same way exports and settings are (SEC-11).
    [HttpGet("workspace/{workspaceId:guid}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<ApiResponse<PagedResult<Models.ActivityHistory>>> GetByWorkspace(
        Guid workspaceId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        return await _activityHistoryService.GetByWorkspaceAsync(workspaceId, pageNumber, pageSize);
    }
}
