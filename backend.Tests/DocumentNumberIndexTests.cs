using backend.Data;
using backend.Models;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class DocumentNumberIndexTests
{
    [Fact]
    public void DataContext_configures_unique_document_number_indexes_per_workspace()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new DataContext(options);

        AssertHasUniqueIndex<Invoice>(context, nameof(Invoice.WorkspaceId), nameof(Invoice.InvoiceNumber));
        AssertHasUniqueIndex<Job>(context, nameof(Job.WorkspaceId), nameof(Job.JobNumber));
        AssertHasUniqueIndex<Quote>(context, nameof(Quote.WorkspaceId), nameof(Quote.QuoteNumber));
    }

    private static void AssertHasUniqueIndex<TEntity>(DataContext context, params string[] propertyNames)
        where TEntity : class
    {
        var entityType = context.Model.FindEntityType(typeof(TEntity));
        Assert.NotNull(entityType);

        var hasIndex = entityType!.GetIndexes().Any(index =>
            index.IsUnique &&
            index.Properties.Select(property => property.Name).SequenceEqual(propertyNames));

        Assert.True(hasIndex, $"Expected a unique index on {typeof(TEntity).Name}({string.Join(", ", propertyNames)}).");
    }
}
