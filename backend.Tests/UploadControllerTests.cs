using backend.Controllers;
using backend.Tests.TestDoubles;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests;

/// <summary>
/// Every upload used to go straight from the browser to a public bucket with a
/// client-chosen path, no size/type check, and no sanitisation. UploadController is
/// the replacement: the caller only ever picks a category, the server decides
/// everything else. These pin the validation gates and that objects are actually
/// keyed by the caller's own workspace (or, for the logo, their own user id) -
/// never anything the request itself could influence.
/// </summary>
public class UploadControllerTests
{
    private static IFormFile MakeFile(string name, string contentType, int sizeBytes)
    {
        var bytes = new byte[sizeBytes];
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "file", name) { Headers = new HeaderDictionary(), ContentType = contentType };
    }

    private static UploadController CreateController(RecordingStorageService storage, FakeCurrentUser currentUser)
        => new(storage, currentUser);

    [Fact]
    public async Task Upload_rejects_an_unknown_category()
    {
        var controller = CreateController(new RecordingStorageService(), new FakeCurrentUser { WorkspaceId = Guid.NewGuid(), UserId = Guid.NewGuid() });

        var result = await controller.Upload("not-a-real-category", MakeFile("a.png", "image/png", 100));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_rejects_a_file_over_the_categorys_limit()
    {
        var controller = CreateController(new RecordingStorageService(), new FakeCurrentUser { WorkspaceId = Guid.NewGuid(), UserId = Guid.NewGuid() });

        // service-item-image caps at 5MB.
        var result = await controller.Upload("service-item-image", MakeFile("a.png", "image/png", 6 * 1024 * 1024));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_rejects_a_disallowed_content_type()
    {
        var controller = CreateController(new RecordingStorageService(), new FakeCurrentUser { WorkspaceId = Guid.NewGuid(), UserId = Guid.NewGuid() });

        var result = await controller.Upload("service-item-image", MakeFile("a.exe", "application/x-msdownload", 100));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_rejects_no_file()
    {
        var controller = CreateController(new RecordingStorageService(), new FakeCurrentUser { WorkspaceId = Guid.NewGuid(), UserId = Guid.NewGuid() });

        var result = await controller.Upload("note", null);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Upload_keys_a_workspace_scoped_category_by_the_callers_workspace()
    {
        var storage = new RecordingStorageService();
        var workspaceId = Guid.NewGuid();
        var controller = CreateController(storage, new FakeCurrentUser { WorkspaceId = workspaceId, UserId = Guid.NewGuid() });

        var result = await controller.Upload("note", MakeFile("report.pdf", "application/pdf", 100));

        Assert.IsType<OkObjectResult>(result);
        Assert.StartsWith($"{workspaceId}/note/", storage.LastUploadedPath);
    }

    [Fact]
    public async Task Upload_keys_the_logo_by_the_callers_user_id_not_workspace()
    {
        // Onboarding uploads the logo before a workspace exists - this must still work.
        var storage = new RecordingStorageService();
        var userId = Guid.NewGuid();
        var controller = CreateController(storage, new FakeCurrentUser { WorkspaceId = null, UserId = userId });

        var result = await controller.Upload("logo", MakeFile("logo.png", "image/png", 100));

        Assert.IsType<OkObjectResult>(result);
        Assert.StartsWith($"user-{userId}/logo/", storage.LastUploadedPath);
    }

    [Fact]
    public async Task Upload_forbids_a_workspace_scoped_category_with_no_workspace_yet()
    {
        var controller = CreateController(new RecordingStorageService(), new FakeCurrentUser { WorkspaceId = null, UserId = Guid.NewGuid() });

        var result = await controller.Upload("note", MakeFile("a.pdf", "application/pdf", 100));

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Upload_sanitizes_the_filename_in_the_stored_path()
    {
        var storage = new RecordingStorageService();
        var workspaceId = Guid.NewGuid();
        var controller = CreateController(storage, new FakeCurrentUser { WorkspaceId = workspaceId, UserId = Guid.NewGuid() });

        await controller.Upload("note", MakeFile("../../evil <script>.pdf", "application/pdf", 100));

        Assert.DoesNotContain("..", storage.LastUploadedPath);
        Assert.DoesNotContain("<", storage.LastUploadedPath);
        Assert.DoesNotContain(" ", storage.LastUploadedPath);
    }

    [Fact]
    public async Task GetSignedUrl_forbids_a_path_outside_the_callers_own_workspace()
    {
        var storage = new RecordingStorageService();
        var controller = CreateController(storage, new FakeCurrentUser { WorkspaceId = Guid.NewGuid(), UserId = Guid.NewGuid() });

        var result = await controller.GetSignedUrl($"{Guid.NewGuid()}/note/x_file.pdf");

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetSignedUrl_allows_a_path_under_the_callers_own_workspace()
    {
        var storage = new RecordingStorageService();
        var workspaceId = Guid.NewGuid();
        var controller = CreateController(storage, new FakeCurrentUser { WorkspaceId = workspaceId, UserId = Guid.NewGuid() });

        var result = await controller.GetSignedUrl($"{workspaceId}/note/x_file.pdf");

        Assert.IsType<OkObjectResult>(result);
    }
}
