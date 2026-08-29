using backend.Services.StorageService;

namespace backend.Tests;

/// <summary>
/// The browser used to build its own object paths from the raw file name with no
/// sanitisation ("notes/{timestamp}_{filename}") and no type/size allow-list at all.
/// These pin the rules every upload category enforces, and that a filename can't be
/// used to escape its own prefix or smuggle path separators into the stored key.
/// </summary>
public class UploadPolicyTests
{
    [Theory]
    [InlineData("logo")]
    [InlineData("note")]
    [InlineData("quote-attachment")]
    [InlineData("service-item-image")]
    public void TryGetRules_recognizes_every_known_category(string category)
    {
        Assert.True(UploadPolicy.TryGetRules(category, out _));
    }

    [Theory]
    [InlineData("")]
    [InlineData("../etc")]
    [InlineData("random-category")]
    [InlineData(null)]
    public void TryGetRules_rejects_anything_else(string? category)
    {
        Assert.False(UploadPolicy.TryGetRules(category, out _));
    }

    [Fact]
    public void SanitizeFileName_strips_directory_traversal_and_separators()
    {
        var result = UploadPolicy.SanitizeFileName("../../etc/passwd.png", ".png");

        Assert.DoesNotContain("..", result);
        Assert.DoesNotContain("/", result);
        Assert.DoesNotContain("\\", result);
    }

    [Fact]
    public void SanitizeFileName_strips_special_characters_but_keeps_a_readable_name()
    {
        var result = UploadPolicy.SanitizeFileName("My Invoice #1 (final)!!.pdf", ".pdf");

        Assert.Equal("MyInvoice1final.pdf", result);
    }

    [Fact]
    public void SanitizeFileName_falls_back_to_a_safe_name_when_nothing_survives()
    {
        var result = UploadPolicy.SanitizeFileName("!!!.png", ".png");

        Assert.Equal("file.png", result);
    }

    [Fact]
    public void SanitizeFileName_caps_length()
    {
        var longName = new string('a', 500) + ".png";

        var result = UploadPolicy.SanitizeFileName(longName, ".png");

        Assert.True(result.Length <= 64);
    }

    [Fact]
    public void SanitizeFileName_uses_the_fallback_extension_when_none_is_present()
    {
        var result = UploadPolicy.SanitizeFileName("noextension", ".png");

        Assert.EndsWith(".png", result);
    }

    [Fact]
    public void IsOwnedBy_accepts_a_path_under_the_callers_own_workspace()
    {
        var workspaceId = Guid.NewGuid();
        var path = $"{workspaceId}/note/abc_file.pdf";

        Assert.True(UploadPolicy.IsOwnedBy(path, workspaceId, Guid.NewGuid()));
    }

    [Fact]
    public void IsOwnedBy_accepts_a_path_under_the_callers_own_user_prefix()
    {
        var userId = Guid.NewGuid();
        var path = $"user-{userId}/logo/abc_file.png";

        Assert.True(UploadPolicy.IsOwnedBy(path, Guid.NewGuid(), userId));
    }

    [Fact]
    public void IsOwnedBy_rejects_another_tenants_path()
    {
        var path = $"{Guid.NewGuid()}/note/abc_file.pdf";

        Assert.False(UploadPolicy.IsOwnedBy(path, Guid.NewGuid(), Guid.NewGuid()));
    }

    [Fact]
    public void IsOwnedBy_rejects_null_or_empty()
    {
        Assert.False(UploadPolicy.IsOwnedBy(null, Guid.NewGuid(), Guid.NewGuid()));
        Assert.False(UploadPolicy.IsOwnedBy("", Guid.NewGuid(), Guid.NewGuid()));
    }

    [Theory]
    [InlineData("http://example.com/x.png", true)]
    [InlineData("https://example.com/x.png", true)]
    [InlineData("11111111-1111-1111-1111-111111111111/logo/x.png", false)]
    public void LooksLikeAbsoluteUrl_distinguishes_urls_from_stored_paths(string value, bool expected)
    {
        Assert.Equal(expected, UploadPolicy.LooksLikeAbsoluteUrl(value));
    }
}
