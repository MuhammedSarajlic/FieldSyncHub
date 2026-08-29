using backend.Data;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Dtos.ServiceItemDto;
using backend.Dtos.WorkspaceDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.EmailService;
using backend.Services.NotesService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using backend.Services.WorkspaceService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests;

/// <summary>
/// LogoUrl/PathFile/ImageUrl/attachment Url used to be taken straight from the
/// client with no check at all - a workspace could point its logo (or a note, a
/// pricebook image, a quote attachment) at another tenant's already-uploaded path
/// and have it served back to them via the new sign-on-read step. Each of these
/// pins that a path outside the caller's own scope is dropped rather than stored.
/// </summary>
public class UploadOwnershipValidationTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task CreateWorkspace_drops_a_logo_url_that_is_not_the_creators_own()
    {
        await using var context = CreateContext();
        var service = new WorkspaceService(context, new NoopStorageService());
        var creatorId = Guid.NewGuid();
        context.Users.Add(new User { Id = creatorId, Email = "owner@acme.test", FirstName = "A", LastName = "B" });
        await context.SaveChangesAsync();

        var result = await service.CreateWorkspace(new CreateWorkspaceDto
        {
            Name = "Acme",
            CreatedByUserId = creatorId,
            LogoUrl = $"user-{Guid.NewGuid()}/logo/stolen.png" // someone else's upload
        }, creatorId);

        Assert.True(result.Success);
        Assert.Null(result.Payload!.LogoUrl);
    }

    [Fact]
    public async Task CreateWorkspace_keeps_a_logo_url_that_is_the_creators_own()
    {
        await using var context = CreateContext();
        var service = new WorkspaceService(context, new NoopStorageService());
        var creatorId = Guid.NewGuid();
        context.Users.Add(new User { Id = creatorId, Email = "owner@acme.test", FirstName = "A", LastName = "B" });
        await context.SaveChangesAsync();

        var result = await service.CreateWorkspace(new CreateWorkspaceDto
        {
            Name = "Acme",
            CreatedByUserId = creatorId,
            LogoUrl = $"user-{creatorId}/logo/mine.png"
        }, creatorId);

        Assert.True(result.Success);
        Assert.NotNull(result.Payload!.LogoUrl);
    }

    [Fact]
    public async Task UpdateWorkspace_drops_a_logo_url_that_is_not_the_callers_own()
    {
        await using var context = CreateContext();
        var service = new WorkspaceService(context, new NoopStorageService());
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme" };
        context.Workspaces.Add(workspace);
        await context.SaveChangesAsync();
        var callerId = Guid.NewGuid();

        await service.UpdateWorkspace(new UpdateWorkspaceDto { Id = workspace.Id, LogoUrl = $"user-{Guid.NewGuid()}/logo/stolen.png" }, workspace.Id, callerId);

        var reloaded = await context.Workspaces.SingleAsync(w => w.Id == workspace.Id);
        Assert.Null(reloaded.LogoUrl);
    }

    [Fact]
    public async Task CreateNote_drops_a_path_file_that_is_not_the_callers_own_workspace()
    {
        await using var context = CreateContext();
        var service = new NotesService(context, new NoopStorageService());
        var workspaceId = Guid.NewGuid();

        var note = await service.CreateNote(new CreateNoteDto { PathFile = $"{Guid.NewGuid()}/note/stolen.pdf" }, workspaceId);

        Assert.Null(note.PathFile);
    }

    [Fact]
    public async Task CreateNote_keeps_a_path_file_under_the_callers_own_workspace()
    {
        await using var context = CreateContext();
        var service = new NotesService(context, new NoopStorageService());
        var workspaceId = Guid.NewGuid();

        var note = await service.CreateNote(new CreateNoteDto { PathFile = $"{workspaceId}/note/mine.pdf" }, workspaceId);

        Assert.NotNull(note.PathFile);
    }

    [Fact]
    public async Task CreateServiceItem_drops_an_image_url_that_is_not_owned_by_its_own_workspace()
    {
        await using var context = CreateContext();
        var service = new ServiceItemService(context, new NoopStorageService());
        var workspaceId = Guid.NewGuid();

        var item = await service.CreateServiceItem(new CreateServiceItemDto
        {
            WorkspaceId = workspaceId,
            Name = "Widget",
            ImageUrl = $"{Guid.NewGuid()}/service-item-image/stolen.png"
        });

        Assert.Null(item.ImageUrl);
    }

    [Fact]
    public async Task AddAttachmentToQuote_rejects_a_quote_outside_the_callers_workspace()
    {
        await using var context = CreateContext();
        var quotePdfService = new QuotePdfService(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService());
        var service = new QuoteService(context, new ServiceItemService(context, new NoopStorageService()), new NoopEmailService(), quotePdfService, new NoopStorageService());

        var otherWorkspaceId = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = otherWorkspaceId, FirstName = "A", LastName = "B" };
        var quote = new Quote { Id = Guid.NewGuid(), WorkspaceId = otherWorkspaceId, CustomerId = customer.Id };
        context.Customers.Add(customer);
        context.Quotes.Add(quote);
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.AddAttachmentToQuote(quote.Id, new QuoteAttachmentDto { FileName = "a.pdf", Url = "x" }, "user-1", "Test", Guid.NewGuid()));
    }

    [Fact]
    public async Task AddAttachmentToQuote_drops_a_url_that_is_not_owned_by_the_quotes_workspace()
    {
        await using var context = CreateContext();
        var quotePdfService = new QuotePdfService(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService());
        var service = new QuoteService(context, new ServiceItemService(context, new NoopStorageService()), new NoopEmailService(), quotePdfService, new NoopStorageService());

        var workspaceId = Guid.NewGuid();
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B" };
        var quote = new Quote { Id = Guid.NewGuid(), WorkspaceId = workspaceId, CustomerId = customer.Id };
        context.Customers.Add(customer);
        context.Quotes.Add(quote);
        await context.SaveChangesAsync();

        var attachment = await service.AddAttachmentToQuote(
            quote.Id,
            new QuoteAttachmentDto { FileName = "a.pdf", Url = $"{Guid.NewGuid()}/quote-attachment/stolen.pdf" },
            Guid.NewGuid().ToString(), "Test", workspaceId);

        Assert.Null(attachment.Url);
    }

    private sealed class NoopEmailService : IEmailService
    {
        public bool IsConfigured => false;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(
            IEnumerable<string> toEmails,
            string subject,
            string plainTextContent,
            string htmlContent,
            IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }
}
