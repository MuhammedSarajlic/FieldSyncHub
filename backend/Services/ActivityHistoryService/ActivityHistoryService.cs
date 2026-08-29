using backend.Data;
using backend.Models;
using backend.Response;
using backend.Wrappers;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.ActivityHistoryService;

public class ActivityHistoryService : IActivityHistoryService
{
    private readonly DataContext _context;

    public ActivityHistoryService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<PagedResult<ActivityHistory>>> GetByEntityAsync(
        string entityType, Guid entityId, Guid callerWorkspaceId, int pageNumber, int pageSize)
    {
        // Scoped by WorkspaceId on the audit row itself, not by re-checking the
        // live record - that's the entire point for a deleted one, and it also
        // means an id from another tenant can't be used to probe this workspace's
        // history just by guessing.
        var query = _context.ActivityHistorys
            .Where(a => a.EntityType == entityType && a.EntityId == entityId && a.WorkspaceId == callerWorkspaceId)
            .OrderByDescending(a => a.ChangedAt);

        return await PageAsync(query, pageNumber, pageSize);
    }

    public async Task<ApiResponse<PagedResult<ActivityHistory>>> GetByWorkspaceAsync(
        Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.ActivityHistorys
            .Where(a => a.WorkspaceId == workspaceId)
            .OrderByDescending(a => a.ChangedAt);

        return await PageAsync(query, pageNumber, pageSize);
    }

    private static async Task<ApiResponse<PagedResult<ActivityHistory>>> PageAsync(
        IQueryable<ActivityHistory> query, int pageNumber, int pageSize)
    {
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ApiResponse<PagedResult<ActivityHistory>>
        {
            Success = true,
            Payload = new PagedResult<ActivityHistory>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }
}
