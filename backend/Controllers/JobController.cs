using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Services.JobService;
using backend.Wrappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/job")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;
    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<ApiResponse<List<Job>>> GetJobs()
    {
        return await _jobService.GetJobs();
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ApiResponse<Job>> GetJobById(Guid jobId)
    {
        return await _jobService.GetJobById(jobId);
    }

    [HttpGet("customer/{customerId:guid}")]
    public async Task<ApiResponse<List<Job>>> GetJobsByCustomerId(Guid customerId)
    {
        return await _jobService.GetJobsByCustomerId(customerId);
    }

    [HttpGet("employee/{employeeId:guid}")]
    public async Task<ApiResponse<List<Job>>> GetJobsByEmployeeId(Guid employeeId)
    {
        return await _jobService.GetAllJobsByEmployeeId(employeeId);
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
        var job = await _jobService.GetJobByJobNumber(jobNumber);
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
        var job = await _jobService.UpdateJob(updatedJobDto);
        return Ok(job);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        await _jobService.DeleteJob(id);
        return Ok();
    }

    [HttpPatch("{jobId:guid}/tags")]
    public async Task<IActionResult> UpdateTags(
        Guid jobId,
        [FromBody] List<string> tags,
        [FromQuery] bool replace = false)
    {
        await _jobService.UpdateJobTags(jobId, tags, replace);
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