using backend.Dtos.LeadDto;
using backend.Models;
using backend.Response;

namespace backend.Services.LeadService;

public interface ILeadService
{
    Task<ApiResponse<Lead>> GetLeadById(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<List<Lead>>> GetLeadsByWorkspaceId(Guid workspaceId);
    Task<ApiResponse<List<Lead>>> GetLeadsByCustomerId(Guid customerId, Guid callerWorkspaceId);
    Task<ApiResponse<Lead>> CreateLead(CreateLeadDto createLeadDto);
    Task<ApiResponse<Lead>> UpdateLead(UpdateLeadDto updatedLeadDto, Guid callerWorkspaceId);
    Task DeleteLead(Guid id, Guid callerWorkspaceId);
}