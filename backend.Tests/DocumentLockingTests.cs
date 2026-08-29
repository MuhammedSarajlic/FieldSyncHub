using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests;

public class DocumentLockingTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public async Task UpdateInvoice_rejects_changes_after_the_invoice_has_been_sent()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var invoiceId = Guid.NewGuid();

        context.Invoices.Add(new Invoice
        {
            Id = invoiceId,
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            PropertyId = Guid.NewGuid(),
            Title = "Invoice",
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = DateTime.UtcNow.AddDays(7),
            LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Repair", UnitPrice = 100m, Quantity = 1 }]
        });
        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new StubEmailService());

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateInvoice(
            new UpdateInvoiceDto
            {
                Id = invoiceId,
                Title = "Changed"
            },
            workspaceId));

        Assert.Equal(
            "This invoice is locked because it has already been sent or paid. Revise and resend by creating a new invoice version.",
            ex.Message);
    }

    [Fact]
    public async Task UpdateInvoice_rejects_changes_after_any_payment_is_recorded()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var invoiceId = Guid.NewGuid();

        context.Invoices.Add(new Invoice
        {
            Id = invoiceId,
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            PropertyId = Guid.NewGuid(),
            Title = "Invoice",
            WorkflowStatus = InvoiceStatus.Draft,
            DueDate = DateTime.UtcNow.AddDays(7),
            LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Repair", UnitPrice = 100m, Quantity = 1 }],
            Payments =
            [
                new Payment
                {
                    Id = Guid.NewGuid(),
                    Amount = 25m,
                    Status = PaymentRecordStatus.Succeeded,
                    PaidAt = DateTime.UtcNow
                }
            ]
        });
        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new StubEmailService());

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateInvoice(
            new UpdateInvoiceDto
            {
                Id = invoiceId,
                Title = "Changed"
            },
            workspaceId));

        Assert.Equal(
            "This invoice is locked because it has already been sent or paid. Revise and resend by creating a new invoice version.",
            ex.Message);
    }

    [Fact]
    public async Task UpdateQuote_rejects_changes_after_the_quote_has_been_sent()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var quoteId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.Users.Add(new User
        {
            Id = userId,
            WorkspaceId = workspaceId,
            FirstName = "Test",
            LastName = "User",
            Email = "test@acme.test"
        });
        context.Quotes.Add(new Quote
        {
            Id = quoteId,
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            CreatedByUserId = userId,
            Title = "Quote",
            Status = QuoteStatus.Sent,
            LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Repair", UnitPrice = 100m, Quantity = 1 }],
            ActivityHistory = []
        });
        await context.SaveChangesAsync();

        var service = new QuoteService(
            context,
            new StubServiceItemService(),
            new StubEmailService(),
            new QuotePdfService(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService()),
            new NoopStorageService());

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateQuote(
            new UpdateQuoteDto
            {
                Id = quoteId,
                Title = "Changed"
            },
            userId.ToString(),
            "Test User",
            workspaceId));

        Assert.Equal(
            "This quote is locked because it has already been sent or responded to. Revise and resend by creating a new quote version.",
            ex.Message);
    }

    private sealed class StubEmailService : IEmailService
    {
        public bool IsConfigured => true;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(IEnumerable<string> toEmails, string subject, string plainTextContent, string htmlContent, IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }

    private sealed class StubServiceItemService : IServiceItemService
    {
        public Task<ServiceItem> GetServiceItemById(Guid id) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<backend.Wrappers.PagedResult<ServiceItem>>> GetServiceItemsByWorkspace(Guid workspaceId, int pageNumber, int pageSize) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<backend.Wrappers.PagedResult<ServiceItem>>> GetServiceItemsByFilter(backend.Dtos.ServiceItemDto.ServiceItemFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<backend.Dtos.ServiceItemDto.ServiceItemStatsDto>> GetPricebookStatsByWorkspace(Guid workspaceId) => throw new NotSupportedException();
        public Task<ServiceItem> CreateServiceItem(backend.Dtos.ServiceItemDto.CreateServiceItemDto createServiceItemDto) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<ServiceItem>> UpdateServiceItem(backend.Dtos.ServiceItemDto.UpdateServiceItemDto updateServiceItemDto) => throw new NotSupportedException();
        public Task DeleteServiceItem(Guid id) => throw new NotSupportedException();
        public Task<Microsoft.AspNetCore.Mvc.IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<object>> ImportServiceItemsAsync(List<backend.Dtos.ServiceItemDto.ImportedServiceItemDto> serviceItems, Guid workspaceId) => throw new NotSupportedException();
    }
}
