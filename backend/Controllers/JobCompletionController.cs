using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services.CurrentUserService;
using backend.Services.StorageService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/job/{jobId:guid}/completion")]
public class JobCompletionController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;

    public JobCompletionController(DataContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> Complete(Guid jobId, [FromBody] CompleteJobDto dto)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId || _currentUser.UserId is not Guid userId) return Forbid();
        if (string.IsNullOrWhiteSpace(dto.CompletionNote)) return BadRequest(new { message = "A completion note is required." });

        var job = await _db.Jobs.Include(j => j.LineItems).ThenInclude(li => li.ServiceItem).FirstOrDefaultAsync(j => j.Id == jobId && j.WorkspaceId == workspaceId);
        if (job == null) return NotFound();
        if (job.Status == JobStatus.Completed && job.CompletedAt != null) return Conflict(new { message = "This job is already completed." });
        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.UserId == userId && e.WorkspaceId == workspaceId);
        if (employee == null || !await _db.Jobs.Where(j => j.Id == jobId).AnyAsync(j => j.AssignedTeamMembers.Any(e => e.Id == employee.Id))) return Forbid();

        var paths = (dto.CompletionPhotoPaths ?? []).Where(path => UploadPolicy.IsOwnedBy(path, workspaceId, userId)).Distinct().ToList();
        if (dto.CustomerSignaturePath != null && !UploadPolicy.IsOwnedBy(dto.CustomerSignaturePath, workspaceId, userId)) return BadRequest(new { message = "The signature upload does not belong to this workspace." });
        job.CompletionNote = dto.CompletionNote.Trim();
        job.CompletionPhotoPaths = paths;
        job.CustomerSignaturePath = dto.CustomerSignaturePath;
        job.Status = JobStatus.Completed;
        job.CompletedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;
        foreach (var lineItem in job.LineItems.Where(line => line.ServiceItem?.Type == ServiceItemType.Material && line.ServiceItemId.HasValue))
        {
            var item = lineItem.ServiceItem!;
            var quantity = lineItem.Quantity;
            if (item.StockLevel < quantity) return BadRequest(new { message = $"Not enough stock for {item.Name}." });
        }
        foreach (var lineItem in job.LineItems.Where(line => line.ServiceItem?.Type == ServiceItemType.Material && line.ServiceItemId.HasValue))
        {
            var item = lineItem.ServiceItem!;
            item.StockLevel -= lineItem.Quantity;
            item.UpdatedAt = DateTime.UtcNow;
            _db.InventoryTransactions.Add(new InventoryTransaction { Id = Guid.NewGuid(), WorkspaceId = workspaceId, ServiceItemId = item.Id, JobId = job.Id, QuantityDelta = -lineItem.Quantity, Reason = "Job completion", RecordedByUserId = userId });
        }
        await _db.SaveChangesAsync();
        return Ok(new { jobId, completedAt = job.CompletedAt, status = job.Status.ToString(), photoCount = paths.Count });
    }
}
