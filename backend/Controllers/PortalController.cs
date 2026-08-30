using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.CurrentUserService;
using backend.Services.PortalAccessService;
using backend.Services.StripeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/portal")]
public class PortalController : ControllerBase
{
    private readonly DataContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IPortalAccessService _access;
    private readonly IStripePaymentService _stripe;

    public PortalController(DataContext db, ICurrentUser currentUser, IPortalAccessService access, IStripePaymentService stripe)
    {
        _db = db;
        _currentUser = currentUser;
        _access = access;
        _stripe = stripe;
    }

    [AllowAnonymous]
    [HttpPost("{token}/payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent(string token)
    {
        if (!_access.TryRead(token, out var access) || access?.Kind != "invoice") return NotFound();
        var invoice = await _db.Invoices.Include(i => i.Payments).Include(i => i.LineItems).FirstOrDefaultAsync(i => i.Id == access.DocumentId);
        if (invoice == null) return NotFound();
        if (invoice.BalanceDue <= 0m) return BadRequest(new { message = "This invoice is already paid." });
        if (!_stripe.IsConfigured) return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Online payments are not configured for this workspace." });
        var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == invoice.WorkspaceId);
        if (workspace == null) return NotFound();
        var intent = await _stripe.CreatePaymentIntentAsync(invoice.BalanceDue, workspace.Currency, invoice.Id, Request.Headers["Idempotency-Key"].FirstOrDefault(), HttpContext.RequestAborted);
        return intent == null ? StatusCode(StatusCodes.Status502BadGateway, new { message = "The payment provider could not create a payment." }) : Ok(new { intent.Id, clientSecret = intent.ClientSecret, publishableKey = _stripe.PublishableKey });
    }

    [Authorize]
    [HttpPost("quote/{quoteId:guid}/link")]
    public async Task<IActionResult> CreateQuoteLink(Guid quoteId)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var exists = await _db.Quotes.AnyAsync(q => q.Id == quoteId && q.WorkspaceId == workspaceId);
        if (!exists) return NotFound();
        return Ok(new { token = _access.Create("quote", quoteId, TimeSpan.FromDays(30)) });
    }

    [Authorize]
    [HttpPost("invoice/{invoiceId:guid}/link")]
    public async Task<IActionResult> CreateInvoiceLink(Guid invoiceId)
    {
        if (_currentUser.WorkspaceId is not Guid workspaceId) return Forbid();
        var exists = await _db.Invoices.AnyAsync(i => i.Id == invoiceId && i.WorkspaceId == workspaceId);
        if (!exists) return NotFound();
        return Ok(new { token = _access.Create("invoice", invoiceId, TimeSpan.FromDays(30)) });
    }

    [AllowAnonymous]
    [HttpGet("{token}")]
    public async Task<IActionResult> GetDocument(string token)
    {
        if (!_access.TryRead(token, out var access) || access == null) return NotFound();

        if (access.Kind == "quote")
        {
            var quote = await _db.Quotes
                .Include(q => q.Customer).ThenInclude(c => c!.EmailRecords)
                .Include(q => q.LineItems)
                .Include(q => q.Property)
                .FirstOrDefaultAsync(q => q.Id == access.DocumentId);
            if (quote == null) return NotFound();
            if (!quote.Viewed)
            {
                quote.Viewed = true;
                quote.ViewedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
            var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == quote.WorkspaceId);
            return Ok(new { kind = "quote", workspace = WorkspaceDto(workspace), document = QuoteDto(quote) });
        }

        if (access.Kind == "invoice")
        {
            var invoice = await _db.Invoices.AsNoTracking()
                .Include(i => i.Customer)
                .Include(i => i.LineItems)
                .Include(i => i.Payments)
                .FirstOrDefaultAsync(i => i.Id == access.DocumentId);
            if (invoice == null) return NotFound();
            var workspace = await _db.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == invoice.WorkspaceId);
            return Ok(new { kind = "invoice", workspace = WorkspaceDto(workspace), document = InvoiceDto(invoice) });
        }

        return NotFound();
    }

    [AllowAnonymous]
    [HttpPost("{token}/approve")]
    public async Task<IActionResult> ApproveQuote(string token)
    {
        if (!_access.TryRead(token, out var access) || access?.Kind != "quote") return NotFound();
        var quote = await _db.Quotes.FirstOrDefaultAsync(q => q.Id == access.DocumentId);
        if (quote == null) return NotFound();
        if (quote.Status is QuoteStatus.Declined or QuoteStatus.Expired or QuoteStatus.ConvertedToJob)
            return BadRequest(new { message = "This quote is no longer available for approval." });
        quote.Status = QuoteStatus.Approved;
        quote.Viewed = true;
        quote.ViewedAt ??= DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Quote approved." });
    }

    private static object WorkspaceDto(Workspace? workspace) => new
    {
        name = workspace?.CompanyName ?? workspace?.Name ?? "Business",
        logoUrl = workspace?.LogoUrl,
        phoneNumber = workspace?.PhoneNumber,
        currency = workspace?.Currency ?? "USD"
    };

    private static object QuoteDto(Quote q) => new
    {
        id = q.Id,
        number = q.QuoteNumber,
        title = q.Title,
        status = q.Status.ToString(),
        expiresAt = q.ExpiresAt,
        paymentTerms = q.PaymentTerms,
        subtotal = q.Subtotal,
        discount = q.Discount,
        taxAmount = q.TaxAmount,
        total = q.Total,
        customer = new { name = q.Customer?.FullName, email = q.Customer?.Emails.FirstOrDefault() },
        property = q.Property?.Address,
        lineItems = q.LineItems.Select(li => new { li.Name, li.Description, li.Quantity, li.UnitPrice, total = li.Total })
    };

    private static object InvoiceDto(Invoice i) => new
    {
        id = i.Id,
        number = i.InvoiceNumber,
        title = i.Title,
        status = i.Status.ToString(),
        issueDate = i.IssueDate,
        dueDate = i.DueDate,
        paymentTerms = i.PaymentTerms,
        subtotal = i.Subtotal,
        discount = i.DiscountAmount,
        taxAmount = i.TaxAmount,
        total = i.Total,
        amountPaid = i.AmountPaid,
        balanceDue = i.BalanceDue,
        customer = new { name = i.Customer?.FullName },
        lineItems = i.LineItems.Select(li => new { li.Name, li.Description, li.Quantity, li.UnitPrice, total = li.Total })
    };
}
