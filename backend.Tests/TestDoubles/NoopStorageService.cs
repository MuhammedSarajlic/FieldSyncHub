using backend.Services.StorageService;

namespace backend.Tests.TestDoubles;

/// <summary>
/// A storage backend that never actually talks to Supabase - for tests that only
/// care about the ownership/validation logic around a stored path, not about
/// signing. CreateSignedUrlAsync returns the path unchanged so assertions can still
/// tell whether resolution ran at all.
/// </summary>
public sealed class NoopStorageService : IStorageService
{
    public Task<string> UploadAsync(string path, Stream content, string contentType) => Task.FromResult(path);

    public Task<string?> CreateSignedUrlAsync(string path, TimeSpan expiry) => Task.FromResult<string?>($"signed:{path}");

    public Task<byte[]?> DownloadAsync(string path, long maxBytes) => Task.FromResult<byte[]?>(null);
}
