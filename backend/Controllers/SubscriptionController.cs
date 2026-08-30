using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Services.StripeService;

namespace backend.Controllers;

public record ChangePlanRequest(string Plan, int SeatCount);

[ApiController]
[Route("api/subscription")]
public class SubscriptionController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IStripePaymentService _stripe;
    public SubscriptionController(DataContext db, ICurrentUser currentUser, IStripePaymentService stripe) { _db = db; _currentUser = currentUser; _stripe = stripe; }

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
        var workspace = await _db.Workspaces.Include(w => w.CreatedByUser).FirstOrDefaultAsync(w => w.Id == workspaceId);
        var checkoutUrl = await _stripe.CreateSubscriptionCheckoutAsync(workspaceId, request.Plan, request.SeatCount, workspace?.CreatedByUser?.Email, HttpContext.RequestAborted);
        if (checkoutUrl == null) return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Subscription billing is not configured. Add Stripe price IDs and keys before choosing a plan." });
        var subscription = await Ensure(workspaceId); subscription.Plan = request.Plan; subscription.SeatCount = request.SeatCount; subscription.Status = "CheckoutPending"; subscription.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync();
        return Ok(new { subscription.Plan, subscription.SeatCount, subscription.Status, checkoutUrl });
    }

    private async Task<Subscription> Ensure(Guid workspaceId)
    {
        var subscription = await _db.Subscriptions.FirstOrDefaultAsync(s => s.WorkspaceId == workspaceId);
        if (subscription != null) return subscription;
        subscription = new Subscription { Id = Guid.NewGuid(), WorkspaceId = workspaceId }; _db.Subscriptions.Add(subscription); await _db.SaveChangesAsync(); return subscription;
    }
}
