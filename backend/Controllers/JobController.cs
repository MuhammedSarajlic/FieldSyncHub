using backend.Dtos.JobDto;
using backend.Models;
using backend.Response;
using backend.Services.JobService;
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

    [HttpGet("workspace/{workspaceId}/filter")]
    public async Task<ApiResponse<List<Job>>> GetJobsByFilter([FromQuery] JobFilterDto filterDto, Guid workspaceId)
    {
        return await _jobService.GetJobsByFilter(filterDto, workspaceId);
    }

    [HttpGet("job-number/{jobNumber}")]
    public async Task<ActionResult<Job>> GetJobByJobNumber(string jobNumber)
    {
        var job = await _jobService.GetJobByJobNumber(jobNumber);
        return Ok(job);
    }


    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] CreateJobDto createJobDto)
    {
        await _jobService.CreateJob(createJobDto);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateJob([FromBody] UpdateJobDto updatedJobDto)
    {
        await _jobService.UpdateJob(updatedJobDto);
        return Ok();
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

}