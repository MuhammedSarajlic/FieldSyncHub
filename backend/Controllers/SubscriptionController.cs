using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public record ChangePlanRequest(string Plan, int SeatCount);

[ApiController]
[Route("api/subscription")]
public class SubscriptionController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    public SubscriptionController(DataContext db, ICurrentUser currentUser) { _db = db; _currentUser = currentUser; }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var subscription = await Ensure(workspaceId);
        return Ok(new { subscription.Id, subscription.Plan, subscription.SeatCount, subscription.Status, subscription.TrialEndsAt, subscription.CurrentPeriodEndsAt });
    }

    [HttpPut("plan")]
    public async Task<IActionResult> ChangePlan(ChangePlanRequest request)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        if (request.Plan is not ("Starter" or "Team" or "Pro")) return BadRequest(new { message = "Plan must be Starter, Team or Pro." });
        if (request.SeatCount is < 1 or > 500) return BadRequest(new { message = "Seat count must be between 1 and 500." });
        var subscription = await Ensure(workspaceId); subscription.Plan = request.Plan; subscription.SeatCount = request.SeatCount; subscription.Status = "PendingPayment"; subscription.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync();
        return Ok(new { subscription.Plan, subscription.SeatCount, subscription.Status, message = "Plan selected. Payment provider setup is required to activate billing." });
    }

    private async Task<Subscription> Ensure(Guid workspaceId)
    {
        var subscription = await _db.Subscriptions.FirstOrDefaultAsync(s => s.WorkspaceId == workspaceId);
        if (subscription != null) return subscription;
        subscription = new Subscription { Id = Guid.NewGuid(), WorkspaceId = workspaceId }; _db.Subscriptions.Add(subscription); await _db.SaveChangesAsync(); return subscription;
    }
}
