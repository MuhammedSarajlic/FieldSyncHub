using backend.Models;
using backend.Response;

namespace backend.Services.JobService;

public interface IJobService
{
    Task<ApiResponse<List<Job>>> GetJobs();
    Task<ApiResponse<Job>> GetJobById(Guid jobId);
    Task CreateJob(Job newJob);
    Task DeleteJob(Guid id);
    Task<ApiResponse<Job>> UpdateJob(Job updatedJob);
    Task<Job?> GetJobByJobNumber(string jobNumber);
    Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId);
    Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId);
    Task<ApiResponse<List<Job>>> GetJobsByFilter(DateTime? scheduleDateMin, DateTime? scheduleDateMax,
                                                 decimal? totalMin, decimal? totalMax,
                                                 string? priority, string? status,
                                                 string? sortBy, string? sort);
}