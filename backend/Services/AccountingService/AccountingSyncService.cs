using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.AccountingService;

public record AccountingSyncResult(int Customers, int Invoices, int Payments);

public interface IAccountingSyncService
{
    string? CreateAuthorizationUrl(Guid workspaceId, string provider);
    Task<bool> CompleteAuthorizationAsync(string provider, string code, string state, string? realmId, CancellationToken cancellationToken = default);
    Task<AccountingSyncResult> SyncAsync(Guid workspaceId, string provider, CancellationToken cancellationToken = default);
}

public sealed class AccountingSyncService : IAccountingSyncService
{
    private readonly DataContext _db;
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration _configuration;
    private readonly IDataProtector _protector;
    private readonly IDataProtector _tokenProtector;

    public AccountingSyncService(DataContext db, IHttpClientFactory http, IConfiguration configuration, IDataProtectionProvider protection)
    {
        _db = db; _http = http; _configuration = configuration;
        _protector = protection.CreateProtector("FieldSyncHub.AccountingOAuthState.v1");
        _tokenProtector = protection.CreateProtector("FieldSyncHub.AccountingTokens.v1");
    }

    public string? CreateAuthorizationUrl(Guid workspaceId, string provider)
    {
        provider = NormalizeProvider(provider);
        var clientId = _configuration[$"AppSettings:Accounting:{provider}:ClientId"];
        var redirect = _configuration[$"AppSettings:Accounting:{provider}:RedirectUri"];
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(redirect)) return null;
        var state = Uri.EscapeDataString(_protector.Protect($"{workspaceId}|{provider}|{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}"));
        var query = provider == "quickbooks"
            ? $"client_id={Uri.EscapeDataString(clientId)}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri={Uri.EscapeDataString(redirect)}&state={state}"
            : $"response_type=code&client_id={Uri.EscapeDataString(clientId)}&redirect_uri={Uri.EscapeDataString(redirect)}&scope={Uri.EscapeDataString("openid profile email accounting.transactions offline_access")}&state={state}";
        return provider == "quickbooks" ? $"https://appcenter.intuit.com/connect/oauth2?{query}" : $"https://login.xero.com/identity/connect/authorize?{query}";
    }

    public async Task<bool> CompleteAuthorizationAsync(string provider, string code, string state, string? realmId, CancellationToken cancellationToken = default)
    {
        provider = NormalizeProvider(provider);
        string[] stateParts;
        try { stateParts = _protector.Unprotect(Uri.UnescapeDataString(state)).Split('|'); }
        catch (Exception ex) when (ex is System.Security.Cryptography.CryptographicException or FormatException) { return false; }
        if (stateParts.Length != 3 || stateParts[1] != provider || !Guid.TryParse(stateParts[0], out var workspaceId) || !long.TryParse(stateParts[2], out var issuedAt) || DateTimeOffset.UtcNow.ToUnixTimeSeconds() - issuedAt > 600) return false;
        var token = await ExchangeCode(provider, code, cancellationToken);
        if (token == null) return false;
        var connection = await _db.AccountingConnections.FirstOrDefaultAsync(c => c.WorkspaceId == workspaceId && c.Provider == provider, cancellationToken) ?? new AccountingConnection { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Provider = provider };
        connection.Status = "Connected";
        connection.AccessTokenEncrypted = _tokenProtector.Protect(token.Value.AccessToken);
        connection.RefreshTokenEncrypted = token.Value.RefreshToken == null ? null : _tokenProtector.Protect(token.Value.RefreshToken);
        connection.TokenExpiresAt = DateTime.UtcNow.AddSeconds(token.Value.ExpiresIn);
        connection.ExternalTenantId = realmId;
        connection.LastError = null;
        connection.UpdatedAt = DateTime.UtcNow;
        if (_db.Entry(connection).State == EntityState.Detached) _db.AccountingConnections.Add(connection);
        if (provider == "xero" && string.IsNullOrWhiteSpace(connection.ExternalTenantId))
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "https://api.xero.com/connections");
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.Value.AccessToken);
            using var response = await _http.CreateClient("accounting").SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
                connection.ExternalTenantId = json.RootElement.EnumerateArray().FirstOrDefault().TryGetProperty("tenantId", out var tenant) ? tenant.GetString() : null;
            }
        }
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<AccountingSyncResult> SyncAsync(Guid workspaceId, string provider, CancellationToken cancellationToken = default)
    {
        provider = NormalizeProvider(provider);
        var connection = await _db.AccountingConnections.FirstOrDefaultAsync(c => c.WorkspaceId == workspaceId && c.Provider == provider, cancellationToken) ?? throw new InvalidOperationException("Connect the accounting provider first.");
        if (connection.TokenExpiresAt is DateTime expiresAt && expiresAt <= DateTime.UtcNow.AddMinutes(2))
        {
            await RefreshAccessToken(connection, cancellationToken);
        }
        var accessToken = connection.AccessTokenEncrypted == null ? null : UnprotectToken(connection.AccessTokenEncrypted);
        if (string.IsNullOrWhiteSpace(accessToken)) throw new InvalidOperationException("The accounting connection has no access token.");
        var customers = await FetchRecords(provider, connection, accessToken, "customers", cancellationToken);
        var invoices = await FetchRecords(provider, connection, accessToken, "invoices", cancellationToken);
        var payments = await FetchRecords(provider, connection, accessToken, "payments", cancellationToken);
        var now = DateTime.UtcNow;
        foreach (var record in customers.Concat(invoices).Concat(payments))
        {
            var existing = await _db.AccountingExternalRecords.FirstOrDefaultAsync(r => r.WorkspaceId == workspaceId && r.Provider == provider && r.EntityType == record.EntityType && r.ExternalId == record.ExternalId, cancellationToken);
            if (existing == null) _db.AccountingExternalRecords.Add(new AccountingExternalRecord { Id = Guid.NewGuid(), WorkspaceId = workspaceId, Provider = provider, EntityType = record.EntityType, ExternalId = record.ExternalId, Payload = record.Payload, LastSyncedAt = now });
            else { existing.Payload = record.Payload; existing.LastSyncedAt = now; }
        }
        connection.LastSyncedAt = now; connection.LastSyncSummary = $"{customers.Count} customers, {invoices.Count} invoices, {payments.Count} payments"; connection.Status = "Connected"; connection.LastError = null; connection.UpdatedAt = now;
        await _db.SaveChangesAsync(cancellationToken);
        return new AccountingSyncResult(customers.Count, invoices.Count, payments.Count);
    }

    private string? UnprotectToken(string encryptedToken)
    {
        try { return _tokenProtector.Unprotect(encryptedToken); }
        catch (System.Security.Cryptography.CryptographicException) { return null; }
    }

    private async Task RefreshAccessToken(AccountingConnection connection, CancellationToken cancellationToken)
    {
        var refreshToken = connection.RefreshTokenEncrypted == null ? null : UnprotectToken(connection.RefreshTokenEncrypted);
        var clientId = _configuration[$"AppSettings:Accounting:{connection.Provider}:ClientId"];
        var clientSecret = _configuration[$"AppSettings:Accounting:{connection.Provider}:ClientSecret"];
        if (string.IsNullOrWhiteSpace(refreshToken) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            throw new InvalidOperationException("The accounting connection has expired. Reconnect the provider.");

        using var request = new HttpRequestMessage(HttpMethod.Post, connection.Provider == "quickbooks"
            ? "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
            : "https://identity.xero.com/connect/token")
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = refreshToken
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")));
        using var response = await _http.CreateClient("accounting").SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException("The accounting connection has expired. Reconnect the provider.");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var root = json.RootElement;
        var accessToken = root.GetProperty("access_token").GetString();
        if (string.IsNullOrWhiteSpace(accessToken)) throw new InvalidOperationException("The accounting provider returned no access token.");
        connection.AccessTokenEncrypted = _tokenProtector.Protect(accessToken);
        if (root.TryGetProperty("refresh_token", out var rotatedRefresh) && !string.IsNullOrWhiteSpace(rotatedRefresh.GetString()))
            connection.RefreshTokenEncrypted = _tokenProtector.Protect(rotatedRefresh.GetString()!);
        connection.TokenExpiresAt = DateTime.UtcNow.AddSeconds(root.TryGetProperty("expires_in", out var expires) ? expires.GetInt32() : 1800);
        connection.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<List<(string EntityType, string ExternalId, string Payload)>> FetchRecords(string provider, AccountingConnection connection, string accessToken, string type, CancellationToken cancellationToken)
    {
        var url = provider == "quickbooks" ? $"https://quickbooks.api.intuit.com/v3/company/{connection.ExternalTenantId}/query?query={Uri.EscapeDataString(type == "customers" ? "select * from Customer" : type == "invoices" ? "select * from Invoice" : "select * from Payment")}&minorversion=75" : $"https://api.xero.com/api.xro/2.0/{(type == "customers" ? "Contacts" : type == "invoices" ? "Invoices" : "Payments")}";
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        if (provider == "xero" && !string.IsNullOrWhiteSpace(connection.ExternalTenantId)) request.Headers.Add("Xero-tenant-id", connection.ExternalTenantId);
        using var response = await _http.CreateClient("accounting").SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException($"{provider} returned {(int)response.StatusCode} while reading {type}.");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var records = new List<(string, string, string)>();
        var property = provider == "quickbooks" ? (type == "customers" ? "Customer" : type == "invoices" ? "Invoice" : "Payment") : (type == "customers" ? "Contacts" : type == "invoices" ? "Invoices" : "Payments");
        if (!json.RootElement.TryGetProperty(property, out var items) || items.ValueKind != JsonValueKind.Array) return records;
        foreach (var item in items.EnumerateArray())
        {
            var idProperty = provider == "quickbooks" ? "Id" : type == "customers" ? "ContactID" : type == "invoices" ? "InvoiceID" : "PaymentID";
            if (item.TryGetProperty(idProperty, out var id)) records.Add((type, id.GetString() ?? string.Empty, item.GetRawText()));
        }
        return records;
    }

    private async Task<(string AccessToken, string? RefreshToken, int ExpiresIn)?> ExchangeCode(string provider, string code, CancellationToken cancellationToken)
    {
        var clientId = _configuration[$"AppSettings:Accounting:{provider}:ClientId"];
        var clientSecret = _configuration[$"AppSettings:Accounting:{provider}:ClientSecret"];
        var redirect = _configuration[$"AppSettings:Accounting:{provider}:RedirectUri"];
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret) || string.IsNullOrWhiteSpace(redirect)) return null;
        using var request = new HttpRequestMessage(HttpMethod.Post, provider == "quickbooks" ? "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" : "https://identity.xero.com/connect/token") { Content = new FormUrlEncodedContent(new Dictionary<string, string> { ["grant_type"] = "authorization_code", ["code"] = code, ["redirect_uri"] = redirect }) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")));
        using var response = await _http.CreateClient("accounting").SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var root = json.RootElement;
        return (root.GetProperty("access_token").GetString()!, root.TryGetProperty("refresh_token", out var refresh) ? refresh.GetString() : null, root.TryGetProperty("expires_in", out var expires) ? expires.GetInt32() : 1800);
    }

    private static string NormalizeProvider(string provider) => provider.Trim().ToLowerInvariant() is "quickbooks" or "xero" ? provider.Trim().ToLowerInvariant() : throw new ArgumentException("Unsupported accounting provider.");
}
