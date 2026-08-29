using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class SendInvoiceTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public async Task SendInvoice_rejects_a_recipient_not_on_file_for_the_invoices_customer()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();
        context.Workspaces.Add(new Workspace
        {
            Id = workspaceId,
            Name = "Field Crew"
        });
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            FirstName = "Avery",
            LastName = "Stone",
            Emails = ["customer@acme.test"]
        };
        context.Properties.Add(new Property
        {
            Id = propertyId,
            CustomerId = customer.Id,
            Street = "10 Main St",
            City = "Austin",
            State = "TX",
            PostalCode = "78701",
            Country = "USA"
        });
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = customer.Id,
            Customer = customer,
            PropertyId = propertyId,
            Title = "Invoice",
            DueDate = DateTime.UtcNow.AddDays(7),
            LineItems = [new LineItem { Id = Guid.NewGuid(), Name = "Labor", UnitPrice = 100m, Quantity = 1 }]
        };

        context.Customers.Add(customer);
        context.Invoices.Add(invoice);
        await context.SaveChangesAsync();

        var service = new InvoiceService(context, new CapturingEmailService());
        var result = await service.SendInvoice(
            invoice.Id,
            new SendInvoiceDto
            {
                Recipients = ["attacker@evil.test"],
                Subject = "Invoice ready",
                Message = "Please see attached",
                AttachPdf = false
            },
            workspaceId,
            Guid.NewGuid(),
            "Test User");

        Assert.False(result.Success);
        Assert.Equal("These addresses aren't on file for this invoice's customer: attacker@evil.test.", result.ErrorMessage);
    }

    [Fact]
    public async Task SendInvoice_emails_pdf_marks_sent_and_writes_activity()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();

        context.Workspaces.Add(new Workspace
        {
            Id = workspaceId,
            Name = "Field Crew",
            CompanyName = "Northwind Mechanical",
            PhoneNumber = "(555) 111-2222"
        });
        context.Customers.Add(new Customer
        {
            Id = customerId,
            WorkspaceId = workspaceId,
            FirstName = "Avery",
            LastName = "Stone",
            Emails = ["customer@acme.test"]
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
        context.Invoices.Add(new Invoice
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            CustomerId = customerId,
            PropertyId = propertyId,
            InvoiceNumber = "FSH-260830-0001",
            Title = "Invoice",
            WorkflowStatus = InvoiceStatus.Draft,
            DueDate = new DateTime(2026, 9, 13, 0, 0, 0, DateTimeKind.Utc),
            PaymentTerms = "net14",
            LineItems =
            [
                new LineItem { Id = Guid.NewGuid(), Name = "Inspection", UnitPrice = 125m, Quantity = 2, IsTaxable = true }
            ]
        });
        await context.SaveChangesAsync();

        var emails = new CapturingEmailService();
        var service = new InvoiceService(context, emails);
        var result = await service.SendInvoice(
            context.Invoices.Single().Id,
            new SendInvoiceDto
            {
                Recipients = ["customer@acme.test"],
                Subject = "Invoice ready",
                Message = "Please see attached"
            },
            workspaceId,
            userId,
            "Test User");

        Assert.True(result.Success, result.ErrorMessage);
        Assert.NotNull(result.Payload);
        Assert.Equal(InvoiceStatus.Sent, result.Payload!.Status);
        Assert.NotNull(result.Payload.SentAt);
        Assert.Single(emails.SentMessages);
        Assert.Equal("customer@acme.test", Assert.Single(emails.SentMessages[0].Recipients));
        Assert.Equal("Invoice ready", emails.SentMessages[0].Subject);
        Assert.Contains(emails.SentMessages[0].Attachments, attachment => attachment.FileName == "Invoice-FSH-260830-0001.pdf" && attachment.ContentType == "application/pdf");

        var activity = await context.ActivityHistorys
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync(a => a.EntityType == nameof(Invoice) && a.EntityId == result.Payload.Id && a.Type == "InvoiceSent");

        Assert.NotNull(activity);
        Assert.Equal(userId, activity!.ChangedBy);
        Assert.Equal("Test User", activity.ChangedByName);
        Assert.Contains("customer@acme.test", activity.Action);
    }

    private sealed class CapturingEmailService : IEmailService
    {
        public List<CapturedEmail> SentMessages { get; } = [];
        public bool IsConfigured => true;

        public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
            => SendEmailAsync([toEmail], subject, plainTextContent, htmlContent, null);

        public Task<EmailSendResult> SendEmailAsync(IEnumerable<string> toEmails, string subject, string plainTextContent, string htmlContent, IEnumerable<EmailAttachment>? attachments = null)
        {
            SentMessages.Add(new CapturedEmail(
                toEmails.ToList(),
                subject,
                plainTextContent,
                htmlContent,
                attachments?.ToList() ?? []));

            return Task.FromResult(EmailSendResult.Ok);
        }
    }

    private sealed record CapturedEmail(
        List<string> Recipients,
        string Subject,
        string PlainTextBody,
        string HtmlBody,
        List<EmailAttachment> Attachments);
}
