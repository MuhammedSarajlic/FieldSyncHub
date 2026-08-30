using backend.Data;
using backend.Models;
using backend.Services.EmailService;
using backend.Services.InvoiceService;
using backend.Services.JobService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class ChangeJobStatusTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    private static Customer CreateCustomer(Guid workspaceId, Guid customerId)
        => new()
        {
            Id = customerId,
            WorkspaceId = workspaceId,
            FirstName = "Jamie",
            LastName = "Rivers",
            DisplayName = "Jamie Rivers",
            Emails = ["jamie@example.com"]
        };

    private static Job CreateJob(Guid workspaceId, Guid jobId, Guid customerId, Guid propertyId, bool sendInvoice)
        => new()
        {
            Id = jobId,
            WorkspaceId = workspaceId,
            CustomerId = customerId,
            PropertyId = propertyId,
            Title = "Gutter cleaning",
            StartDateTime = DateTime.UtcNow,
            EndDateTime = DateTime.UtcNow.AddHours(1),
            Status = JobStatus.InProgress,
            SendInvoice = sendInvoice,
            LineItems =
            [
                new LineItem { Id = Guid.NewGuid(), Name = "Cleaning", UnitPrice = 120m, Quantity = 1 }
            ]
        };

    [Fact]
    public async Task ChangeJobStatus_to_Completed_with_SendInvoice_creates_and_sends_an_invoice()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();
        var jobId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.Customers.Add(CreateCustomer(workspaceId, customerId));
        context.Properties.Add(new Property { Id = propertyId, CustomerId = customerId, Street = "1 Elm St" });
        context.Jobs.Add(CreateJob(workspaceId, jobId, customerId, propertyId, sendInvoice: true));
        await context.SaveChangesAsync();

        var invoiceService = new InvoiceService(context, new StubEmailService());
        var jobService = new JobService(context, invoiceService);

        var result = await jobService.ChangeJobStatus(jobId, JobStatus.Completed, workspaceId, userId);

        Assert.True(result.Success);
        var job = result.Payload!;
        Assert.Equal(JobStatus.Completed, job.Status);
        Assert.NotNull(job.CompletedAt);
        Assert.True(job.InvoiceSent);
        Assert.Single(job.StatusHistory);
        Assert.Equal(JobStatus.InProgress.ToString(), job.StatusHistory.First().FromStatus);
        Assert.Equal(JobStatus.Completed.ToString(), job.StatusHistory.First().ToStatus);

        var invoice = await context.Invoices.Include(i => i.LineItems).FirstOrDefaultAsync(i => i.JobId == jobId);
        Assert.NotNull(invoice);
        Assert.Equal(customerId, invoice!.CustomerId);
        Assert.Equal(propertyId, invoice.PropertyId);
        Assert.Single(invoice.LineItems);
        Assert.Equal(120m, invoice.LineItems[0].UnitPrice);
        Assert.NotNull(invoice.SentAt);
    }

    [Fact]
    public async Task ChangeJobStatus_to_Completed_without_SendInvoice_does_not_create_an_invoice()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Customers.Add(CreateCustomer(workspaceId, customerId));
        context.Properties.Add(new Property { Id = propertyId, CustomerId = customerId, Street = "1 Elm St" });
        context.Jobs.Add(CreateJob(workspaceId, jobId, customerId, propertyId, sendInvoice: false));
        await context.SaveChangesAsync();

        var jobService = new JobService(context, new NotImplementedInvoiceService());

        var result = await jobService.ChangeJobStatus(jobId, JobStatus.Completed, workspaceId, Guid.NewGuid());

        Assert.True(result.Success);
        Assert.False(result.Payload!.InvoiceSent);
        Assert.False(await context.Invoices.AnyAsync(i => i.JobId == jobId));
    }

    [Fact]
    public async Task ChangeJobStatus_does_not_re_invoice_a_job_that_was_already_invoiced()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Customers.Add(CreateCustomer(workspaceId, customerId));
        context.Properties.Add(new Property { Id = propertyId, CustomerId = customerId, Street = "1 Elm St" });
        var job = CreateJob(workspaceId, jobId, customerId, propertyId, sendInvoice: true);
        job.InvoiceSent = true;
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var jobService = new JobService(context, new NotImplementedInvoiceService());

        var result = await jobService.ChangeJobStatus(jobId, JobStatus.Completed, workspaceId, Guid.NewGuid());

        Assert.True(result.Success);
        Assert.False(await context.Invoices.AnyAsync(i => i.JobId == jobId));
    }

    [Fact]
    public async Task ChangeJobStatus_reapplying_the_same_status_is_a_noop()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var propertyId = Guid.NewGuid();
        var jobId = Guid.NewGuid();

        context.Customers.Add(CreateCustomer(workspaceId, customerId));
        context.Properties.Add(new Property { Id = propertyId, CustomerId = customerId, Street = "1 Elm St" });
        context.Jobs.Add(CreateJob(workspaceId, jobId, customerId, propertyId, sendInvoice: true));
        await context.SaveChangesAsync();

        var jobService = new JobService(context, new NotImplementedInvoiceService());

        var result = await jobService.ChangeJobStatus(jobId, JobStatus.InProgress, workspaceId, Guid.NewGuid());

        Assert.True(result.Success);
        Assert.Empty(result.Payload!.StatusHistory);
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
