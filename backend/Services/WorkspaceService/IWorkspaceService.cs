using backend.Models;
using backend.Response;

namespace backend.Services.WorkspaceService;

public interface IWorkspaceService
{
    Task<ApiResponse<List<Workspace>>> GetWorkspaces();
    Task<ApiResponse<Workspace>> GetWorkspaceById(Guid id);
    Task AddWorkspace(Workspace newWorkspace);
    Task UpdateWorkspace(Workspace updatedWorkspace);
    Task DeleteWorkspace(Guid id);
}