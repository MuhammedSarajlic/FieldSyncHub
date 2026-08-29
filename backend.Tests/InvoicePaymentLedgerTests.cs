using backend.Data;
using backend.Models;
using backend.Services.Billing;
using backend.Services.InvoiceService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class InvoicePaymentLedgerTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public void Invoice_amount_paid_balance_due_and_is_paid_are_derived_from_successful_payments()
    {
        var invoice = new Invoice
        {
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc),
            LineItems =
            [
                new LineItem { UnitPrice = 100m, Quantity = 3, IsTaxable = true }
            ],
            Payments =
            [
                new Payment { Amount = 125m, Status = PaymentRecordStatus.Succeeded },
                new Payment { Amount = 50m, Status = PaymentRecordStatus.Pending },
                new Payment { Amount = 75m, Status = PaymentRecordStatus.Succeeded }
            ]
        };

        Assert.Equal(200m, invoice.AmountPaid);
        Assert.Equal(100m, invoice.BalanceDue);
        Assert.False(invoice.IsPaid);
    }

    [Fact]
    public void Invoice_status_is_derived_from_workflow_due_date_and_payments()
    {
        var draftInvoice = new Invoice
        {
            WorkflowStatus = InvoiceStatus.Draft,
            DueDate = DateTime.UtcNow.AddDays(2),
            LineItems = [new LineItem { UnitPrice = 100m, Quantity = 1 }]
        };
        var partialInvoice = new Invoice
        {
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = DateTime.UtcNow.AddDays(2),
            LineItems = [new LineItem { UnitPrice = 100m, Quantity = 2 }],
            Payments = [new Payment { Amount = 50m, Status = PaymentRecordStatus.Succeeded }]
        };
        var overdueInvoice = new Invoice
        {
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = DateTime.UtcNow.AddDays(-2),
            LineItems = [new LineItem { UnitPrice = 200m, Quantity = 1 }]
        };
        var paidInvoice = new Invoice
        {
            WorkflowStatus = InvoiceStatus.Sent,
            DueDate = DateTime.UtcNow.AddDays(-10),
            LineItems = [new LineItem { UnitPrice = 80m, Quantity = 1 }],
            Payments = [new Payment { Amount = 80m, Status = PaymentRecordStatus.Succeeded }]
        };

        Assert.Equal(InvoiceStatus.Draft, draftInvoice.Status);
        Assert.Equal(InvoiceStatus.Partial, partialInvoice.Status);
        Assert.Equal(InvoiceStatus.Overdue, overdueInvoice.Status);
        Assert.Equal(InvoiceStatus.Paid, paidInvoice.Status);
    }

    [Theory]
    [InlineData(InvoiceStatus.Draft, InvoiceStatus.Draft)]
    [InlineData(InvoiceStatus.Sent, InvoiceStatus.Sent)]
    [InlineData(InvoiceStatus.Partial, InvoiceStatus.Sent)]
    [InlineData(InvoiceStatus.Paid, InvoiceStatus.Sent)]
    [InlineData(InvoiceStatus.Overdue, InvoiceStatus.Sent)]
    public void NormalizeWorkflowStatus_keeps_only_draft_or_sent(InvoiceStatus input, InvoiceStatus expected)
    {
        Assert.Equal(expected, PaymentLedgerCalculator.NormalizeWorkflowStatus(input));
    }
}
