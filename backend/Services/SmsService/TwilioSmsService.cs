using System.Net.Http.Headers;
using System.Text;

namespace backend.Services.SmsService;

public sealed class TwilioSmsService : ISmsService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TwilioSmsService> _logger;

    public TwilioSmsService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<TwilioSmsService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    private string? AccountSid => _configuration["AppSettings:Twilio:AccountSid"];
    private string? AuthToken => _configuration["AppSettings:Twilio:AuthToken"];
    private string? FromNumber => _configuration["AppSettings:Twilio:FromNumber"];
    public bool IsConfigured => !string.IsNullOrWhiteSpace(AccountSid) && !string.IsNullOrWhiteSpace(AuthToken) && !string.IsNullOrWhiteSpace(FromNumber);

    public async Task<bool> SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(phoneNumber)) return false;
        var client = _httpClientFactory.CreateClient("twilio");
        var credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{AccountSid}:{AuthToken}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["To"] = phoneNumber,
            ["From"] = FromNumber!,
            ["Body"] = message
        });
        var response = await client.PostAsync($"https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json", content, cancellationToken);
        if (response.IsSuccessStatusCode) return true;
        _logger.LogWarning("Twilio SMS failed with status {StatusCode}", response.StatusCode);
        return false;
    }
}
