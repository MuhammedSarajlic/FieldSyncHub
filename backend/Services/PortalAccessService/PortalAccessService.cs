using System.Text.Json;
using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;

namespace backend.Services.PortalAccessService;

public record PortalAccessPayload(string Kind, Guid DocumentId, DateTime ExpiresAt);

public interface IPortalAccessService
{
    string Create(string kind, Guid documentId, TimeSpan lifetime);
    bool TryRead(string token, out PortalAccessPayload? payload);
}

public sealed class PortalAccessService : IPortalAccessService
{
    private readonly IDataProtector _protector;

    public PortalAccessService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("FieldSyncHub.CustomerPortal.v1");
    }

    public string Create(string kind, Guid documentId, TimeSpan lifetime)
    {
        var payload = new PortalAccessPayload(kind, documentId, DateTime.UtcNow.Add(lifetime));
        return _protector.Protect(JsonSerializer.Serialize(payload));
    }

    public bool TryRead(string token, out PortalAccessPayload? payload)
    {
        payload = null;
        try
        {
            var json = _protector.Unprotect(token);
            var candidate = JsonSerializer.Deserialize<PortalAccessPayload>(json);
            if (candidate == null || candidate.ExpiresAt <= DateTime.UtcNow) return false;
            payload = candidate;
            return true;
        }
        catch (Exception ex) when (ex is CryptographicException or JsonException or FormatException)
        {
            return false;
        }
    }
}
