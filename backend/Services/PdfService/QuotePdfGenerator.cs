
using backend.Data;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.PdfService;

public class QuotePdfGenerator
{
    private readonly Quote _quote;
    private readonly string _primaryColor = "#343a40";
    private byte[]? Logo { get; set; }

    public QuotePdfGenerator(Quote quote, byte[]? logo = null)
    {
        _quote = quote;
        Logo = logo;
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
                // page.Footer().Element(ComposeFooter);
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            // First: Company Name and Logo
            column.Item().Row(row =>
            {
                // Company Name
                row.RelativeItem().AlignLeft().Height(60).AlignMiddle().Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(18).SemiBold().FontColor(Colors.Black));
                    text.Line(_quote.CreatedByUser.Workspace?.Name ?? "Company Name");
                });

                // Company Logo (if available)
                if (Logo != null && Logo.Length > 0)
                {
                    row.ConstantItem(120).AlignRight().Height(60).AlignTop().Image(Logo, ImageScaling.FitArea);
                }
            });

            // Then: Quote Info Block
            column.Item().Row(row =>
            {
                row.RelativeItem(2).Column(col =>
                {
                    // Empty block or left-side space
                });

                row.RelativeItem(1).Column(info =>
                {
                    info.Item().PaddingTop(20).Column(inner =>
                    {
                        // Quote Number
                        inner.Item().Row(r =>
                        {
                            r.RelativeItem().AlignRight().Text("Quote #").Bold();
                            r.ConstantItem(80).AlignRight().Text(_quote.QuoteNumber ?? "N/A");
                        });

                        // Issue Date
                        inner.Item().PaddingTop(5).Row(r =>
                        {
                            r.RelativeItem().AlignRight().Text("Issue Date").Bold();
                            r.ConstantItem(80).AlignRight().Text(_quote.CreatedAt.ToString("dd-MM-yyyy"));
                        });

                        // Due Date
                        inner.Item().PaddingTop(5).Row(r =>
                        {
                            r.RelativeItem().AlignRight().Text("Due Date").Bold();
                            r.ConstantItem(80).AlignRight().Text(_quote.CreatedAt.ToString("dd-MM-yyyy"));
                        });
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
                            customerInfo.Item().PaddingBottom(5).Text(_quote.Customer?.FullName ?? "N/A")
                                .FontSize(12).SemiBold().FontColor(Colors.Black);

                            var firstPropertyAddress = _quote.Customer?.Properties?.FirstOrDefault()?.Address;
                            if (!string.IsNullOrEmpty(firstPropertyAddress))
                            {
                                customerInfo.Item().Text(firstPropertyAddress).LineHeight(1.2f);
                            }

                            var firstCustomerPhone = _quote.Customer?.CustomerPhones?.FirstOrDefault()?.PhoneNumber;
                            if (!string.IsNullOrEmpty(firstCustomerPhone))
                            {
                                customerInfo.Item().Text($"{firstCustomerPhone}");
                            }

                            var firstCustomerEmail = _quote.Customer?.Emails?.FirstOrDefault();
                            if (!string.IsNullOrEmpty(firstCustomerEmail))
                            {
                                customerInfo.Item().Text($"{firstCustomerEmail}");
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
                    columns.RelativeColumn(3);   // Item Name/Description
                    columns.ConstantColumn(60);  // QTY
                    columns.ConstantColumn(80);  // Unit Price
                    columns.ConstantColumn(80);  // Amount
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Product/Service").Bold();
                    header.Cell().Element(CellStyle).AlignCenter().Text("QTY").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Unit Price").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Total").Bold();
                });

                // Line items
                foreach (var item in _quote.LineItems ?? [])
                {
                    table.Cell().Element(CellStyle).Column(column =>
                    {
                        column.Item().Text(item.Name ?? "").Bold().FontColor(Colors.Black);

                        if (!string.IsNullOrEmpty(item.Description))
                        {
                            column.Item().PaddingTop(2).Text(item.Description).FontColor(Colors.Grey.Darken2);
                        }
                    });

                    table.Cell().Element(CellStyle).AlignCenter().Text(item.Quantity.ToString("N2"));
                    table.Cell().Element(CellStyle).AlignRight().Text(FormatCurrency(item.UnitPrice));
                    table.Cell().Element(CellStyle).AlignRight().Text(text =>
                    {
                        text.Span(FormatCurrency(item.Total));
                    });
                }
            });

            // Totals section
            column.Item().PaddingTop(20).AlignRight().Width(300).Column(totals =>
            {
                totals.Item().Row(r =>
                {
                    r.RelativeItem().Text("Subtotal");
                    r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Subtotal));
                });

                if (_quote.Discount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        string discountText = _quote.DiscountType == DiscountType.Percentage
                            ? $"Discount ({_quote.DiscountValue:N2}%)"
                            : "Discount";
                        r.RelativeItem().Text(discountText);
                        r.ConstantItem(80).AlignRight().Text($"-{FormatCurrency(_quote.Discount)}");
                    });
                }

                if (_quote.TaxAmount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text($"Tax name ({_quote.TaxRate * 100:N2}%)");
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.TaxAmount));
                    });
                }

                totals.Item().PaddingTop(10).BorderTop(2).BorderColor(_primaryColor)
                    .PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text("Total").Bold().FontSize(12);
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Total))
                            .Bold().FontSize(12);
                    });
            });
        });
    }

    private IContainer CellStyle(IContainer container)
    {
        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(8);
    }

    private string FormatCurrency(decimal amount)
    {
        return $"$ {amount:N2}";
    }
}

public class QuotePdfService(DataContext context)
{
    private readonly DataContext _context = context;

    public async Task<byte[]> GenerateQuotePdf(Guid id)
    {
        var quote = await _context.Quotes.Where(q => q.Id == id)
                                        .Include(q => q.CreatedByUser)
                                            .ThenInclude(u => u.Workspace)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.CustomerPhones)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.Properties)
                                        .Include(q => q.LineItems)
                                        .FirstOrDefaultAsync();

        // Ensure QuestPDF license is set
        QuestPDF.Settings.License = LicenseType.Community;

        byte[]? logoBytes = null;
        var logoUrl = quote?.CreatedByUser?.Workspace?.LogoUrl;

        if (!string.IsNullOrWhiteSpace(logoUrl))
        {
            logoBytes = await FetchLogoAsync(logoUrl);
        }

        var generator = new QuotePdfGenerator(quote!, logoBytes);
        return generator.GeneratePdf();
    }

    private async Task<byte[]?> FetchLogoAsync(string logoUrl)
    {
        using var httpClient = new HttpClient();
        try
        {
            return await httpClient.GetByteArrayAsync(logoUrl);
        }
        catch
        {
            return null;
        }
    }

}