using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.EmployeeService;
using backend.Services.JobService;
using backend.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/job")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly IEmployeeService _employeeService;
    private readonly ICurrentUser _currentUser;
    public JobController(IJobService jobService, IEmployeeService employeeService, ICurrentUser currentUser)
    {
        _jobService = jobService;
        _employeeService = employeeService;
        _currentUser = currentUser;
    }

    // A caller with role Employee only sees/edits jobs they're assigned to - this
    // resolves their Employee record (never trusting a request-supplied id) and
    // returns an id that can't match anything if none exists, so lookup failure
    // fails closed rather than silently granting unrestricted access.
    private async Task<Guid?> ResolveJobRestriction(Guid workspaceId)
    {
        if (_currentUser.Role != UserRole.Employee)
        {
            return null;
        }

        var employeeId = await _employeeService.GetEmployeeIdForUserAsync(_currentUser.UserId!.Value, workspaceId);
        return employeeId ?? Guid.Empty;
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ActionResult<ApiResponse<Job>>> GetJobById(Guid jobId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        return Ok(await _jobService.GetJobById(jobId, callerWorkspaceId, restriction));
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<ApiResponse<List<Job>>>> GetJobsByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        return Ok(await _jobService.GetJobsByCustomerId(customerId, callerWorkspaceId, restriction));
    }

    [HttpGet("employee/{employeeId:guid}")]
    public async Task<ActionResult<ApiResponse<List<Job>>>> GetJobsByEmployeeId(Guid employeeId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        // An Employee can only ever list their own jobs this way - otherwise
        // swapping the id in the URL would let them browse any teammate's jobs.
        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        if (restriction != null && restriction != employeeId)
        {
            return Forbid();
        }

        return Ok(await _jobService.GetAllJobsByEmployeeId(employeeId, callerWorkspaceId));
    }

    [HttpGet("workspace/{workspaceId:guid}")]
    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByWorkspace(
    Guid workspaceId,
    [FromQuery] int pageNumber,
    [FromQuery] int pageSize)
    {
        var restriction = await ResolveJobRestriction(workspaceId);
        return await _jobService.GetJobsByWorkspace(workspaceId, pageNumber, pageSize, restriction);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] JobFilterDto filterDto)
    {
        var restriction = await ResolveJobRestriction(workspaceId);
        return await _jobService.GetJobsByFilter(filterDto, workspaceId, pageNumber, pageSize, restriction);
    }

    [HttpGet("job-number/{jobNumber}")]
    public async Task<ActionResult<Job>> GetJobByJobNumber(string jobNumber)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        var job = await _jobService.GetJobByJobNumber(jobNumber, callerWorkspaceId, restriction);
        return Ok(job);
    }


    [HttpPost]
    public async Task<ActionResult<ApiResponse<Job>>> CreateJob([FromBody] CreateJobDto createJobDto)
    {
        var job = await _jobService.CreateJob(createJobDto);
        return Ok(job);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<Job>>> UpdateJob([FromBody] UpdateJobDto updatedJobDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        var job = await _jobService.UpdateJob(updatedJobDto, callerWorkspaceId, restriction);
        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Admin")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        try
        {
            await _jobService.DeleteJob(id, callerWorkspaceId);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        return Ok();
    }

    [HttpPatch("{jobId:guid}/status")]
    public async Task<ActionResult<ApiResponse<Job>>> ChangeJobStatus(Guid jobId, [FromBody] JobStatus status)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || _currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        var result = await _jobService.ChangeJobStatus(jobId, status, callerWorkspaceId, userId, restriction);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPatch("{jobId:guid}/tags")]
    public async Task<IActionResult> UpdateTags(
        Guid jobId,
        [FromBody] List<string> tags,
        [FromQuery] bool replace = false)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        await _jobService.UpdateJobTags(jobId, tags, replace, callerWorkspaceId, restriction);
        return Ok();
    }

    [HttpPost("{jobId:guid}/deposit-payments")]
    public async Task<ActionResult<ApiResponse<Job>>> RecordDepositPayment(
        Guid jobId,
        [FromBody] RecordJobDepositPaymentDto paymentDto)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId || _currentUser.UserId is not Guid recordedByUserId)
        {
            return Forbid();
        }

        var restriction = await ResolveJobRestriction(callerWorkspaceId);
        var result = await _jobService.RecordDepositPayment(jobId, paymentDto, callerWorkspaceId, recordedByUserId, restriction);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("workspace/{workspaceId:guid}/job-stats")]
    public async Task<ApiResponse<JobStatsDto>> GetJobStats(Guid workspaceId)
    {
        var stats = await _jobService.GetJobStats(workspaceId);
        return new ApiResponse<JobStatsDto>
        {
            Success = true,
            Payload = stats
        };
    }


}