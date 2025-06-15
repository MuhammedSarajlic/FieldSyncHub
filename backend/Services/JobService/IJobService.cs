using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;

namespace backend.Services.JobService;

public interface IJobService
{
    Task<ApiResponse<List<Job>>> GetJobs();
    Task<ApiResponse<Job>> GetJobById(Guid jobId);
    Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId);
    Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId);
    Task<Job> GetJobByJobNumber(string jobNumber);
    Task<ApiResponse<List<Job>>> GetJobsByFilter(JobFilterDto filterDto, Guid workspaceId);
    Task<Job> CreateJob(CreateJobDto createJobDto);
    Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto);
    Task DeleteJob(Guid id);
    Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace);
}