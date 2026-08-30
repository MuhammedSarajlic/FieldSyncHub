using System.Text.Json;
using backend.Data;
using backend.Models;
using backend.Services.StripeService;
using backend.Services.WebhookService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/payments/stripe")]
public class StripeController : ControllerBase
{
    private readonly DataContext _db;
    private readonly IStripePaymentService _stripe;
    private readonly IWebhookDispatcher _webhooks;

    public StripeController(DataContext db, IStripePaymentService stripe, IWebhookDispatcher webhooks)
    {
        _db = db; _stripe = stripe; _webhooks = webhooks;
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();
        if (!_stripe.VerifyWebhookSignature(payload, Request.Headers["Stripe-Signature"].FirstOrDefault())) return Unauthorized();
        using var document = JsonDocument.Parse(payload);
        var root = document.RootElement;
        if (!root.TryGetProperty("type", out var type)) return BadRequest();
        if (type.GetString() == "checkout.session.completed")
        {
            var session = root.GetProperty("data").GetProperty("object");
            var metadata = session.GetProperty("metadata");
            var workspaceIdText = metadata.TryGetProperty("workspaceId", out var workspaceValue) ? workspaceValue.GetString() : null;
            if (Guid.TryParse(workspaceIdText, out var workspaceId))
            {
                var subscription = await _db.Subscriptions.FirstOrDefaultAsync(item => item.WorkspaceId == workspaceId);
                if (subscription != null)
                {
                    subscription.Status = "Active";
                    subscription.ProviderCustomerId = session.TryGetProperty("customer", out var customer) ? customer.GetString() : subscription.ProviderCustomerId;
                    subscription.ProviderSubscriptionId = session.TryGetProperty("subscription", out var providerSubscription) ? providerSubscription.GetString() : subscription.ProviderSubscriptionId;
                    if (metadata.TryGetProperty("plan", out var plan)) subscription.Plan = plan.GetString() ?? subscription.Plan;
                    if (metadata.TryGetProperty("seatCount", out var seats) && int.TryParse(seats.GetString(), out var seatCount)) subscription.SeatCount = seatCount;
                    subscription.CurrentPeriodEndsAt = DateTime.UtcNow.AddMonths(1);
                    subscription.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }
            }
            return Ok();
        }
        if (type.GetString() != "payment_intent.succeeded")
        {
            if (type.GetString() is "customer.subscription.updated" or "customer.subscription.deleted")
            {
                var subscriptionObject = root.GetProperty("data").GetProperty("object");
                var metadata = subscriptionObject.GetProperty("metadata");
                var workspaceIdText = metadata.TryGetProperty("workspaceId", out var workspaceValue) ? workspaceValue.GetString() : null;
                var subscription = Guid.TryParse(workspaceIdText, out var workspaceId)
                    ? await _db.Subscriptions.FirstOrDefaultAsync(item => item.WorkspaceId == workspaceId)
                    : await _db.Subscriptions.FirstOrDefaultAsync(item => item.ProviderSubscriptionId == subscriptionObject.GetProperty("id").GetString());
                if (subscription != null)
                {
                    subscription.Status = type.GetString() == "customer.subscription.deleted" ? "Canceled" : (subscriptionObject.TryGetProperty("status", out var status) ? status.GetString() ?? subscription.Status : subscription.Status);
                    subscription.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }
            }
            return Ok();
        }
        var paymentIntent = root.GetProperty("data").GetProperty("object");
        var intentId = paymentIntent.GetProperty("id").GetString();
        var invoiceIdText = paymentIntent.GetProperty("metadata").TryGetProperty("invoiceId", out var invoiceIdValue) ? invoiceIdValue.GetString() : null;
        if (!Guid.TryParse(invoiceIdText, out var invoiceId) || string.IsNullOrWhiteSpace(intentId)) return BadRequest();
        if (await _db.Payments.AnyAsync(payment => payment.ProcessorReference == intentId)) return Ok();
        var invoice = await _db.Invoices.Include(i => i.Payments).Include(i => i.LineItems).FirstOrDefaultAsync(i => i.Id == invoiceId);
        if (invoice == null) return NotFound();
        var amountMinor = paymentIntent.TryGetProperty("amount_received", out var received) ? received.GetDecimal() : paymentIntent.GetProperty("amount").GetDecimal();
        var currency = await _db.Workspaces.Where(workspace => workspace.Id == invoice.WorkspaceId).Select(workspace => workspace.Currency).FirstOrDefaultAsync() ?? "USD";
        var amount = amountMinor / (IsZeroDecimalCurrency(currency) ? 1m : 100m);
        if (amount <= 0m || amount > invoice.BalanceDue) return BadRequest();
        _db.Payments.Add(new Payment { Id = Guid.NewGuid(), InvoiceId = invoice.Id, Amount = amount, Method = PaymentMethod.Card, Status = PaymentRecordStatus.Succeeded, ProcessorReference = intentId, PaidAt = DateTime.UtcNow, Note = "Stripe payment" });
        await _db.SaveChangesAsync();
        await _webhooks.PublishAsync(invoice.WorkspaceId, invoice.BalanceDue <= 0 ? "invoice.paid" : "invoice.payment_recorded", new { invoiceId = invoice.Id, amount, processorReference = intentId });
        return Ok();
    }

    private static bool IsZeroDecimalCurrency(string currency) => currency.ToUpperInvariant() is "BIF" or "CLP" or "DJF" or "GNF" or "JPY" or "KMF" or "KRW" or "MGA" or "PYG" or "RWF" or "UGX" or "VND" or "VUV" or "XAF" or "XOF" or "XPF";
}
