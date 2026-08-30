namespace backend.Services.PropertyService;

public sealed record GeocodedCoordinates(decimal Latitude, decimal Longitude);

public interface IGeocodingService
{
    Task<GeocodedCoordinates?> GeocodeAsync(string address, CancellationToken cancellationToken = default);
}
