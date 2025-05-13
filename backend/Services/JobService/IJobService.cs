using backend.Models;
using backend.Response;

namespace backend.Services.JobService;

public interface IJobService
{
    Task<ApiResponse<List<Job>>> GetJobs();
    Task CreateJob(Job newJob);
    Task DeleteJob(Guid id);
}