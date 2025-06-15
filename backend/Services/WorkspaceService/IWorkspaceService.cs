using backend.Dtos.WorkspaceDto;
using backend.Response;

namespace backend.Services.WorkspaceService;

public interface IWorkspaceService
{
    Task<ApiResponse<List<GetWorkspaceDto>>> GetWorkspaces();
    Task<ApiResponse<GetWorkspaceDto>> GetWorkspaceById(Guid id);
    Task<ApiResponse<GetWorkspaceDto>> CreateWorkspace(CreateWorkspaceDto createWorkspaceDto, Guid createdById);
    Task<ApiResponse<GetWorkspaceDto>> UpdateWorkspace(UpdateWorkspaceDto updateWorkspaceDto);
    Task DeleteWorkspace(Guid id);
}