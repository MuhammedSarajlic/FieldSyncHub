using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.ActivityHistoryService;

public interface IActivityHistoryService
{
    /// <summary>The audit trail for one record, newest first - works even after the
    /// record itself has been deleted, since EntityId/EntityType/ChangedBy/Action
    /// are captured independently of the record's own lifecycle.</summary>
    Task<ApiResponse<PagedResult<ActivityHistory>>> GetByEntityAsync(
        string entityType, Guid entityId, Guid callerWorkspaceId, int pageNumber, int pageSize);

    /// <summary>The full workspace feed, newest first.</summary>
    Task<ApiResponse<PagedResult<ActivityHistory>>> GetByWorkspaceAsync(
        Guid workspaceId, int pageNumber, int pageSize);
}
