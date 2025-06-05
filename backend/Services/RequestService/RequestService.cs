using backend.Data;
using backend.Dtos.RequestDto;
using backend.Models.Request;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.RequestService
{
    public class RequestService : IRequestService
    {
        private readonly DataContext _context;

        public RequestService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<Request>> GetAllRequests()
        {
            return await _context.Requests.ToListAsync();
        }

        public async Task<Request?> GetRequestById(Guid id)
        {
            return await _context.Requests.FindAsync(id);
        }

        public async Task<List<Request>> GetRequestsByWorkspaceId(Guid workspaceId)
        {
            return await _context.Requests
                .Where(r => r.WorkspaceId == workspaceId)
                .ToListAsync();
        }
        public async Task UpdateRequest(UpdateRequestDto updatedRequest)
        {
            var request = updatedRequest.Adapt<Request>();
            _context.Update(request);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteRequest(Guid id)
        {
            var request = await _context.Requests.FindAsync(id);
            if (request == null)
                return false;

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CreateRequestDto> CreateRequest(CreateRequestDto createRequestDto)
        {
            var newRequest = new Request
            {
                Id = Guid.NewGuid(),
                CustomerId = createRequestDto.CustomerId,
                WorkspaceId = createRequestDto.WorkspaceId,
                Description = createRequestDto.Description,
                PreferredDate = createRequestDto.PreferredDate,
                PreferredTime = createRequestDto.PreferredTime,
                Notes = createRequestDto.Notes,
            };

            await _context.Requests.AddAsync(newRequest);

            if (createRequestDto.LineItems != null && createRequestDto.LineItems.Any())
            {
                foreach (var item in createRequestDto.LineItems)
                {
                    item.LineItemId = Guid.NewGuid();
                    await _context.LineItems.AddAsync(item);
                }
            }
            await _context.SaveChangesAsync();
            return createRequestDto;
        }

        public async Task<ApiResponse<List<Request>>> GetRequestByCustomerId(Guid customerId)
        {
            var requests = await _context.Requests
                .Where(r => r.CustomerId == customerId)
                .ToListAsync();

            return new ApiResponse<List<Request>> { Success = true, Payload = requests };
        }
    }
}
