using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.JobService;

public interface IJobService
{
    Task<ApiResponse<Job>> GetJobById(Guid jobId);
    Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId);
    Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(Guid workspaceId, int pageNumber, int pageSize);
    Task<Job> GetJobByJobNumber(string jobNumber);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(JobFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize);
    Task<ApiResponse<Job>> CreateJob(CreateJobDto createJobDto);
    Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto);
    Task DeleteJob(Guid id);
    Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace);
    Task<JobStatsDto> GetJobStats(Guid workspaceId);
}