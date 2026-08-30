using Microsoft.AspNetCore.Mvc.Filters;

namespace backend.Filters;

/// <summary>
/// Keeps every API paging endpoint bounded before its service builds a query.
/// Missing, zero, negative, and oversized values all resolve to safe defaults.
/// </summary>
public sealed class PaginationFilter : IAsyncActionFilter
{
    public const int DefaultPageNumber = 1;
    public const int DefaultPageSize = 25;
    public const int MaxPageSize = 100;

    public Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.ActionArguments.ContainsKey("pageNumber"))
        {
            var pageNumber = context.ActionArguments["pageNumber"] is int value
                ? value
                : DefaultPageNumber;
            context.ActionArguments["pageNumber"] = Math.Max(DefaultPageNumber, pageNumber);
        }

        if (context.ActionArguments.ContainsKey("pageSize"))
        {
            var pageSize = context.ActionArguments["pageSize"] is int value
                ? value
                : DefaultPageSize;
            context.ActionArguments["pageSize"] = Math.Clamp(pageSize, 1, MaxPageSize);
        }

        return ContinueAsync();

        async Task ContinueAsync()
        {
            await next();
        }
    }
}
