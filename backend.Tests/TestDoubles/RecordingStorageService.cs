using backend.Services.StorageService;

namespace backend.Tests.TestDoubles;

/// <summary>Records the last path it was asked to operate on, so a test can assert
/// what UploadController actually built without hitting real storage.</summary>
public sealed class RecordingStorageService : IStorageService
{
    public string? LastUploadedPath { get; private set; }
    public string? LastSignedPath { get; private set; }

    public Task<string> UploadAsync(string path, Stream content, string contentType)
    {
        LastUploadedPath = path;
        return Task.FromResult(path);
    }

    public Task<string?> CreateSignedUrlAsync(string path, TimeSpan expiry)
    {
        LastSignedPath = path;
        return Task.FromResult<string?>($"https://storage.example/{path}?signed=1");
    }

    public Task<byte[]?> DownloadAsync(string path, long maxBytes) => Task.FromResult<byte[]?>(null);
}
