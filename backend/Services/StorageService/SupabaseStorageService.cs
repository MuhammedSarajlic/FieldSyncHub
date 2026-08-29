using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services.StorageService;

/// <summary>
/// Talks to Supabase Storage's REST API directly with the service_role key - a
/// server-only credential that never reaches the browser, unlike the previous
/// design where the frontend held a key with bucket-wide write access. The bucket
/// itself must be private in the Supabase dashboard; this service is what makes
/// objects reachable at all, via time-limited signed URLs.
/// </summary>
public class SupabaseStorageService : IStorageService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public SupabaseStorageService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    private string BaseUrl => (_configuration["AppSettings:Supabase:Url"] ?? string.Empty).TrimEnd('/');
    private string ServiceRoleKey => _configuration["AppSettings:Supabase:ServiceRoleKey"] ?? string.Empty;
    private string Bucket => _configuration["AppSettings:Supabase:Bucket"] ?? "uploads";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(BaseUrl) && !string.IsNullOrWhiteSpace(ServiceRoleKey);

    private HttpClient CreateClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ServiceRoleKey);
        client.DefaultRequestHeaders.Add("apikey", ServiceRoleKey);
        return client;
    }

    public async Task<string> UploadAsync(string path, Stream content, string contentType)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Supabase storage is not configured (AppSettings:Supabase:Url / ServiceRoleKey).");
        }

        using var client = CreateClient();
        using var streamContent = new StreamContent(content);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        // Upsert=false: an object already at this exact path would mean a GUID
        // collision, which should fail loudly rather than silently overwrite.
        var response = await client.PostAsync(
            $"{BaseUrl}/storage/v1/object/{Uri.EscapeDataString(Bucket)}/{path}",
            streamContent);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Upload to storage failed ({(int)response.StatusCode}): {body}");
        }

        return path;
    }

    public async Task<string?> CreateSignedUrlAsync(string path, TimeSpan expiry)
    {
        if (!IsConfigured)
        {
            return null;
        }

        try
        {
            using var client = CreateClient();
            var payload = JsonSerializer.Serialize(new { expiresIn = (int)expiry.TotalSeconds });
            using var body = new StringContent(payload, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(
                $"{BaseUrl}/storage/v1/object/sign/{Uri.EscapeDataString(Bucket)}/{path}",
                body);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            if (!doc.RootElement.TryGetProperty("signedURL", out var signedUrlProp))
            {
                return null;
            }

            var signedPath = signedUrlProp.GetString();
            return string.IsNullOrEmpty(signedPath) ? null : $"{BaseUrl}/storage/v1{signedPath}";
        }
        catch
        {
            return null;
        }
    }

    public async Task<byte[]?> DownloadAsync(string path, long maxBytes)
    {
        if (!IsConfigured)
        {
            return null;
        }

        try
        {
            using var client = CreateClient();
            using var response = await client.GetAsync(
                $"{BaseUrl}/storage/v1/object/{Uri.EscapeDataString(Bucket)}/{path}",
                HttpCompletionOption.ResponseHeadersRead);

            if (!response.IsSuccessStatusCode || response.Content.Headers.ContentLength > maxBytes)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync();
            using var buffer = new MemoryStream();
            var chunk = new byte[8192];
            int read;
            while ((read = await stream.ReadAsync(chunk)) > 0)
            {
                if (buffer.Length + read > maxBytes)
                {
                    return null;
                }
                await buffer.WriteAsync(chunk.AsMemory(0, read));
            }

            return buffer.ToArray();
        }
        catch
        {
            return null;
        }
    }
}
