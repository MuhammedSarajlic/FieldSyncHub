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
    public async Task<ApiResponse<List<Job>>> GetJobs(){
        return await _jobService.GetJobs();
    }

    [HttpGet("{jobId:guid}")]
    public async Task<ApiResponse<Job>> GetJobById(Guid jobId){
        return await _jobService.GetJobById(jobId);
    }

    [HttpPost]
    public async Task<IActionResult> CreateJob([FromBody] Job newJob){
        await _jobService.CreateJob(newJob);
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteJob(Guid id){
        await _jobService.DeleteJob(id);
        return Ok();
    }
}