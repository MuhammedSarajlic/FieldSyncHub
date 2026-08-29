using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using backend.Services.JobService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using backend.Dtos.ServiceItemDto;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests;

public class BillingSnapshotPriceTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public void Invoice_subtotal_uses_the_stored_line_item_price_snapshot()
    {
        var invoice = new Invoice
        {
            LineItems =
            [
                new LineItem
                {
                    UnitPrice = 100m,
                    Quantity = 2,
                    ServiceItem = new ServiceItem { UnitPrice = 999m }
                }
            ]
        };

        Assert.Equal(200m, invoice.Subtotal);
    }

    [Fact]
    public async Task Invoice_stats_ignore_the_current_pricebook_price()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var serviceItem = new ServiceItem
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Name = "Diagnostic",
            UnitPrice = 999m
        };

        context.ServiceItems.Add(serviceItem);
        context.Invoices.Add(new Invoice
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            PropertyId = Guid.NewGuid(),
            Title = "Invoice",
            Status = InvoiceStatus.Paid,
            UpdatedAt = DateTime.UtcNow,
            LineItems =
            [
                new LineItem
                {
                    Id = Guid.NewGuid(),
                    ServiceItemId = serviceItem.Id,
                    UnitPrice = 120m,
                    Quantity = 2
                }
            ]
        });
        await context.SaveChangesAsync();

        var service = new InvoiceService(context);
        var stats = await service.GetInvoiceStats(workspaceId);

        Assert.Equal(240m, stats.TotalPaidThisMonth);
        Assert.Equal(240m, stats.AverageInvoiceValue);
    }

    [Fact]
    public async Task Job_stats_ignore_the_current_pricebook_price()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var serviceItem = new ServiceItem
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Name = "Repair",
            UnitPrice = 700m
        };

        context.ServiceItems.Add(serviceItem);
        context.Jobs.Add(new Job
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            PropertyId = Guid.NewGuid(),
            Title = "Job",
            Status = JobStatus.Completed,
            LineItems =
            [
                new LineItem
                {
                    Id = Guid.NewGuid(),
                    ServiceItemId = serviceItem.Id,
                    UnitPrice = 150m,
                    Quantity = 3
                }
            ]
        });
        await context.SaveChangesAsync();

        var service = new JobService(context);
        var stats = await service.GetJobStats(workspaceId);

        Assert.Equal(450m, stats.TotalValue);
    }

    [Fact]
    public async Task Quote_stats_ignore_the_current_pricebook_price()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var serviceItem = new ServiceItem
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Name = "Install",
            UnitPrice = 850m
        };

        context.ServiceItems.Add(serviceItem);
        context.Quotes.Add(new Quote
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = Guid.NewGuid(),
            PropertyId = Guid.NewGuid(),
            Title = "Quote",
            Status = QuoteStatus.Approved,
            LineItems =
            [
                new LineItem
                {
                    Id = Guid.NewGuid(),
                    ServiceItemId = serviceItem.Id,
                    UnitPrice = 200m,
                    Quantity = 2
                }
            ]
        });
        await context.SaveChangesAsync();

        var service = new QuoteService(
            context,
            new StubServiceItemService(),
            new StubEmailService(),
            new QuotePdfService(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService()),
            new NoopStorageService());

        var stats = await service.GetQuoteStats(workspaceId);

        Assert.Equal(400m, stats.TotalValue);
        Assert.Equal(400m, stats.ApprovedValue);
    }

    private sealed class StubServiceItemService : IServiceItemService
    {
        public Task<ServiceItem> GetServiceItemById(Guid id) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<backend.Wrappers.PagedResult<ServiceItem>>> GetServiceItemsByWorkspace(Guid workspaceId, int pageNumber, int pageSize) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<backend.Wrappers.PagedResult<ServiceItem>>> GetServiceItemsByFilter(backend.Dtos.ServiceItemDto.ServiceItemFilterDto filterDto, Guid workspaceId, int pageNumber, int pageSize) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<ServiceItemStatsDto>> GetPricebookStatsByWorkspace(Guid workspaceId) => throw new NotSupportedException();
        public Task<ServiceItem> CreateServiceItem(backend.Dtos.ServiceItemDto.CreateServiceItemDto createServiceItemDto) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<ServiceItem>> UpdateServiceItem(backend.Dtos.ServiceItemDto.UpdateServiceItemDto updateServiceItemDto) => throw new NotSupportedException();
        public Task DeleteServiceItem(Guid id) => throw new NotSupportedException();
        public Task<Microsoft.AspNetCore.Mvc.IActionResult> ExportServiceItemsToCsvAsync(Guid workspaceId) => throw new NotSupportedException();
        public Task<backend.Response.ApiResponse<object>> ImportServiceItemsAsync(List<backend.Dtos.ServiceItemDto.ImportedServiceItemDto> serviceItems, Guid workspaceId) => throw new NotSupportedException();
    }

    private sealed class StubEmailService : IEmailService
    {
        public bool IsConfigured => false;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(IEnumerable<string> toEmails, string subject, string plainTextContent, string htmlContent, IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }
}
