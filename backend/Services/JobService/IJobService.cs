using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Wrappers;

namespace backend.Services.JobService;

public interface IJobService
{
    // restrictToEmployeeId, when set, limits the result to jobs that employee is
    // assigned to - how callers with role Employee are kept from browsing every
    // job (and its pricing/customer details) in the workspace.
    Task<ApiResponse<Job>> GetJobById(Guid jobId, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null);
    Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null);
    Task<ApiResponse<List<Job>>> GetAllJobsByEmployeeId(Guid employeeId, Guid callerWorkspaceId);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(Guid workspaceId, int pageNumber, int pageSize, Guid? restrictToEmployeeId = null);
    Task<Job> GetJobByJobNumber(string jobNumber, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null);
    Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(JobFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize, Guid? restrictToEmployeeId = null);
    Task<ApiResponse<Job>> CreateJob(CreateJobDto createJobDto);
    Task<ApiResponse<Job>> UpdateJob(UpdateJobDto updatedJobDto, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null);
    Task DeleteJob(Guid id, Guid callerWorkspaceId);
    Task<ApiResponse<Job>> UpdateJobTags(Guid jobId, List<string> tags, bool replace, Guid callerWorkspaceId, Guid? restrictToEmployeeId = null);
    Task<ApiResponse<Job>> RecordDepositPayment(Guid jobId, RecordJobDepositPaymentDto paymentDto, Guid callerWorkspaceId, Guid recordedByUserId, Guid? restrictToEmployeeId = null);
    Task<JobStatsDto> GetJobStats(Guid workspaceId);
}