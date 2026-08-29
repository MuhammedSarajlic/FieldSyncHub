namespace backend.Services.StorageService;

/// <summary>
/// Every "get" endpoint that returns a stored upload path resolves it to a
/// short-lived signed URL right before serializing the response - the client never
/// sees (or needs to know about) the raw path, and never receives a URL that's
/// still valid tomorrow. Values that predate this feature (a plain external URL)
/// are passed through untouched rather than re-signed.
/// </summary>
public static class StorageUrlResolver
{
    private static readonly TimeSpan DisplayUrlExpiry = TimeSpan.FromMinutes(15);

    public static async Task<string?> ResolveAsync(this IStorageService storage, string? pathOrUrl)
    {
        if (string.IsNullOrWhiteSpace(pathOrUrl) || UploadPolicy.LooksLikeAbsoluteUrl(pathOrUrl))
        {
            return pathOrUrl;
        }

        return await storage.CreateSignedUrlAsync(pathOrUrl, DisplayUrlExpiry) ?? pathOrUrl;
    }
}
