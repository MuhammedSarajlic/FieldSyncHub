using backend.Dtos.WorkspaceDto;
using backend.Response;

namespace backend.Services.WorkspaceService;

public interface IWorkspaceService
{
    Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<GetWorkspaceDto>> CreateWorkspace(CreateWorkspaceDto createWorkspaceDto, Guid createdById);
    Task<ApiResponse<GetWorkspaceDto>> UpdateWorkspace(UpdateWorkspaceDto updateWorkspaceDto, Guid callerWorkspaceId);
    Task DeleteWorkspace(Guid id, Guid callerWorkspaceId);
}