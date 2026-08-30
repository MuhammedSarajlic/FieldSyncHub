namespace backend.Services.StorageService;

public enum UploadScope
{
    /// <summary>Keyed by workspace - the normal case for anything that already
    /// belongs to a workspace (notes, quotes, the pricebook).</summary>
    Workspace,

    /// <summary>Keyed by the uploading user - only for the company logo, which can be
    /// uploaded during onboarding before a workspace exists yet to key it by.</summary>
    User,
}

public sealed record UploadCategoryRules(UploadScope Scope, long MaxBytes, string[] AllowedContentTypes, string[] AllowedExtensions);

/// <summary>
/// Every upload has a fixed, server-defined destination and rule set - the client
/// picks a category, not a path, a content-type, or a size limit. This is what
/// closes "no tenant separation, no type or size validation, no filename
/// sanitisation": a category can never be pointed outside its own prefix, and
/// nothing about the request body is trusted beyond the raw bytes and the
/// browser-reported content-type (which is still checked against the allow-list).
/// </summary>
public static class UploadPolicy
{
    private static readonly string[] ImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    private static readonly string[] ImageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
    private static readonly string[] AttachmentTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];
    private static readonly string[] AttachmentExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf"];

    private static readonly Dictionary<string, UploadCategoryRules> Categories = new(StringComparer.OrdinalIgnoreCase)
    {
        ["logo"] = new UploadCategoryRules(UploadScope.User, 5 * 1024 * 1024, ImageTypes, ImageExtensions),
        ["note"] = new UploadCategoryRules(UploadScope.Workspace, 10 * 1024 * 1024, AttachmentTypes, AttachmentExtensions),
        ["quote-attachment"] = new UploadCategoryRules(UploadScope.Workspace, 10 * 1024 * 1024, AttachmentTypes, AttachmentExtensions),
        ["service-item-image"] = new UploadCategoryRules(UploadScope.Workspace, 5 * 1024 * 1024, ImageTypes, ImageExtensions),
        ["job-completion"] = new UploadCategoryRules(UploadScope.Workspace, 10 * 1024 * 1024, ImageTypes, ImageExtensions),
    };

    public static bool TryGetRules(string? category, out UploadCategoryRules rules)
        => Categories.TryGetValue(category ?? string.Empty, out rules!);

    /// <summary>Keeps only a safe character set and caps length - the original name
    /// is never trusted for path construction (no "../", no separators, no NUL).</summary>
    public static string SanitizeFileName(string fileName, string fallbackExtension)
    {
        var name = Path.GetFileNameWithoutExtension(fileName);
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = fallbackExtension;
        }

        var safeChars = new string(name
            .Where(c => char.IsLetterOrDigit(c) || c is '-' or '_')
            .ToArray());
        if (safeChars.Length == 0)
        {
            safeChars = "file";
        }

        safeChars = safeChars.Length > 60 ? safeChars[..60] : safeChars;

        var safeExt = new string(ext.Where(c => char.IsLetterOrDigit(c) || c == '.').ToArray()).ToLowerInvariant();
        return $"{safeChars}{safeExt}";
    }

    public static string WorkspacePrefix(Guid workspaceId) => $"{workspaceId}/";

    public static string UserPrefix(Guid userId) => $"user-{userId}/";

    /// <summary>True if this path was minted for the given workspace or the given
    /// user (the logo's own escape hatch) - the only two prefixes UploadController
    /// ever produces. Used everywhere a client submits a path/URL value directly
    /// (workspace.logoUrl, note.pathFile, etc.) so one tenant can never point a
    /// field at another tenant's uploaded object and have it served back to them.</summary>
    public static bool IsOwnedBy(string? path, Guid? workspaceId, Guid? userId)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            return false;
        }

        return (workspaceId is Guid w && path.StartsWith(WorkspacePrefix(w), StringComparison.Ordinal))
            || (userId is Guid u && path.StartsWith(UserPrefix(u), StringComparison.Ordinal));
    }

    /// <summary>Stored values are either one of our own paths or (for data that
    /// predates this feature) a plain external URL - never re-sign the latter.</summary>
    public static bool LooksLikeAbsoluteUrl(string value) =>
        value.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
        value.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
}
