using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Filters;

/// <summary>
/// Runs on every request. Any action with a parameter named "workspaceId" - whether
/// bound from the route, the query string, or (for a top-level string/Guid parameter)
/// the body - must be scoped to the caller's own workspace, otherwise [Authorize]
/// alone still lets an authenticated user from one workspace read or write another's
/// data just by supplying a different GUID. This rejects the request with 403 before
/// the action runs if that value doesn't match the workspaceId claim from the
/// caller's token. Route data is checked first since it's cheap and covers the
/// common case; ActionArguments is the fallback for query/body-bound parameters so a
/// new action that takes workspaceId as a plain parameter fails closed instead of
/// silently trusting the caller.
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
        if (TryGetRequestedWorkspaceId(context, out var requestedWorkspaceId))
        {
            if (_currentUser.WorkspaceId is null || requestedWorkspaceId != _currentUser.WorkspaceId)
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

    private static bool TryGetRequestedWorkspaceId(ActionExecutingContext context, out Guid workspaceId)
    {
        if (context.RouteData.Values.TryGetValue("workspaceId", out var routeValue)
            && Guid.TryParse(routeValue?.ToString(), out workspaceId))
        {
            return true;
        }

        foreach (var (key, value) in context.ActionArguments)
        {
            if (string.Equals(key, "workspaceId", StringComparison.OrdinalIgnoreCase)
                && value is Guid guidValue)
            {
                workspaceId = guidValue;
                return true;
            }
        }

        workspaceId = Guid.Empty;
        return false;
    }
}
