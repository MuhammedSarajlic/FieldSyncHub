using backend.Data;
using backend.Dtos.RequestDto;
using backend.Models.RequestModels;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.RequestService;

public class RequestService : IRequestService
{
    private readonly DataContext _context;

    public RequestService(DataContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<Request>>> GetAllRequests()
    {
        var requests = await _context.Requests.Include(r => r.Customer)
                                    .Include(r => r.LineItems)
                                    .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> GetRequestById(Guid id)
    {
        var request = await _context.Requests.Where(r => r.Id == id)
                                    .Include(r => r.Customer)
                                    .Include(r => r.LineItems)
                                    .FirstOrDefaultAsync();

        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }


    public async Task<ApiResponse<List<Request>>> GetRequestsByWorkspaceId(Guid workspaceId)
    {
        var requests = await _context.Requests.Where(r => r.WorkspaceId == workspaceId)
                                            .Include(r => r.Customer)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<List<Request>>> GetRequestByCustomerId(Guid customerId)
    {
        var requests = await _context.Requests.Where(r => r.CustomerId == customerId)
                                            .Include(r => r.Customer)
                                            .Include(r => r.LineItems)
                                            .ToListAsync();

        return new ApiResponse<List<Request>>
        {
            Success = true,
            Payload = requests,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> CreateRequest(CreateRequestDto createRequestDto)
    {
        var request = createRequestDto.Adapt<Request>();
        request.Id = Guid.NewGuid();

        await _context.Requests.AddAsync(request);
        await _context.SaveChangesAsync();

        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }

    public async Task<ApiResponse<Request>> UpdateRequest(UpdateRequestDto updatedRequestDto)
    {
        var request = updatedRequestDto.Adapt<Request>();
        request.UpdatedAt = DateTime.UtcNow;

        _context.Update(request);
        await _context.SaveChangesAsync();

        return new ApiResponse<Request>
        {
            Success = true,
            Payload = request,
            ErrorMessage = null
        };
    }

    public async Task DeleteRequest(Guid id)
    {
        var request = await _context.Requests.FindAsync(id);

        _context.Requests.Remove(request);
        await _context.SaveChangesAsync();
    }
}
