using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.JobService;

public interface IJobService
{
    Task<ApiResponse<Job>> GetJobById(Guid jobId, Guid callerWorkspaceId);
    Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId, Guid callerWorkspaceId);
    Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId, Guid callerWorkspaceId);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<Job> GetJobByJobNumber(string jobNumber, Guid callerWorkspaceId);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(JobFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<Job>> CreateJob(CreateJobDto createJobDto);
    Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto, Guid callerWorkspaceId);
    Task DeleteJob(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace, Guid callerWorkspaceId);
    Task<JobStatsDto> GetJobStats(Guid workspaceId);
}