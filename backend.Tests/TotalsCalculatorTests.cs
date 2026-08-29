using backend.Dtos.InvoiceDto;
using backend.Dtos.JobDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Services.Billing;

namespace backend.Tests;

public class TotalsCalculatorTests
{
    [Fact]
    public void TotalsCalculator_rounds_money_consistently_for_percentage_discounts()
    {
        List<LineItem> lineItems =
        [
            new LineItem { UnitPrice = 19.99m, Quantity = 3 },
            new LineItem { UnitPrice = 0.015m, Quantity = 1 }
        ];

        var totals = TotalsCalculator.Calculate(lineItems, DiscountType.Percentage, 12.345m, 0.0775m);

        Assert.Equal(59.99m, totals.Subtotal);
        Assert.Equal(7.41m, totals.Discount);
        Assert.Equal(52.58m, totals.TaxableSubtotal);
        Assert.Equal(4.07m, totals.TaxAmount);
        Assert.Equal(56.65m, totals.Total);
    }

    [Fact]
    public void Quote_job_and_invoice_use_the_same_totals_calculator()
    {
        List<LineItem> lineItems =
        [
            new LineItem { UnitPrice = 33.335m, Quantity = 3 }
        ];

        var quote = new Quote
        {
            LineItems = lineItems,
            DiscountType = DiscountType.Percentage,
            DiscountValue = 12.345m,
            TaxRate = 0.0775m
        };

        var job = new Job
        {
            LineItems = lineItems,
            DiscountType = DiscountType.Percentage,
            DiscountValue = 12.345m,
            TaxRate = 0.0775m
        };

        var invoice = new Invoice
        {
            LineItems = lineItems.ToList(),
            DiscountType = DiscountType.Percentage,
            Discount = 12.345m,
            TaxRate = 0.0775m
        };

        Assert.Equal(100.01m, quote.Subtotal);
        Assert.Equal(quote.Subtotal, job.Subtotal);
        Assert.Equal(quote.Subtotal, invoice.Subtotal);

        Assert.Equal(12.35m, quote.Discount);
        Assert.Equal(quote.Discount, job.Discount);
        Assert.Equal(94.45m, quote.Total);
        Assert.Equal(quote.Total, job.TotalAmount);
        Assert.Equal(quote.Total, invoice.Total);
    }

    [Fact]
    public void Discount_type_defaults_are_fixed_amount_across_documents_and_create_dtos()
    {
        Assert.Equal(DiscountType.FixedAmount, new Quote().DiscountType);
        Assert.Equal(DiscountType.FixedAmount, new Job().DiscountType);
        Assert.Equal(DiscountType.FixedAmount, new Invoice().DiscountType);
        Assert.Equal(DiscountType.FixedAmount, new CreateJobDto().DiscountType);
        Assert.Equal(DiscountType.FixedAmount, new CreateInvoiceDto().DiscountType);
    }
}
