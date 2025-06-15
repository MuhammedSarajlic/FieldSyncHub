using backend.Dtos.RequestDto;
using backend.Models.RequestModels;
using backend.Response;

namespace backend.Services.RequestService;

public interface IRequestService
{
    Task<ApiResponse<List<Request>>> GetAllRequests();
    Task<ApiResponse<Request>> GetRequestById(Guid id);
    Task<ApiResponse<List<Request>>> GetRequestsByWorkspaceId(Guid workspaceId);
    Task<ApiResponse<List<Request>>> GetRequestByCustomerId(Guid customerId);
    Task<ApiResponse<Request>> CreateRequest(CreateRequestDto createRequestDto);
    Task<ApiResponse<Request>> UpdateRequest(UpdateRequestDto updatedRequestDto);
    Task DeleteRequest(Guid id);
}