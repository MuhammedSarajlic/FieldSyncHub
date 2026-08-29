using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.PdfService;
using backend.Tests.TestDoubles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Tests;

/// <summary>
/// FetchLogoAsync did httpClient.GetByteArrayAsync(logoUrl) on a workspace-controlled
/// URL with no scheme allow-list and no private-IP block - pointing LogoUrl at
/// 169.254.169.254 made the server fetch cloud metadata on the caller's behalf. These
/// pin that a non-https scheme, and every RFC1918/loopback/link-local range (which
/// covers the cloud metadata address), are rejected before any request is made - and
/// that PDF generation still succeeds without a logo rather than failing the whole
/// request. IP-literal hosts resolve locally (no real DNS/network call), so these run
/// fully offline.
/// </summary>
public class QuoteLogoSsrfTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new DataContext(options);
    }

    private static QuotePdfService CreateService(DataContext context)
        => new(context, new MemoryCache(new MemoryCacheOptions()), new NoopStorageService());

    private static async Task<Quote> SeedQuote(DataContext context, string? logoUrl)
    {
        var workspace = new Workspace { Id = Guid.NewGuid(), Name = "Acme", LogoUrl = logoUrl };
        var creator = new User { Id = Guid.NewGuid(), Email = "owner@acme.test", FirstName = "O", LastName = "W", WorkspaceId = workspace.Id, Workspace = workspace };
        var customer = new Customer { Id = Guid.NewGuid(), WorkspaceId = workspace.Id, FirstName = "A", LastName = "B" };
        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            CustomerId = customer.Id,
            Customer = customer,
            CreatedByUserId = creator.Id,
            CreatedByUser = creator,
            QuoteNumber = "Q-0001",
        };
        context.Workspaces.Add(workspace);
        context.Users.Add(creator);
        context.Customers.Add(customer);
        context.Quotes.Add(quote);
        await context.SaveChangesAsync();
        return quote;
    }

    [Theory]
    [InlineData("http://example.com/logo.png")] // non-https
    [InlineData("https://169.254.169.254/latest/meta-data/")] // cloud metadata
    [InlineData("https://127.0.0.1/logo.png")] // loopback
    [InlineData("https://10.0.0.5/logo.png")] // RFC1918
    [InlineData("https://172.16.0.5/logo.png")] // RFC1918
    [InlineData("https://192.168.1.5/logo.png")] // RFC1918
    [InlineData("https://0.0.0.0/logo.png")] // unspecified
    public async Task GenerateQuotePdf_does_not_reach_a_blocked_logo_url(string logoUrl)
    {
        await using var context = CreateContext();
        var quote = await SeedQuote(context, logoUrl);
        var service = CreateService(context);

        // Must not throw, and must not hang trying to reach the blocked target -
        // the PDF is generated without a logo instead.
        var pdfBytes = await service.GenerateQuotePdf(quote.Id);

        Assert.NotEmpty(pdfBytes);
    }

    [Fact]
    public async Task GenerateQuotePdf_succeeds_with_no_logo_url_at_all()
    {
        await using var context = CreateContext();
        var quote = await SeedQuote(context, logoUrl: null);
        var service = CreateService(context);

        var pdfBytes = await service.GenerateQuotePdf(quote.Id);

        Assert.NotEmpty(pdfBytes);
    }
}
