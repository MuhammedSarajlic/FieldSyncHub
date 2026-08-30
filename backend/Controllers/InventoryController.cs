using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public record InventoryAdjustment(decimal QuantityDelta, string Reason, Guid? JobId);

[ApiController]
[Route("api/inventory")]
public class InventoryController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    public InventoryController(DataContext db, ICurrentUser currentUser) { _db = db; _currentUser = currentUser; }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.ServiceItems.Where(s => s.WorkspaceId == workspaceId && s.Type == ServiceItemType.Material && !s.IsArchived).Select(s => new { s.Id, s.Name, s.SKU, s.UnitOfMeasure, s.StockLevel, s.ReorderPoint, lowStock = s.StockLevel <= s.ReorderPoint }).ToListAsync());
    }

    [HttpGet("{serviceItemId:guid}/transactions")]
    public async Task<IActionResult> Transactions(Guid serviceItemId)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.InventoryTransactions.Where(t => t.ServiceItemId == serviceItemId && t.WorkspaceId == workspaceId).OrderByDescending(t => t.CreatedAt).ToListAsync());
    }

    [HttpPost("{serviceItemId:guid}/adjust")]
    public async Task<IActionResult> Adjust(Guid serviceItemId, InventoryAdjustment adjustment)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId || _currentUser.UserId is not Guid userId) return Forbid();
        if (adjustment.QuantityDelta == 0 || string.IsNullOrWhiteSpace(adjustment.Reason)) return BadRequest(new { message = "A non-zero adjustment and reason are required." });
        var item = await _db.ServiceItems.FirstOrDefaultAsync(s => s.Id == serviceItemId && s.WorkspaceId == workspaceId && s.Type == ServiceItemType.Material);
        if (item == null) return NotFound();
        if (adjustment.JobId is Guid jobId && !await _db.Jobs.AnyAsync(job => job.Id == jobId && job.WorkspaceId == workspaceId)) return BadRequest(new { message = "The job does not belong to this workspace." });
        if (item.StockLevel + adjustment.QuantityDelta < 0) return BadRequest(new { message = "This adjustment would make stock negative." });
        item.StockLevel += adjustment.QuantityDelta; item.UpdatedAt = DateTime.UtcNow;
        _db.InventoryTransactions.Add(new InventoryTransaction { Id = Guid.NewGuid(), WorkspaceId = workspaceId, ServiceItemId = item.Id, QuantityDelta = adjustment.QuantityDelta, Reason = adjustment.Reason.Trim(), JobId = adjustment.JobId, RecordedByUserId = userId });
        await _db.SaveChangesAsync();
        return Ok(new { item.Id, item.StockLevel, lowStock = item.StockLevel <= item.ReorderPoint });
    }
}
