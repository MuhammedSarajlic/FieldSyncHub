using backend.Models;
using backend.Models.QuoteModels;

namespace backend.Services.Billing;

public readonly record struct TotalsBreakdown(
    decimal Subtotal,
    decimal Discount,
    decimal TaxableSubtotal,
    decimal TaxAmount,
    decimal Total);

public static class TotalsCalculator
{
    public static TotalsBreakdown Calculate(
        IEnumerable<LineItem>? lineItems,
        DiscountType discountType,
        decimal discountValue,
        decimal taxRate)
    {
        decimal subtotal = RoundMoney((lineItems ?? []).Sum(lineItem =>
            lineItem == null ? 0m : lineItem.UnitPrice * lineItem.Quantity));

        decimal discount = discountType == DiscountType.Percentage
            ? subtotal * (discountValue / 100m)
            : discountValue;
        discount = RoundMoney(discount);

        decimal taxableSubtotal = RoundMoney(subtotal - discount);
        decimal taxAmount = RoundMoney(taxableSubtotal * taxRate);
        decimal total = RoundMoney(taxableSubtotal + taxAmount);

        return new TotalsBreakdown(subtotal, discount, taxableSubtotal, taxAmount, total);
    }

    private static decimal RoundMoney(decimal amount)
        => Math.Round(amount, 2, MidpointRounding.AwayFromZero);
}
