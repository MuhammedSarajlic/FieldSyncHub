namespace backend.Services.StorageService;

/// <summary>
/// Uploads and files are proxied through the backend rather than letting the browser
/// write directly to the bucket with a shared key - this is what actually does the
/// upload/sign/download against Supabase Storage using a server-only credential.
/// </summary>
public interface IStorageService
{
    /// <summary>Uploads content under the given key and returns the stored path
    /// (never a URL - callers must go through CreateSignedUrlAsync to get one).</summary>
    Task<string> UploadAsync(string path, Stream content, string contentType);

    /// <summary>Returns a time-limited URL for the given path, or null if the object
    /// doesn't exist or signing failed.</summary>
    Task<string?> CreateSignedUrlAsync(string path, TimeSpan expiry);

    /// <summary>Downloads the object directly (server-to-server), capped at
    /// maxBytes. Returns null on any failure, including exceeding the cap.</summary>
    Task<byte[]?> DownloadAsync(string path, long maxBytes);
}
