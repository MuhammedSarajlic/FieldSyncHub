using backend.Services.CurrentUserService;
using backend.Services.StorageService;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

/// <summary>
/// The browser used to hold a Supabase key with write access to one public bucket
/// and build its own object paths client-side - any file, and any tenant's data,
/// was one guessable URL away. Every upload now goes through here: the caller picks
/// a category, not a path, a content-type, or a size limit; the server sanitizes
/// the filename, validates against that category's rules, and keys the stored
/// object by the caller's own workspace (or, for the one pre-workspace case - the
/// onboarding logo - by the caller's own user id).
/// </summary>
[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly ICurrentUser _currentUser;

    private const long RequestBodyLimit = 10 * 1024 * 1024 + 4096;

    public UploadController(IStorageService storageService, ICurrentUser currentUser)
    {
        _storageService = storageService;
        _currentUser = currentUser;
    }

    [HttpPost]
    [RequestSizeLimit(RequestBodyLimit)]
    public async Task<IActionResult> Upload([FromForm] string category, IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file provided." });
        }

        if (!UploadPolicy.TryGetRules(category, out var rules))
        {
            return BadRequest(new { message = "Unknown upload category." });
        }

        if (file.Length > rules.MaxBytes)
        {
            return BadRequest(new { message = $"File exceeds the {rules.MaxBytes / (1024 * 1024)}MB limit for '{category}'." });
        }

        if (!rules.AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "File type is not allowed for this upload category." });
        }

        var safeName = UploadPolicy.SanitizeFileName(file.FileName, rules.AllowedExtensions[0]);
        var extension = Path.GetExtension(safeName);
        if (!rules.AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "File extension is not allowed for this upload category." });
        }

        string prefix;
        if (rules.Scope == UploadScope.Workspace)
        {
            if (_currentUser.WorkspaceId is not Guid workspaceId)
            {
                return Forbid();
            }
            prefix = UploadPolicy.WorkspacePrefix(workspaceId);
        }
        else
        {
            if (_currentUser.UserId is not Guid userId)
            {
                return Forbid();
            }
            prefix = UploadPolicy.UserPrefix(userId);
        }

        var path = $"{prefix}{category}/{Guid.NewGuid()}_{safeName}";

        await using var stream = file.OpenReadStream();
        await _storageService.UploadAsync(path, stream, file.ContentType);

        var url = await _storageService.CreateSignedUrlAsync(path, TimeSpan.FromMinutes(15));
        return Ok(new { path, url });
    }

    /// <summary>Lets the client refresh a display URL once its short-lived signed
    /// URL has expired, without re-uploading anything.</summary>
    [HttpGet("signed-url")]
    public async Task<IActionResult> GetSignedUrl([FromQuery] string path)
    {
        // WorkspaceId is only present once onboarding is done - a user mid-onboarding
        // (e.g. re-checking the logo they just uploaded) still owns their own
        // user-prefixed paths, so that check must not require a workspace to exist yet.
        if (string.IsNullOrWhiteSpace(path) || _currentUser.UserId is not Guid userId)
        {
            return Forbid();
        }

        if (!UploadPolicy.IsOwnedBy(path, _currentUser.WorkspaceId, userId))
        {
            return Forbid();
        }

        var url = await _storageService.CreateSignedUrlAsync(path, TimeSpan.FromMinutes(15));
        if (url == null)
        {
            return NotFound();
        }

        return Ok(new { url });
    }
}
