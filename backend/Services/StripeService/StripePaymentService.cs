using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;

namespace backend.Services.StripeService;

public record StripePaymentIntent(string Id, string ClientSecret, string Status);

public interface IStripePaymentService
{
    bool IsConfigured { get; }
    string? PublishableKey { get; }
    Task<StripePaymentIntent?> CreatePaymentIntentAsync(decimal amount, string currency, Guid invoiceId, string? idempotencyKey, CancellationToken cancellationToken = default);
    Task<string?> CreateSubscriptionCheckoutAsync(Guid workspaceId, string plan, int seatCount, string? customerEmail, CancellationToken cancellationToken = default);
    bool VerifyWebhookSignature(string payload, string? signatureHeader);
}

public sealed class StripePaymentService : IStripePaymentService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public StripePaymentService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    private string? SecretKey => _configuration["AppSettings:Stripe:SecretKey"];
    private string? WebhookSecret => _configuration["AppSettings:Stripe:WebhookSecret"];
    public string? PublishableKey => _configuration["AppSettings:Stripe:PublishableKey"];
    public bool IsConfigured => !string.IsNullOrWhiteSpace(SecretKey) && !string.IsNullOrWhiteSpace(PublishableKey);

    public async Task<StripePaymentIntent?> CreatePaymentIntentAsync(decimal amount, string currency, Guid invoiceId, string? idempotencyKey, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || amount <= 0m) return null;
        var minorUnits = decimal.ToInt64(Math.Round(amount * CurrencyExponent(currency), 0, MidpointRounding.AwayFromZero));
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["amount"] = minorUnits.ToString(CultureInfo.InvariantCulture),
            ["currency"] = currency.ToLowerInvariant(),
            ["automatic_payment_methods[enabled]"] = "true",
            ["metadata[invoiceId]"] = invoiceId.ToString()
        });
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.stripe.com/v1/payment_intents") { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", SecretKey);
        if (!string.IsNullOrWhiteSpace(idempotencyKey)) request.Headers.Add("Idempotency-Key", idempotencyKey);
        using var response = await _httpClientFactory.CreateClient("stripe").SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var root = document.RootElement;
        return new StripePaymentIntent(root.GetProperty("id").GetString()!, root.GetProperty("client_secret").GetString()!, root.GetProperty("status").GetString()!);
    }

    public async Task<string?> CreateSubscriptionCheckoutAsync(Guid workspaceId, string plan, int seatCount, string? customerEmail, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured) return null;
        var priceId = _configuration[$"AppSettings:Stripe:Prices:{plan}"];
        if (string.IsNullOrWhiteSpace(priceId)) return null;
        var frontendUrl = (_configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var values = new Dictionary<string, string>
        {
            ["mode"] = "subscription",
            ["line_items[0][price]"] = priceId,
            ["line_items[0][quantity]"] = seatCount.ToString(CultureInfo.InvariantCulture),
            ["success_url"] = $"{frontendUrl}/billing?checkout=success",
            ["cancel_url"] = $"{frontendUrl}/billing?checkout=cancelled",
            ["metadata[workspaceId]"] = workspaceId.ToString(),
            ["metadata[plan]"] = plan,
            ["metadata[seatCount]"] = seatCount.ToString(CultureInfo.InvariantCulture),
            ["subscription_data[metadata][workspaceId]"] = workspaceId.ToString(),
            ["subscription_data[metadata][plan]"] = plan
        };
        if (!string.IsNullOrWhiteSpace(customerEmail)) values["customer_email"] = customerEmail;
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.stripe.com/v1/checkout/sessions") { Content = new FormUrlEncodedContent(values) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", SecretKey);
        using var response = await _httpClientFactory.CreateClient("stripe").SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) return null;
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        return document.RootElement.GetProperty("url").GetString();
    }

    public bool VerifyWebhookSignature(string payload, string? signatureHeader)
    {
        if (string.IsNullOrWhiteSpace(WebhookSecret) || string.IsNullOrWhiteSpace(signatureHeader)) return false;
        var timestamp = signatureHeader.Split(',').FirstOrDefault(value => value.StartsWith("t=", StringComparison.Ordinal))?[2..];
        var signature = signatureHeader.Split(',').Where(value => value.StartsWith("v1=", StringComparison.Ordinal)).Select(value => value[3..]).ToList();
        if (!long.TryParse(timestamp, out var unix) || Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - unix) > 300 || signature.Count == 0) return false;
        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(WebhookSecret));
        var expected = Convert.ToHexString(hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes($"{timestamp}.{payload}"))).ToLowerInvariant();
        return signature.Any(value => System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(System.Text.Encoding.UTF8.GetBytes(expected), System.Text.Encoding.UTF8.GetBytes(value)));
    }

    private static decimal CurrencyExponent(string currency) => currency.ToUpperInvariant() is "BIF" or "CLP" or "DJF" or "GNF" or "JPY" or "KMF" or "KRW" or "MGA" or "PYG" or "RWF" or "UGX" or "VND" or "VUV" or "XAF" or "XOF" or "XPF" ? 1m : 100m;
}
