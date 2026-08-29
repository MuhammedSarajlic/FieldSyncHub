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
        var items = (lineItems ?? []).ToList();

        decimal subtotal = RoundMoney(items.Sum(lineItem =>
            lineItem == null ? 0m : lineItem.UnitPrice * lineItem.Quantity));
        decimal taxableSubtotalBeforeDiscount = RoundMoney(items.Sum(lineItem =>
            lineItem is { IsTaxable: true } ? lineItem.UnitPrice * lineItem.Quantity : 0m));

        decimal discount = discountType == DiscountType.Percentage
            ? subtotal * (discountValue / 100m)
            : discountValue;
        discount = RoundMoney(discount);

        decimal taxableDiscount = 0m;
        if (subtotal != 0m && taxableSubtotalBeforeDiscount != 0m && discount != 0m)
        {
            taxableDiscount = RoundMoney(discount * (taxableSubtotalBeforeDiscount / subtotal));
        }

        decimal taxableSubtotal = RoundMoney(taxableSubtotalBeforeDiscount - taxableDiscount);
        decimal taxAmount = RoundMoney(taxableSubtotal * taxRate);
        decimal total = RoundMoney((subtotal - discount) + taxAmount);

        return new TotalsBreakdown(subtotal, discount, taxableSubtotal, taxAmount, total);
    }

    private static decimal RoundMoney(decimal amount)
        => Math.Round(amount, 2, MidpointRounding.AwayFromZero);
}
