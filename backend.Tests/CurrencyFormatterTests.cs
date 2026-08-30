using backend.Services.Billing;

namespace backend.Tests;

public class CurrencyFormatterTests
{
    [Theory]
    [InlineData(125.5, "USD", "$125.50")]
    [InlineData(125.5, "EUR", "EUR 125.50")]
    [InlineData(125.5, "GBP", "GBP 125.50")]
    public void Format_uses_workspace_currency_codes(decimal amount, string currencyCode, string expectedPrefix)
    {
        var formatted = CurrencyFormatter.Format(amount, currencyCode);

        Assert.StartsWith(expectedPrefix, formatted);
    }
}
