using backend.Data;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.CustomerService;
using backend.Services.EmailService;
using backend.Services.PdfService;
using backend.Services.QuoteService;
using backend.Services.ServiceItemService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

/// <summary>
/// POST /api/customer/send-mail and POST /api/quote/{id}/send used to accept an
/// arbitrary recipient off the request with no relationship to an actual customer,
/// letting the verified sending domain be used as an open relay. These tests pin
/// that a recipient must be an address already on file for the relevant customer,
/// and that the target must belong to the caller's own workspace.
/// </summary>
public class OpenEmailRelayTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    [Fact]
    public async Task SendCustomerMail_rejects_a_recipient_not_on_file_for_the_customer()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            FirstName = "A",
            LastName = "B",
            Emails = ["customer@acme.test"]
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var service = new CustomerService(context, new NoopEmailService());
        var result = await service.SendCustomerMail(customer.Id, "attacker@evil.test", "Subject", "Body", workspaceId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendCustomerMail_rejects_a_customer_from_another_workspace()
    {
        await using var context = CreateContext();
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            WorkspaceId = Guid.NewGuid(),
            FirstName = "A",
            LastName = "B",
            Emails = ["customer@acme.test"]
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var service = new CustomerService(context, new NoopEmailService());
        var result = await service.SendCustomerMail(customer.Id, "customer@acme.test", "Subject", "Body", Guid.NewGuid());

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendCustomerMail_allows_an_address_on_file_in_the_callers_workspace()
    {
        await using var context = CreateContext();
        var workspaceId = Guid.NewGuid();
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            FirstName = "A",
            LastName = "B",
            Emails = ["customer@acme.test"]
        };
        context.Customers.Add(customer);
        await context.SaveChangesAsync();

        var service = new CustomerService(context, new NoopEmailService());
        var result = await service.SendCustomerMail(customer.Id, "customer@acme.test", "Subject", "Body", workspaceId);

        Assert.True(result.Success);
    }

    [Fact]
    public async Task SendQuote_rejects_a_recipient_not_on_file_for_the_quotes_customer()
    {
        await using var context = CreateContext();
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

        var service = CreateQuoteService(context);
        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto { Recipients = ["attacker@evil.test"], Subject = "Subject", Message = "Body", AttachPdf = false },
            "user-1",
            "Test User",
            workspaceId);

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendQuote_rejects_a_quote_from_another_workspace()
    {
        await using var context = CreateContext();
        var creator = new User { Id = Guid.NewGuid(), Email = "creator@acme.test", FirstName = "C", LastName = "D" };
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = Guid.NewGuid(), FirstName = "A", LastName = "B", Emails = ["customer@acme.test"] };
        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            WorkspaceId = customer.WorkspaceId,
            CustomerId = customer.Id,
            Customer = customer,
            CreatedByUserId = creator.Id,
            CreatedByUser = creator,
        };
        context.Users.Add(creator);
        context.Customers.Add(customer);
        context.Quotes.Add(quote);
        await context.SaveChangesAsync();

        var service = CreateQuoteService(context);
        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto { Recipients = ["customer@acme.test"], Subject = "Subject", Message = "Body", AttachPdf = false },
            "user-1",
            "Test User",
            Guid.NewGuid());

        Assert.False(result.Success);
    }

    [Fact]
    public async Task SendQuote_allows_an_address_on_file_for_the_quotes_customer()
    {
        await using var context = CreateContext();
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

        var service = CreateQuoteService(context);
        var result = await service.SendQuote(
            quote.Id,
            new SendQuoteDto { Recipients = ["customer@acme.test"], Subject = "Subject", Message = "Body", AttachPdf = false },
            creator.Id.ToString(),
            "Test User",
            workspaceId);

        Assert.True(result.Success, result.ErrorMessage);
    }

    private static QuoteService CreateQuoteService(DataContext context)
        => new(context, new ServiceItemService(context), new NoopEmailService(), new QuotePdfService(context));

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
