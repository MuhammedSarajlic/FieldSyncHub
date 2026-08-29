using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class FractionalQuantityTests
{
    [Fact]
    public void Line_item_totals_support_fractional_and_zero_quantities()
    {
        var invoice = new Invoice
        {
            LineItems =
            [
                new LineItem { UnitPrice = 100m, Quantity = 1.5m, IsTaxable = true },
                new LineItem { UnitPrice = 50m, Quantity = 0m, IsTaxable = true }
            ]
        };

        Assert.Equal(150m, invoice.Subtotal);
        Assert.Equal(150m, invoice.Total);
    }

    [Fact]
    public void Service_item_unit_of_measure_is_mapped_in_the_model()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new DataContext(options);
        var property = context.Model.FindEntityType(typeof(ServiceItem))!.FindProperty(nameof(ServiceItem.UnitOfMeasure));

        Assert.NotNull(property);
    }
}
