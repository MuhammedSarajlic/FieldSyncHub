using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.WebhookService;

public interface IWebhookDispatcher
{
    Task PublishAsync(Guid workspaceId, string eventName, object payload, CancellationToken cancellationToken = default);
}

public sealed class WebhookDispatcher : IWebhookDispatcher
{
    private readonly DataContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookDispatcher> _logger;

    public WebhookDispatcher(DataContext db, IHttpClientFactory httpClientFactory, ILogger<WebhookDispatcher> logger)
    {
        _db = db; _httpClientFactory = httpClientFactory; _logger = logger;
    }

    public async Task PublishAsync(Guid workspaceId, string eventName, object payload, CancellationToken cancellationToken = default)
    {
        var hooks = await _db.WebhookSubscriptions.AsNoTracking().Where(h => h.WorkspaceId == workspaceId && h.IsActive && (h.Events.Contains(eventName) || h.Events.Contains("*"))).ToListAsync(cancellationToken);
        if (hooks.Count == 0) return;
        var body = JsonSerializer.Serialize(new { id = Guid.NewGuid(), type = eventName, occurredAt = DateTime.UtcNow, data = payload });
        foreach (var hook in hooks)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, hook.Url) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
                request.Headers.Add("X-FieldSyncHub-Event", eventName);
                request.Headers.Add("X-FieldSyncHub-Signature", Sign(body, hook.Secret));
                using var response = await _httpClientFactory.CreateClient().SendAsync(request, cancellationToken);
                if (!response.IsSuccessStatusCode) _logger.LogWarning("Webhook {WebhookId} returned {StatusCode}", hook.Id, response.StatusCode);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "Webhook {WebhookId} delivery failed", hook.Id);
            }
        }
    }

    private static string Sign(string body, string secret) => Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(body))).ToLowerInvariant();
}
