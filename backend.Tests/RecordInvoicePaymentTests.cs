using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class RecordInvoicePaymentTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public async Task RecordPayment_adds_a_succeeded_payment_updates_balance_and_syncs_linked_job_status()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var invoiceId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();

        context.Customers.Add(new Customer
        {
            Id = customerId,
            WorkspaceId = workspaceId,
            FirstName = "Avery",
            LastName = "Stone",
            DisplayName = "Avery Stone"
        });
        context.Properties.Add(new Property
        {
            Id = propertyId,
            CustomerId = customerId,
            Street = "10 Main St",
            City = "Austin",
            State = "TX",
            PostalCode = "78701",
            Country = "USA"
        });

        context.Jobs.Add(new Job
        {
            Id = jobId,
            WorkspaceId = workspaceId,
            CustomerId = customerId,
            PropertyId = propertyId,
            Title = "Linked job",
            StartDateTime = DateTime.UtcNow,
            EndDateTime = DateTime.UtcNow.AddHours(1)
        });
        context.Invoices.Add(new Invoice
        {
            Id = invoiceId,
            WorkspaceId = workspaceId,
            CustomerId = customerId,
            PropertyId = propertyId,
            JobId = jobId,
            Title = "Invoice",
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = DateTime.UtcNow.AddDays(5),
            LineItems =
            [
                new LineItem { Id = Guid.NewGuid(), Name = "Install", UnitPrice = 150m, Quantity = 1 }
            ]
        });
        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new StubEmailService());
        var updatedInvoice = await service.RecordPayment(
            invoiceId,
            new RecordInvoicePaymentDto
            {
                Amount = 50m,
                Method = PaymentMethod.Check,
                PaidAt = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc),
                Note = "Check #1045"
            },
            workspaceId,
            userId);

        Assert.Equal(50m, updatedInvoice.AmountPaid);
        Assert.Equal(100m, updatedInvoice.BalanceDue);
        Assert.Equal(InvoiceStatus.Partial, updatedInvoice.Status);
        Assert.Single(updatedInvoice.Payments);
        Assert.Equal(PaymentMethod.Check, updatedInvoice.Payments[0].Method);
        Assert.Equal("Check #1045", updatedInvoice.Payments[0].Note);
        Assert.Equal(userId, updatedInvoice.Payments[0].RecordedByUserId);

        var job = await context.Jobs.FindAsync(jobId);
        Assert.Equal(PaymentStatus.Partial, job!.PaymentStatus);
    }

    [Fact]
    public async Task RecordPayment_rejects_overpayments()
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
            DueDate = DateTime.UtcNow.AddDays(5),
            LineItems =
            [
                new LineItem { Id = Guid.NewGuid(), Name = "Repair", UnitPrice = 80m, Quantity = 1 }
            ]
        });
        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new StubEmailService());

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.RecordPayment(
            invoiceId,
            new RecordInvoicePaymentDto
            {
                Amount = 100m,
                Method = PaymentMethod.Cash,
                PaidAt = new DateTime(2026, 8, 29, 0, 0, 0, DateTimeKind.Utc)
            },
            workspaceId,
            Guid.NewGuid()));

        Assert.Equal("Payment amount cannot exceed the remaining balance due.", ex.Message);
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
