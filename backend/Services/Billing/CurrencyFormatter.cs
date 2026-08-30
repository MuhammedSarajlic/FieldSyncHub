using System.Globalization;

namespace backend.Services.Billing;

public static class CurrencyFormatter
{
    public static string Format(decimal amount, string? currencyCode)
    {
        var normalizedCode = string.IsNullOrWhiteSpace(currencyCode)
            ? "USD"
            : currencyCode.Trim().ToUpperInvariant();

        var amountText = amount.ToString("#,0.00", CultureInfo.InvariantCulture);
        return normalizedCode == "USD"
            ? $"${amountText}"
            : $"{normalizedCode} {amountText}";
    }
}
