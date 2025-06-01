using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.RequestDto;
using backend.Models.Request;

namespace backend.Services.RequestService
{
    public interface IRequestService
    {
        Task<List<Request>> GetAllRequests();
        Task<Request?> GetRequestById(Guid id);
        Task<List<Request>> GetRequestsByWorkspaceId(Guid workspaceId);
        Task<CreateRequestDto> CreateRequest(CreateRequestDto createRequestDto);
        Task UpdateRequest(UpdateRequestDto updatedRequest);
        Task<bool> DeleteRequest(Guid id);
    }
}