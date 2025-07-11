
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

    public QuotePdfGenerator(Quote quote)
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
                // Company logo (assuming LogoData is a byte[] in Workspace model)
                if (_quote.CreatedByUser.Workspace?.LogoUrl != null && _quote.CreatedByUser.Workspace?.LogoUrl.Length > 0)
                {
                    column.Item().AlignRight().Width(120).Height(60).Image(_quote.CreatedByUser.Workspace?.LogoUrl);
                }

                // Company Name
                if (!string.IsNullOrEmpty(_quote.CreatedByUser.Workspace?.Name))
                {
                    column.Item().AlignLeft().PaddingTop(10).Text(text =>
                    {
                        text.DefaultTextStyle(x => x.FontSize(12).SemiBold());
                        text.Line(_quote.CreatedByUser.Workspace?.Name);
                    });
                }

                // Company Address (assuming Address property exists in Workspace)
                // if (!string.IsNullOrEmpty(_quote.Workspace?.Address))
                // {
                //     column.Item().AlignLeft().PaddingTop(5).Text(_quote.Workspace.Address)
                //         .FontSize(9).LineHeight(1.2f);
                // }
            });

            // Quote info section
            row.RelativeItem(1).Column(column =>
            {
                column.Item().AlignRight().Text("QUOTE")
                    .FontSize(24).Bold().FontColor(_primaryColor);

                column.Item().PaddingTop(20).Column(info =>
                {
                    info.Item().Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Quote #").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.QuoteNumber ?? "N/A");
                    });

                    info.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Quote Date").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.CreatedAt.ToString("dd-MM-yyyy"));
                    });

                    // Due date (assuming DueDate property exists in Quote)
                    info.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().AlignRight().Text("Due Date").Bold();
                        r.ConstantItem(80).AlignRight().Text(_quote.CreatedAt.ToString("dd-MM-yyyy"));
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
                            customerInfo.Item().Text(_quote.Customer?.FullName ?? "N/A").Bold();

                            var firstPropertyAddress = _quote.Customer?.Properties?.FirstOrDefault()?.Address;
                            if (!string.IsNullOrEmpty(firstPropertyAddress))
                            {
                                customerInfo.Item().Text(firstPropertyAddress).LineHeight(1.2f);
                            }

                            var firstCustomerPhone = _quote.Customer?.CustomerPhones?.FirstOrDefault()?.PhoneNumber;
                            if (!string.IsNullOrEmpty(firstCustomerPhone))
                            {
                                customerInfo.Item().Text($"Phone: {firstCustomerPhone}");
                            }

                            var firstCustomerEmail = _quote.Customer?.Emails?.FirstOrDefault();
                            if (!string.IsNullOrEmpty(firstCustomerEmail))
                            {
                                customerInfo.Item().Text($"Email: {firstCustomerEmail}");
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
                    header.Cell().Element(CellStyle).Text("Name").Bold();
                    header.Cell().Element(CellStyle).AlignCenter().Text("QTY").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Unit Price").Bold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Amount").Bold();
                });

                // Line items
                foreach (var item in _quote.LineItems ?? []) // Ensure LineItems is not null
                {
                    // Item Name and Description cell
                    table.Cell().Element(CellStyle).Column(column =>
                    {
                        // Item Name - bold and darker color
                        column.Item().Text(item.Name ?? "").Bold().FontColor(Colors.Black);

                        // Description - lighter color and normal weight
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
                // Subtotal
                totals.Item()
                    .Row(r =>
                    {
                        r.RelativeItem().Text("Subtotal");
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Subtotal));
                    });

                // Discount
                if (_quote.Discount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        // Assuming DiscountType enum and DiscountValue property in your Quote model
                        string discountText = _quote.DiscountType == DiscountType.Percentage
                            ? $"Discount ({_quote.DiscountValue:N2}%)"
                            : "Discount";
                        r.RelativeItem().Text(discountText);
                        r.ConstantItem(80).AlignRight().Text($"-{FormatCurrency(_quote.Discount)}");
                    });
                }

                // Tax
                if (_quote.TaxAmount > 0)
                {
                    totals.Item().PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text(text =>
                        {
                            // Assuming TaxName and TaxRate properties in your Quote model
                            text.Span($"Tax name ({_quote.TaxRate * 100:N2}%)");
                        });
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.TaxAmount));
                    });
                }

                // Total
                totals.Item().PaddingTop(10).BorderTop(2).BorderColor(_primaryColor)
                    .PaddingTop(5).Row(r =>
                    {
                        r.RelativeItem().Text($"Total").Bold().FontSize(12);
                        r.ConstantItem(80).AlignRight().Text(FormatCurrency(_quote.Total))
                            .Bold().FontSize(12);
                    });
            });
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Row(row =>
        {
            var footerItems = new List<string>();

            // Access Workspace and CreatedByUser properties safely
            if (!string.IsNullOrEmpty(_quote.CreatedByUser?.Workspace.PhoneNumber))
                footerItems.Add($"📞 {_quote.CreatedByUser?.Workspace.PhoneNumber}");

            if (!string.IsNullOrEmpty(_quote.CreatedByUser?.Email))
                footerItems.Add($"✉ {_quote.CreatedByUser.Email}");

            if (!string.IsNullOrEmpty(_quote.CreatedByUser?.Workspace.CompanyUrl))
                footerItems.Add($"🌐 {_quote.CreatedByUser?.Workspace.CompanyUrl}");

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
                                        .Include(q => q.LineItems)
                                        .FirstOrDefaultAsync();

        // Ensure QuestPDF license is set
        QuestPDF.Settings.License = LicenseType.Community;

        var generator = new QuotePdfGenerator(quote);
        return generator.GeneratePdf();
    }
}