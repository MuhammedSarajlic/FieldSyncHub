using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/public/v1")]
public class PublicApiController : ControllerBase
{
    private readonly DataContext _db;
    public PublicApiController(DataContext db) => _db = db;

    [HttpGet("customers")]
    public async Task<IActionResult> Customers()
    {
        var workspaceId = await Authenticate(); if (workspaceId == null) return Unauthorized();
        return Ok(await _db.Customers.Where(c => c.WorkspaceId == workspaceId).Select(c => new { c.Id, c.FirstName, c.LastName, c.CompanyName, c.CreatedAt }).ToListAsync());
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> Invoices()
    {
        var workspaceId = await Authenticate(); if (workspaceId == null) return Unauthorized();
        return Ok(await _db.Invoices.Where(i => i.WorkspaceId == workspaceId).Select(i => new { i.Id, i.InvoiceNumber, i.CustomerId, i.DueDate, i.WorkflowStatus, i.CreatedAt }).ToListAsync());
    }

    [HttpPost("webhooks/subscribe")]
    public async Task<IActionResult> SubscribeWebhook([FromBody] PublicWebhookRequest request)
    {
        var key = await GetApiKey("webhooks");
        if (key == null) return Unauthorized();
        if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var url) || url.Scheme is not ("http" or "https")) return BadRequest(new { message = "A valid webhook URL is required." });
        var events = string.IsNullOrWhiteSpace(request.Events) ? "job.completed,invoice.paid,quote.approved" : request.Events.Trim();
        var hook = new WebhookSubscription { Id = Guid.NewGuid(), WorkspaceId = key.WorkspaceId, Url = url.ToString(), Events = events, Secret = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)) };
        _db.WebhookSubscriptions.Add(hook); await _db.SaveChangesAsync();
        return Ok(new { id = hook.Id, events = hook.Events, secret = hook.Secret });
    }

    [HttpDelete("webhooks/subscribe/{id:guid}")]
    public async Task<IActionResult> UnsubscribeWebhook(Guid id)
    {
        var key = await GetApiKey("webhooks");
        if (key == null) return Unauthorized();
        var hook = await _db.WebhookSubscriptions.FirstOrDefaultAsync(item => item.Id == id && item.WorkspaceId == key.WorkspaceId);
        if (hook == null) return NotFound();
        hook.IsActive = false; await _db.SaveChangesAsync(); return NoContent();
    }

    private async Task<Guid?> Authenticate() => (await GetApiKey("read"))?.WorkspaceId;

    private async Task<ApiKey?> GetApiKey(string requiredScope)
    {
        var raw = Request.Headers["X-Api-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(raw)) return null;
        var key = await _db.ApiKeys.IgnoreQueryFilters().FirstOrDefaultAsync(k => k.KeyHash == Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw))) && k.RevokedAt == null);
        if (key == null || !key.Scopes.Split(',', StringSplitOptions.TrimEntries).Contains(requiredScope, StringComparer.OrdinalIgnoreCase)) return null;
        key.LastUsedAt = DateTime.UtcNow; await _db.SaveChangesAsync();
        return key;
    }
}

public record PublicWebhookRequest(string Url, string Events);
