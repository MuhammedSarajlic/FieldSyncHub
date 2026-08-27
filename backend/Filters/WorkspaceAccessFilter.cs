using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Filters;

/// <summary>
/// Runs on every request. Any action whose route template includes a
/// {workspaceId} segment must be scoped to the caller's own workspace - otherwise
/// [Authorize] alone still lets an authenticated user from one workspace read
/// another's data just by changing the GUID in the URL. This rejects the request
/// with 403 before the action runs if the route's workspaceId doesn't match the
/// workspaceId claim from the caller's token.
/// </summary>
public class WorkspaceAccessFilter : IAsyncActionFilter
{
    private readonly ICurrentUser _currentUser;

    public WorkspaceAccessFilter(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.RouteData.Values.TryGetValue("workspaceId", out var routeValue)
            && Guid.TryParse(routeValue?.ToString(), out var routeWorkspaceId))
        {
            if (_currentUser.WorkspaceId is null || routeWorkspaceId != _currentUser.WorkspaceId)
            {
                context.Result = new ObjectResult(new { message = "You do not have access to this workspace." })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }
        }

        await next();
    }
}
