using backend.Data;
using backend.Models;
using backend.Services.InvoiceService;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class InvoicePdfDetailsTests
{
    private static DataContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<DataContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new DataContext(options);
    }

    [Fact]
    public void BuildWorkspaceIdentityLines_uses_workspace_details_instead_of_hardcoded_sender_data()
    {
        var workspace = new Workspace
        {
            Name = "Field Crew",
            CompanyName = "Northwind Mechanical",
            PhoneNumber = "(555) 111-2222",
            CompanyUrl = "northwind.example"
        };

        var lines = InvoiceService.BuildWorkspaceIdentityLines(workspace);

        Assert.Equal(
            ["Northwind Mechanical", "(555) 111-2222", "northwind.example"],
            lines);
        Assert.DoesNotContain("Inat Digital", lines);
        Assert.DoesNotContain("lordmest.lm@gmail.com", lines);
    }

    [Fact]
    public void BuildBillToLines_includes_customer_billing_details_and_service_address()
    {
        var invoice = new Invoice
        {
            Customer = new Customer
            {
                FirstName = "Avery",
                LastName = "Stone",
                CompanyName = "Stone Properties",
                BillingStreet = "10 Main St",
                BillingCity = "Austin",
                BillingState = "TX",
                BillingPostalCode = "78701",
                BillingCountry = "USA",
                Emails = ["avery@stone.test"],
                CustomerPhones =
                [
                    new CustomerPhone { PhoneNumber = "555-0000" }
                ]
            },
            Property = new Property
            {
                Street = "500 Service Rd",
                City = "Austin",
                State = "TX",
                PostalCode = "78702",
                Country = "USA"
            }
        };

        var lines = InvoiceService.BuildBillToLines(invoice);

        Assert.Equal("Stone Properties", lines[0]);
        Assert.Contains("Avery Stone", lines);
        Assert.Contains("10 Main St, Austin, TX 78701, USA", lines);
        Assert.Contains("555-0000", lines);
        Assert.Contains("avery@stone.test", lines);
        Assert.Contains("500 Service Rd, Austin, TX 78702, USA", lines);
    }

    [Fact]
    public void GenerateDocument_succeeds_with_workspace_sender_and_bill_to_data()
    {
        using var context = CreateContext();
        var workspaceId = Guid.NewGuid();

        context.Workspaces.Add(new Workspace
        {
            Id = workspaceId,
            Name = "Field Crew",
            CompanyName = "Northwind Mechanical",
            PhoneNumber = "(555) 111-2222",
            CompanyUrl = "northwind.example"
        });
        context.SaveChanges();

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            InvoiceNumber = "INV-1001",
            IssueDate = new DateTime(2026, 8, 29),
            DueDate = new DateTime(2026, 9, 12),
            PaymentTerms = "Net 14",
            Customer = new Customer
            {
                FirstName = "Avery",
                LastName = "Stone",
                Emails = ["avery@stone.test"]
            },
            Property = new Property
            {
                Street = "500 Service Rd",
                City = "Austin",
                State = "TX",
                PostalCode = "78702",
                Country = "USA"
            },
            LineItems =
            [
                new LineItem
                {
                    Name = "Inspection",
                    UnitPrice = 125m,
                    Quantity = 2,
                    IsTaxable = true
                }
            ]
        };

        var service = new InvoiceService(context);
        var pdfBytes = service.GenerateDocument(invoice);

        Assert.NotNull(pdfBytes);
        Assert.NotEmpty(pdfBytes);
        Assert.Equal("%PDF", System.Text.Encoding.ASCII.GetString(pdfBytes, 0, 4));
    }
}
