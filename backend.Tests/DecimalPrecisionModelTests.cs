using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class DecimalPrecisionModelTests
{
    [Fact]
    public void Money_and_rate_columns_have_explicit_precision()
    {
        using var context = CreateContext();

        AssertPrecision<LineItem>(context, nameof(LineItem.UnitPrice), 19, 4);
        AssertPrecision<LineItem>(context, nameof(LineItem.Cost), 19, 4);
        AssertPrecision<ServiceItem>(context, nameof(ServiceItem.UnitPrice), 19, 4);
        AssertPrecision<ServiceItem>(context, nameof(ServiceItem.Cost), 19, 4);
        AssertPrecision<Job>(context, nameof(Job.DepositAmount), 19, 4);
        AssertPrecision<Job>(context, nameof(Job.DiscountValue), 19, 4);
        AssertPrecision<Job>(context, nameof(Job.TaxRate), 9, 6);
        AssertPrecision<Invoice>(context, nameof(Invoice.Discount), 19, 4);
        AssertPrecision<Invoice>(context, nameof(Invoice.TaxRate), 9, 6);
        AssertPrecision<Quote>(context, nameof(Quote.DiscountValue), 19, 4);
        AssertPrecision<Quote>(context, nameof(Quote.TaxRate), 9, 6);
    }

    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    private static void AssertPrecision<TEntity>(DataContext context, string propertyName, int expectedPrecision, int expectedScale)
        where TEntity : class
    {
        var property = context.Model.FindEntityType(typeof(TEntity))!.FindProperty(propertyName)!;

        Assert.Equal(expectedPrecision, property.GetPrecision());
        Assert.Equal(expectedScale, property.GetScale());
    }
}
