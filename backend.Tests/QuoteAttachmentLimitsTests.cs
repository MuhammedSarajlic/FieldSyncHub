using backend.Data;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.EmailService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests;

/// <summary>
/// SendQuote decoded an unbounded list of client-supplied base64 blobs into memory
/// with no per-file or total size limit and no content-type allow-list - a single
/// request could exhaust the server. These pin that an oversized (or disallowed)
/// attachment is rejected before it's ever decoded, and that a normal small
/// attachment still goes through.
/// </summary>
public class QuoteAttachmentLimitsTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static QuoteService CreateQuoteService(DataContext context)
        => new(context, new ServiceItemService(context, new NoopStorageService()), new NoopEmailService(), new QuotePdfService(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService()), new NoopStorageService());

    private static async Task<(QuoteService service, Quote quote, Guid workspaceId)> Seed(DataContext context)
    {
        var workspaceId = Guid.NewGuid();
        var creator = new User { Id = Guid.NewGuid(), Email = "creator@acme.test", FirstName = "C", LastName = "D" };
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspaceId, FirstName = "A", LastName = "B", Emails = ["customer@acme.test"] };
        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = customer.Id,
            Customer = customer,
            CreatedByUserId = creator.Id,
            CreatedByUser = creator,
        };
        context.Users.Add(creator);
        context.Customers.Add(customer);
        context.Quotes.Add(quote);
        await context.SaveChangesAsync();

        return (CreateQuoteService(context), quote, workspaceId);
    }

    private static string Base64OfSize(int byteCount) => Convert.ToBase64String(new byte[byteCount]);

    [Fact]
    public async Task SendQuote_rejects_a_single_attachment_over_the_cap()
    {
        await using var context = CreateContext();
        var (service, quote, workspaceId) = await Seed(context);

        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto
            {
                Recipients = ["customer@acme.test"],
                Subject = "Subject",
                Message = "Body",
                AttachPdf = false,
                Attachments = [new SendQuoteAttachmentDto { FileName = "big.pdf", ContentType = "application/pdf", Content = Base64OfSize(11 * 1024 * 1024) }]
            },
            "creator-1", "Test User", workspaceId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendQuote_rejects_several_attachments_whose_combined_size_exceeds_the_cap()
    {
        await using var context = CreateContext();
        var (service, quote, workspaceId) = await Seed(context);

        var sixMb = Base64OfSize(6 * 1024 * 1024);
        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto
            {
                Recipients = ["customer@acme.test"],
                Subject = "Subject",
                Message = "Body",
                AttachPdf = false,
                Attachments =
                [
                    new SendQuoteAttachmentDto { FileName = "a.pdf", ContentType = "application/pdf", Content = sixMb },
                    new SendQuoteAttachmentDto { FileName = "b.pdf", ContentType = "application/pdf", Content = sixMb },
                ]
            },
            "creator-1", "Test User", workspaceId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendQuote_rejects_a_disallowed_content_type()
    {
        await using var context = CreateContext();
        var (service, quote, workspaceId) = await Seed(context);

        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto
            {
                Recipients = ["customer@acme.test"],
                Subject = "Subject",
                Message = "Body",
                AttachPdf = false,
                Attachments = [new SendQuoteAttachmentDto { FileName = "a.exe", ContentType = "application/x-msdownload", Content = Base64OfSize(100) }]
            },
            "creator-1", "Test User", workspaceId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendQuote_allows_a_small_attachment_of_an_allowed_type()
    {
        await using var context = CreateContext();
        var (service, quote, workspaceId) = await Seed(context);

        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto
            {
                Recipients = ["customer@acme.test"],
                Subject = "Subject",
                Message = "Body",
                AttachPdf = false,
                Attachments = [new SendQuoteAttachmentDto { FileName = "a.pdf", ContentType = "application/pdf", Content = Base64OfSize(1024) }]
            },
            Guid.NewGuid().ToString(), "Test User", workspaceId);

        Assert.True(result.Success, result.ErrorMessage);
    }

    private sealed class NoopEmailService : IEmailService
    {
        public bool IsConfigured => true;

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
