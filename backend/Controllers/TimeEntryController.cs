using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/job/{jobId:guid}/time-entries")]
public class TimeEntryController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;

    public TimeEntryController(DataContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> List(Guid jobId)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var entries = await _db.TimeEntries.AsNoTracking().Where(t => t.JobId == jobId && t.WorkspaceId == workspaceId).OrderByDescending(t => t.ClockIn).ToListAsync();
        return Ok(entries.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid jobId, [FromBody] CreateTimeEntryDto dto)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId || _currentUser.UserId is not Guid userId) return Forbid();
        var job = await _db.Jobs.Include(j => j.AssignedTeamMembers).FirstOrDefaultAsync(j => j.Id == jobId && j.WorkspaceId == workspaceId);
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId && e.WorkspaceId == workspaceId);
        if (job == null || employee == null) return NotFound();
        if (!job.AssignedTeamMembers.Any(e => e.Id == employee.Id)) return Forbid();
        if (await _db.TimeEntries.AnyAsync(t => t.EmployeeId == employee.Id && t.ClockOut == null))
            return Conflict(new { message = "You already have an open time entry." });
        var entry = new TimeEntry { Id = Guid.NewGuid(), WorkspaceId = workspaceId, JobId = jobId, EmployeeId = employee.Id, ClockIn = dto.ClockIn.ToUniversalTime(), Type = dto.Type, Notes = dto.Notes };
        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync();
        return Ok(ToDto(entry));
    }

    [HttpPatch("{entryId:guid}/clock-out")]
    public async Task<IActionResult> ClockOut(Guid jobId, Guid entryId, [FromBody] DateTime? clockOut)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId || _currentUser.UserId is not Guid userId) return Forbid();
        var employeeId = await _db.Employees.Where(e => e.UserId == userId && e.WorkspaceId == workspaceId).Select(e => (Guid?)e.Id).FirstOrDefaultAsync();
        var entry = await _db.TimeEntries.FirstOrDefaultAsync(t => t.Id == entryId && t.JobId == jobId && t.WorkspaceId == workspaceId && t.EmployeeId == employeeId);
        if (entry == null) return NotFound();
        entry.ClockOut = (clockOut ?? DateTime.UtcNow).ToUniversalTime();
        if (entry.ClockOut <= entry.ClockIn) return BadRequest(new { message = "Clock-out must be after clock-in." });
        entry.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToDto(entry));
    }

    private static TimeEntryResponseDto ToDto(TimeEntry t) => new(t.Id, t.JobId, t.EmployeeId, t.ClockIn, t.ClockOut, t.Type, t.Notes);
}
