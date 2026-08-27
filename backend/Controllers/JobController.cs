using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Services.CurrentUserService;
using backend.Services.JobService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/job")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;
    private readonly ICurrentUser _currentUser;
    public JobController(IJobService jobService, ICurrentUser currentUser)
    {
        _jobService = jobService;
        _currentUser = currentUser;
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ActionResult<ApiResponse<Job>>> GetJobById(Guid jobId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _jobService.GetJobById(jobId, callerWorkspaceId));
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ActionResult<ApiResponse<List<Job>>>> GetJobsByCustomerId(Guid customerId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        return Ok(await _jobService.GetJobsByCustomerId(customerId, callerWorkspaceId));
    }

    [HttpGet("employee/{employeeId:guid}")]
    public async Task<ActionResult<ApiResponse<List<Job>>>> GetJobsByEmployeeId(Guid employeeId)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
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
        return await _jobService.GetJobsByWorkspace(workspaceId, pageNumber, pageSize);
    }

    [HttpGet("workspace/{workspaceId:guid}/filter")]
    public async Task<ApiResponse<PagedResult<Job>>> GetJobsByFilter(
        Guid workspaceId,
        [FromQuery] int pageNumber,
        [FromQuery] int pageSize,
        [FromQuery] JobFilterDto filterDto)
    {
        return await _jobService.GetJobsByFilter(filterDto, workspaceId, pageNumber, pageSize);
    }

    [HttpGet("job-number/{jobNumber}")]
    public async Task<ActionResult<Job>> GetJobByJobNumber(string jobNumber)
    {
        if (_currentUser.WorkspaceId is not Guid callerWorkspaceId)
        {
            return Forbid();
        }

        var job = await _jobService.GetJobByJobNumber(jobNumber, callerWorkspaceId);
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

        var job = await _jobService.UpdateJob(updatedJobDto, callerWorkspaceId);
        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
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

        await _jobService.UpdateJobTags(jobId, tags, replace, callerWorkspaceId);
        return Ok();
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