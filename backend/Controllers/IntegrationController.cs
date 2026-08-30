using System.Security.Cryptography;
using System.Text;
using backend.Data;
using backend.Models;
using backend.Services.CurrentUserService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Services.AccountingService;

namespace backend.Controllers;

public record CreateApiKeyRequest(string Name, string Scopes);
public record CreateWebhookRequest(string Url, string Events);
public record AccountingConnectionRequest(string Provider);

[ApiController]
[Route("api/integrations")]
public class IntegrationController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IAccountingSyncService _accounting;
    private readonly IConfiguration _configuration;
    public IntegrationController(DataContext db, ICurrentUser currentUser, IAccountingSyncService accounting, IConfiguration configuration) { _db = db; _currentUser = currentUser; _accounting = accounting; _configuration = configuration; }

    [HttpGet("accounting")]
    public async Task<IActionResult> Accounting()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.AccountingConnections.Where(c => c.WorkspaceId == workspaceId).Select(c => new { c.Id, c.Provider, c.Status, c.ExternalAccountId, c.LastSyncedAt, c.LastError }).ToListAsync());
    }

    [HttpPut("accounting")]
    public async Task<IActionResult> ConnectAccounting(AccountingConnectionRequest request)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var provider = request.Provider.Trim().ToLowerInvariant();
        if (provider is not ("quickbooks" or "xero")) return BadRequest(new { message = "Provider must be quickbooks or xero." });
        var connection = await _db.AccountingConnections.FirstOrDefaultAsync(c => c.WorkspaceId == workspaceId && c.Provider == provider) ?? new AccountingConnection { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Provider = provider };
        var authorizationUrl = _accounting.CreateAuthorizationUrl(workspaceId, provider);
        connection.Status = authorizationUrl == null ? "NeedsConfiguration" : "NeedsAuthorization";
        connection.LastError = authorizationUrl == null ? "Add the provider OAuth client ID, secret and redirect URI to backend configuration." : null;
        connection.UpdatedAt = DateTime.UtcNow;
        if (_db.Entry(connection).State == EntityState.Detached) _db.AccountingConnections.Add(connection);
        await _db.SaveChangesAsync();
        return Ok(new { connection.Id, connection.Provider, connection.Status, connection.LastError, authorizationUrl });
    }

    [HttpGet("accounting/{provider}/authorize")]
    public IActionResult AuthorizeAccounting(string provider)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var url = _accounting.CreateAuthorizationUrl(workspaceId, provider);
        return url == null ? StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Accounting OAuth is not configured." }) : Redirect(url);
    }

    [AllowAnonymous]
    [HttpGet("accounting/callback/{provider}")]
    public async Task<IActionResult> AccountingCallback(string provider, [FromQuery] string code, [FromQuery] string state, [FromQuery] string? realmId = null, [FromQuery] string? error = null)
    {
        var frontendUrl = (_configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
        if (!string.IsNullOrWhiteSpace(error)) return Redirect($"{frontendUrl}/settings?accounting=error");
        var completed = await _accounting.CompleteAuthorizationAsync(provider, code, state, realmId, HttpContext.RequestAborted);
        return Redirect($"{frontendUrl}/settings?accounting={(completed ? "connected" : "error")}");
    }

    [HttpPost("accounting/{provider}/sync")]
    public async Task<IActionResult> SyncAccounting(string provider)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var connection = await _db.AccountingConnections.FirstOrDefaultAsync(c => c.WorkspaceId == workspaceId && c.Provider == provider.ToLowerInvariant());
        if (connection == null) return NotFound();
        try { return Ok(await _accounting.SyncAsync(workspaceId, provider, HttpContext.RequestAborted)); }
        catch (InvalidOperationException ex) { connection.Status = "SyncFailed"; connection.LastError = ex.Message; connection.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); return Conflict(new { message = ex.Message }); }
    }

    [HttpPost("api-keys")]
    public async Task<IActionResult> CreateApiKey(CreateApiKeyRequest request)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var raw = $"fsh_live_{Convert.ToHexString(RandomNumberGenerator.GetBytes(24)).ToLowerInvariant()}";
        var key = new ApiKey { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Name = request.Name.Trim(), KeyPrefix = raw[..16], KeyHash = Hash(raw), Scopes = string.IsNullOrWhiteSpace(request.Scopes) ? "read" : request.Scopes.Trim() };
        _db.ApiKeys.Add(key); await _db.SaveChangesAsync();
        return Ok(new { key.Id, key.Name, key.KeyPrefix, key.Scopes, apiKey = raw });
    }

    [HttpGet("api-keys")]
    public async Task<IActionResult> ListApiKeys()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.ApiKeys.Where(k => k.WorkspaceId == workspaceId).Select(k => new { k.Id, k.Name, k.KeyPrefix, k.Scopes, k.LastUsedAt, k.RevokedAt, k.CreatedAt }).ToListAsync());
    }

    [HttpDelete("api-keys/{id:guid}")]
    public async Task<IActionResult> RevokeApiKey(Guid id)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var key = await _db.ApiKeys.FirstOrDefaultAsync(k => k.Id == id && k.WorkspaceId == workspaceId); if (key == null) return NotFound();
        key.RevokedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); return NoContent();
    }

    [HttpPost("webhooks")]
    public async Task<IActionResult> CreateWebhook(CreateWebhookRequest request)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var uri) || uri.Scheme is not ("https" or "http")) return BadRequest(new { message = "A valid webhook URL is required." });
        var webhook = new WebhookSubscription { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Url = uri.ToString(), Events = request.Events.Trim(), Secret = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)) };
        _db.WebhookSubscriptions.Add(webhook); await _db.SaveChangesAsync();
        return Ok(new { webhook.Id, webhook.Url, webhook.Events, webhook.Secret });
    }

    [HttpGet("webhooks")]
    public async Task<IActionResult> ListWebhooks()
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        return Ok(await _db.WebhookSubscriptions.Where(w => w.WorkspaceId == workspaceId).Select(w => new { w.Id, w.Url, w.Events, w.IsActive, w.CreatedAt }).ToListAsync());
    }

    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}
