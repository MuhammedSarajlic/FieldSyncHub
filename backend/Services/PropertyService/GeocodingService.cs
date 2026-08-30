using System.Globalization;
using System.Text.Json;

namespace backend.Services.PropertyService;

public sealed class GeocodingService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<GeocodingService> logger) : IGeocodingService
{
    public async Task<GeocodedCoordinates?> GeocodeAsync(string address, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(address)) return null;

        var endpoint = configuration["AppSettings:Geocoding:Url"]
            ?? "https://nominatim.openstreetmap.org/search";

        try
        {
            var client = httpClientFactory.CreateClient("geocoding");
            var requestUri = $"{endpoint}?format=jsonv2&limit=1&q={Uri.EscapeDataString(address)}";
            using var response = await client.GetAsync(requestUri, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            var result = document.RootElement.EnumerateArray().FirstOrDefault();
            if (result.ValueKind != JsonValueKind.Object
                || !result.TryGetProperty("lat", out var latitude)
                || !result.TryGetProperty("lon", out var longitude)
                || !decimal.TryParse(latitude.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lat)
                || !decimal.TryParse(longitude.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
            {
                return null;
            }

            return lat is >= -90m and <= 90m && lon is >= -180m and <= 180m
                ? new GeocodedCoordinates(lat, lon)
                : null;
        }
        catch (Exception exception) when (exception is HttpRequestException or TaskCanceledException or JsonException)
        {
            logger.LogWarning(exception, "Geocoding failed for property address");
            return null;
        }
    }
}
