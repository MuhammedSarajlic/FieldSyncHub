
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.PdfService;

public class QuoteData
{
    public string QuoteNumber { get; set; } = "";
    public DateTime QuoteDate { get; set; } = DateTime.Now;
    public DateTime DueDate { get; set; } = DateTime.Now.AddDays(14);
    public string Currency { get; set; } = "EUR";

    // Company details
    public CompanyInfo Company { get; set; } = new();
    public CustomerInfo Customer { get; set; } = new();

    // Line items
    public List<QuoteLineItem> LineItems { get; set; } = new();

    // Totals
    public decimal Subtotal { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Tax1Amount { get; set; }
    public decimal Tax2Amount { get; set; }
    public decimal Total { get; set; }

    // Tax info
    public string Tax1Name { get; set; } = "GST";
    public decimal Tax1Rate { get; set; } = 5.0m;
    public string Tax2Name { get; set; } = "Sales";
    public decimal Tax2Rate { get; set; } = 8.25m;

    // Notes
    public string Notes { get; set; } = "";

    // Signatures
    public bool ShowCompanySignature { get; set; }
    public bool ShowCustomerSignature { get; set; }
    public string CompanySignatureText { get; set; } = "Company signature";
    public string CustomerSignatureText { get; set; } = "Customer signature";
}

public class CompanyInfo
{
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
    public string Website { get; set; } = "";
    public byte[]? Logo { get; set; }
}

public class CustomerInfo
{
    public string Name { get; set; } = "";
    public string Address { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Email { get; set; } = "";
}

public class QuoteLineItem
{
    public decimal Quantity { get; set; }
    public string Description { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public decimal Amount => Quantity * UnitPrice;
    public bool HasTax1 { get; set; }
    public bool HasTax2 { get; set; }
    public bool IsBillable { get; set; } = true;
}

public class QuotePdfGenerator
{
    private readonly QuoteData _quote;
    private readonly string _primaryColor = "#343a40";

    public QuotePdfGenerator(QuoteData quote)
    {
        _quote = quote;
    }

    public byte[] GeneratePdf()
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            // Company info section
            row.RelativeItem(2).Column(column =>
            {
                // Company logo and name
                if (_quote.Company.Logo != null)
                {
                    column.Item().AlignRight().Width(120).Height(60).Image(_quote.Company.Logo);
                }

                column.Item().AlignLeft().PaddingTop(10).Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(12).SemiBold());
                    text.Line(_quote.Company.Name);
                });

                if (!string.IsNullOrEmpty(_quote.Company.Address))
                {
                    column.Item().AlignLeft().PaddingTop(5).Text(_quote.Company.Address)
                        .FontSize(9).LineHeight(1.2f);
                }
            });

            // Quote info section
            row.RelativeItem(1).Column(column =>
            {
                column.Item().AlignRight().Text("QUOTE")
                    .FontSize(24).Bold().FontColor(_primaryColor);

                column.Item().AlignRight().PaddingTop(20).Column(info =>
                {
                    info.Item().Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Quote #").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.QuoteNumber);
                    });

                    info.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Quote Date").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.QuoteDate.ToString("dd-MM-yyyy"));
                    });

