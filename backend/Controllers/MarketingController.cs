using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using backend.Services.EmailService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public record CreateCampaignRequest(string Name, string Subject, string Body, string Segment);

[ApiController]
[Route("api/marketing")]
public class MarketingController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IEmailService _email;

    public MarketingController(DataContext db, ICurrentUser currentUser, IEmailService email)
    {
        _db = db; _currentUser = currentUser; _email = email;
    }

    [HttpGet("segments")]
    public async Task<IActionResult> Segments()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var customers = _db.Customers.Where(c => c.WorkspaceId == workspaceId);
        var tagged = await customers.CountAsync(c => c.TagRecords.Any());
        var servicedRecently = await customers.CountAsync(c => _db.Jobs.Any(j => j.WorkspaceId == workspaceId && j.CustomerId == c.Id && j.Status == JobStatus.Completed && j.CompletedAt >= DateTime.UtcNow.AddDays(-90)));
        var materialCustomers = await _db.LineItems.Where(li => li.Job!.WorkspaceId == workspaceId && li.ServiceItem!.Type == ServiceItemType.Material).Select(li => li.Job!.CustomerId).Distinct().CountAsync();
        return Ok(new[]
        {
            new { id = "all", name = "All customers", count = await customers.CountAsync() },
            new { id = "tagged", name = "Tagged customers", count = tagged },
            new { id = "recent-service", name = "Serviced in the last 90 days", count = servicedRecently },
            new { id = "materials", name = "Customers with material work", count = materialCustomers }
        });
    }

    [HttpGet("campaigns")]
    public async Task<IActionResult> Campaigns()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.MarketingCampaigns.Where(c => c.WorkspaceId == workspaceId).Include(c => c.Recipients).OrderByDescending(c => c.CreatedAt).Select(c => new { c.Id, c.Name, c.Subject, c.Segment, c.SentAt, sent = c.Recipients.Count(r => r.Sent), opened = c.Recipients.Count(r => r.OpenedAt != null), clicked = c.Recipients.Count(r => r.ClickedAt != null) }).ToListAsync());
    }

    [HttpPost("campaigns/send")]
    public async Task<IActionResult> Send(CreateCampaignRequest request)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Body)) return BadRequest(new { message = "Name, subject and body are required." });
        var customers = await SelectSegment(workspaceId, request.Segment);
        var campaign = new MarketingCampaign { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Name = request.Name.Trim(), Subject = request.Subject.Trim(), Body = request.Body.Trim(), Segment = request.Segment };
        foreach (var customer in customers)
        {
            var address = customer.Emails.FirstOrDefault();
            if (string.IsNullOrWhiteSpace(address)) continue;
            var recipient = new MarketingCampaignRecipient { Id = Guid.NewGuid(), CampaignId = campaign.Id, CustomerId = customer.Id, Email = address };
            var result = await _email.SendEmailAsync(address, campaign.Subject, campaign.Body, $"<p>{campaign.Body.Replace("\n", "<br />")}</p>");
            recipient.Sent = result.Success;
            campaign.Recipients.Add(recipient);
        }
        campaign.SentAt = DateTime.UtcNow;
        _db.MarketingCampaigns.Add(campaign);
        await _db.SaveChangesAsync();
        return Ok(new { campaign.Id, sent = campaign.Recipients.Count(r => r.Sent), total = campaign.Recipients.Count });
    }

    [AllowAnonymous]
    [HttpGet("campaigns/{campaignId:guid}/track/{recipientId:guid}")]
    public async Task<IActionResult> Track(Guid campaignId, Guid recipientId, [FromQuery] string type = "open")
    {
        var recipient = await _db.MarketingCampaignRecipients.FirstOrDefaultAsync(r => r.Id == recipientId && r.CampaignId == campaignId);
        if (recipient == null) return NotFound();
        if (type.Equals("click", StringComparison.OrdinalIgnoreCase)) recipient.ClickedAt ??= DateTime.UtcNow;
        else recipient.OpenedAt ??= DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<List<Customer>> SelectSegment(Guid workspaceId, string segment)
    {
        var query = _db.Customers.Include(c => c.EmailRecords).Where(c => c.WorkspaceId == workspaceId);
        return segment.ToLowerInvariant() switch
        {
            "tagged" => await query.Where(c => c.TagRecords.Any()).ToListAsync(),
            "recent-service" => await query.Where(c => _db.Jobs.Any(j => j.CustomerId == c.Id && j.Status == JobStatus.Completed && j.CompletedAt >= DateTime.UtcNow.AddDays(-90))).ToListAsync(),
            "materials" => await query.Where(c => _db.Jobs.Any(j => j.CustomerId == c.Id && j.LineItems.Any(li => li.ServiceItem!.Type == ServiceItemType.Material))).ToListAsync(),
            _ => await query.ToListAsync()
        };
    }
}
