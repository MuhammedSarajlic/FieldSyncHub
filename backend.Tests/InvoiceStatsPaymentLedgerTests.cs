using backend.Data;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class InvoiceStatsPaymentLedgerTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public async Task Invoice_stats_use_balance_due_and_payment_dates_from_the_ledger()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var firstDayOfThisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonth = firstDayOfThisMonth.AddDays(-2);

        context.Invoices.AddRange(
            new Invoice
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                CustomerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Title = "Overdue",
                WorkflowStatus = InvoiceStatus.Sent,
                DueDate = now.AddDays(-5),
                LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Labor", UnitPrice = 120m, Quantity = 1 }]
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                CustomerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Title = "Partial",
                WorkflowStatus = InvoiceStatus.Sent,
                DueDate = now.AddDays(7),
                LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Service", UnitPrice = 100m, Quantity = 1 }],
                Payments =
                [
                    new Payment
                    {
                        Id = Guid.NewGuid(),
                        Amount = 40m,
                        Status = PaymentRecordStatus.Succeeded,
                        PaidAt = firstDayOfThisMonth.AddDays(3)
                    }
                ]
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                CustomerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Title = "Paid",
                WorkflowStatus = InvoiceStatus.Sent,
                DueDate = now.AddDays(-1),
                LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Install", UnitPrice = 90m, Quantity = 1 }],
                Payments =
                [
                    new Payment
                    {
                        Id = Guid.NewGuid(),
                        Amount = 90m,
                        Status = PaymentRecordStatus.Succeeded,
                        PaidAt = firstDayOfThisMonth.AddDays(5)
                    }
                ]
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                CustomerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Title = "Old payment month",
                WorkflowStatus = InvoiceStatus.Sent,
                DueDate = now.AddDays(-2),
                LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Repair", UnitPrice = 75m, Quantity = 1 }],
                Payments =
                [
                    new Payment
                    {
                        Id = Guid.NewGuid(),
                        Amount = 75m,
                        Status = PaymentRecordStatus.Succeeded,
                        PaidAt = lastMonth
                    }
                ]
            },
            new Invoice
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                CustomerId = Guid.NewGuid(),
                PropertyId = Guid.NewGuid(),
                Title = "Draft",
                WorkflowStatus = InvoiceStatus.Draft,
                DueDate = now.AddDays(10),
                LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Draft line", UnitPrice = 50m, Quantity = 1 }]
            });

        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new StubEmailService());
        var stats = await service.GetInvoiceStats(workspaceId);

        Assert.Equal(180m, stats.TotalOutstanding);
        Assert.Equal(130m, stats.TotalPaidThisMonth);
        Assert.Equal(1, stats.OverdueCount);
        Assert.Equal(87m, stats.AverageInvoiceValue);
    }

    private sealed class StubEmailService : IEmailService
    {
        public bool IsConfigured => true;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => Task.FromResult(EmailSendResult.Ok);

        public Task<EmailSendResult> SendEmailAsync(IEnumerable<string> toEmails, string subject, string plainTextContent, string htmlContent, IEnumerable<EmailAttachment>? attachments = null)
            => Task.FromResult(EmailSendResult.Ok);
    }
}