                    info.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Due Date").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.DueDate.ToString("dd-MM-yyyy"));
                    });
                });
            });
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.Column(column =>
        {
            column.Item().PaddingTop(20).Row(row =>
            {
                // Bill To section
                row.RelativeItem().Column(billTo =>
                {
                    billTo.Item().Text("Bill To").Bold().FontSize(12);
                    billTo.Item().PaddingTop(5).BorderLeft(3).BorderColor(_primaryColor)
                        .PaddingLeft(10).Column(customerInfo =>
                        {
                            customerInfo.Item().Text(_quote.Customer.Name).Bold();
                            if (!string.IsNullOrEmpty(_quote.Customer.Address))
                            {
                                customerInfo.Item().Text(_quote.Customer.Address).LineHeight(1.2f);
                            }
                            if (!string.IsNullOrEmpty(_quote.Customer.Phone))
                            {
                                customerInfo.Item().Text($"Phone: {_quote.Customer.Phone}");
                            }
                            if (!string.IsNullOrEmpty(_quote.Customer.Email))
                            {
                                customerInfo.Item().Text($"Email: {_quote.Customer.Email}");
                            }
                        });
                });

                row.ConstantItem(50); // Spacer
            });

            // Line items table
            column.Item().PaddingTop(30).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(60);  // QTY
                    columns.RelativeColumn(3);   // Description
                    columns.ConstantColumn(80);  // Unit Price
                    columns.ConstantColumn(80);  // Amount
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).AlignCenter().Text("QTY").Bold();
                    header.Cell().Element(CellStyle).Text("Description").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Unit Price").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Amount").Bold();
                });

                // Line items
                foreach (var item in _quote.LineItems)
                {
                    table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString("N2"));
                    table.Cell().Element(CellStyle).Text(item.Description);
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.UnitPrice));
                    table.Cell().Element(CellStyle).AlignRight().Text(text =>
                    {
                        text.Span(FormatCurrency(item.Amount));
                        if (item.HasTax1) text.Span("*").Superscript();
                        if (item.HasTax2) text.Span("†").Superscript();
                    });
                }
            });

            // Totals section
            column.Item().PaddingTop(20).AlignRight().Width(300).Column(totals =>
            {
                // Subtotal
                totals.Item().BorderTop(1).BorderColor(Colors.Grey.Lighten2).PaddingTop(5)
                    .Row(r =>
                    {
                        r.RelativeItem().Text("Subtotal");
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Subtotal));
                    });

                // Discount
                if (_quote.DiscountAmount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text($"Discount ({_quote.DiscountPercentage:N2}%)");
                        r.ConstantItem(80).AlignRight().Text($"-{FormatCurrency(_quote.DiscountAmount)}");
                    });
                }

                // Tax 1
                if (_quote.Tax1Amount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text(text =>
                        {
                            text.Span("*").Superscript();
                            text.Span($"{_quote.Tax1Name} ({_quote.Tax1Rate:N2}%)");
                        });
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Tax1Amount));
                    });
                }

                // Tax 2
                if (_quote.Tax2Amount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text(text =>
                        {
                            text.Span("†").Superscript();
                            text.Span($"{_quote.Tax2Name} ({_quote.Tax2Rate:N2}%)");
                        });
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Tax2Amount));
                    });
                }

                // Total
                totals.Item().PaddingTop(10).BorderTop(2).BorderColor(_primaryColor)
                    .PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text($"Total ({_quote.Currency})").Bold().FontSize(12);
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Total))
                            .Bold().FontSize(12);
                    });
            });

            // Notes section
            if (!string.IsNullOrEmpty(_quote.Notes))
            {
                column.Item().PaddingTop(30).Column(notes =>
                {
                    notes.Item().Text("Terms and Conditions").Bold().FontSize(12);
                    notes.Item().PaddingTop(10).BorderLeft(3).BorderColor(_primaryColor)
                        .PaddingLeft(10).Text(_quote.Notes).LineHeight(1.3f);
                });
            }

            // Signatures
            if (_quote.ShowCompanySignature || _quote.ShowCustomerSignature)
            {
                column.Item().PaddingTop(40).Row(signatures =>
                {
                    if (_quote.ShowCompanySignature)
                    {
                        signatures.RelativeItem().Column(companySign =>
                        {
                            companySign.Item().Height(40); // Space for signature
                            companySign.Item().BorderTop(1).BorderColor(Colors.Grey.Medium);
                            companySign.Item().PaddingTop(5).Text(_quote.CompanySignatureText)
                                .FontSize(9).FontColor(Colors.Grey.Darken2);
                        });
                    }

                    if (_quote.ShowCustomerSignature)
                    {
                        signatures.RelativeItem().Column(customerSign =>
                        {
                            customerSign.Item().Height(40); // Space for signature
                            customerSign.Item().BorderTop(1).BorderColor(Colors.Grey.Medium);
                            customerSign.Item().PaddingTop(5).Text(_quote.CustomerSignatureText)
                                .FontSize(9).FontColor(Colors.Grey.Darken2);
                        });
                    }
                });
            }
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Row(row =>
        {
            var footerItems = new List<string>();

            if (!string.IsNullOrEmpty(_quote.Company.Phone))
                footerItems.Add($"📞 {_quote.Company.Phone}");

            if (!string.IsNullOrEmpty(_quote.Company.Email))
                footerItems.Add($"✉ {_quote.Company.Email}");

            if (!string.IsNullOrEmpty(_quote.Company.Website))
                footerItems.Add($"🌐 {_quote.Company.Website}");

            if (footerItems.Any())
            {
                row.RelativeItem().AlignCenter().Text(string.Join(" • ", footerItems))
                    .FontSize(8).FontColor(Colors.Grey.Darken1);
            }
        });
    }

    private IContainer CellStyle(IContainer container)
    {
        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(8);
    }

    private string FormatCurrency(decimal amount)
    {
        return _quote.Currency switch
        {
            "EUR" => $"€ {amount:N2}",
            "USD" => $"$ {amount:N2}",
            "GBP" => $"£ {amount:N2}",
            _ => $"{amount:N2} {_quote.Currency}"
        };
    }
}

public class QuotePdfService
{
    public byte[] GenerateQuotePdf(QuoteData quoteData)
    {
        // Ensure QuestPDF license is set
        QuestPDF.Settings.License = LicenseType.Community;

        var generator = new QuotePdfGenerator(quoteData);
        return generator.GeneratePdf();
    }

    // Helper method to create sample data for testing
    public QuoteData CreateSampleQuote()
    {
        return new QuoteData
        {
            QuoteNumber = "0001001",
            QuoteDate = DateTime.Now,
            DueDate = DateTime.Now.AddDays(14),
            Currency = "EUR",
            Company = new CompanyInfo
            {
                Name = "Your Company Inc.",
                Address = "Zmaja od Bosne 14,\nZenica 72000, BiH",
                Phone = "+387 62409924",
                Email = "office@inatdigital.com",
                Website = "www.yourcompany.com"
            },
            Customer = new CustomerInfo
            {
                Name = "Customer Name",
                Address = "Hamida 25,\nZenica 72000, BiH",
                Phone = "+387 123 456 789",
                Email = "customer@email.com"
            },
            LineItems = new List<QuoteLineItem>
            {
                new QuoteLineItem
                {
                    Quantity = 1.00m,
                    Description = "This is the best description for line item",
                    UnitPrice = 325.00m,
                    HasTax1 = true,
                    HasTax2 = false
                },
                new QuoteLineItem
                {
                    Quantity = 2.00m,
                    Description = "Second best line item",
                    UnitPrice = 150.00m,
                    HasTax1 = false,
                    HasTax2 = true
                },
                new QuoteLineItem
                {
                    Quantity = 1.00m,
                    Description = "And third best line items is",
                    UnitPrice = 100.00m,
                    HasTax1 = false,
                    HasTax2 = false
                }
            },
            Subtotal = 725.00m,
            DiscountPercentage = 5.00m,
            DiscountAmount = 36.25m,
            Tax1Amount = 15.44m,
            Tax2Amount = 23.51m,
            Total = 727.70m,
            Notes = "Best project we must finish before yesterday",
            ShowCompanySignature = true,
            ShowCustomerSignature = true
        };
    }
}