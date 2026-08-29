
using System.Net;
using System.Net.Sockets;
using backend.Data;
using backend.Models.QuoteModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
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

public class QuotePdfService(DataContext context, IMemoryCache cache)
{
    private readonly DataContext _context = context;
    private readonly IMemoryCache _cache = cache;

    // A workspace-controlled LogoUrl fetched with no scheme allow-list, no
    // private-IP block, no timeout, and no size cap is a straight line to SSRF -
    // pointing it at 169.254.169.254 (or any RFC1918 address) makes this server
    // fetch cloud metadata or reach internal-only services on the caller's behalf.
    private const long MaxLogoBytes = 2 * 1024 * 1024;
    private static readonly TimeSpan FetchTimeout = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(30);

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
        if (!Uri.TryCreate(logoUrl, UriKind.Absolute, out var uri)
            || !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var cacheKey = $"quote-logo:{uri.AbsoluteUri}";
        if (_cache.TryGetValue(cacheKey, out byte[]? cached))
        {
            return cached;
        }

        IPAddress[] resolvedAddresses;
        try
        {
            resolvedAddresses = await Dns.GetHostAddressesAsync(uri.Host);
        }
        catch
        {
            return null;
        }

        if (resolvedAddresses.Length == 0 || Array.Exists(resolvedAddresses, IsDisallowedAddress))
        {
            return null;
        }

        // Pin the connection to the address we just validated instead of letting the
        // OS resolve the hostname again for the actual connect - otherwise a
        // DNS-rebinding attacker could pass validation with a public IP and then
        // redirect the real connection to an internal one.
        using var handler = new SocketsHttpHandler
        {
            ConnectTimeout = FetchTimeout,
            ConnectCallback = async (context, cancellationToken) =>
            {
                var socket = new Socket(SocketType.Stream, ProtocolType.Tcp);
                try
                {
                    await socket.ConnectAsync(resolvedAddresses[0], context.DnsEndPoint.Port, cancellationToken);
                    return new NetworkStream(socket, ownsSocket: true);
                }
                catch
                {
                    socket.Dispose();
                    throw;
                }
            }
        };
        using var httpClient = new HttpClient(handler) { Timeout = FetchTimeout };

        try
        {
            using var response = await httpClient.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode || response.Content.Headers.ContentLength > MaxLogoBytes)
            {
                return null;
            }

            await using var responseStream = await response.Content.ReadAsStreamAsync();
            using var buffer = new MemoryStream();
            var chunk = new byte[8192];
            int read;
            while ((read = await responseStream.ReadAsync(chunk)) > 0)
            {
                if (buffer.Length + read > MaxLogoBytes)
                {
                    return null;
                }
                await buffer.WriteAsync(chunk.AsMemory(0, read));
            }

            var bytes = buffer.ToArray();
            _cache.Set(cacheKey, bytes, CacheDuration);
            return bytes;
        }
        catch
        {
            return null;
        }
    }

    private static bool IsDisallowedAddress(IPAddress address)
    {
        if (address.IsIPv4MappedToIPv6)
        {
            address = address.MapToIPv4();
        }

        if (IPAddress.IsLoopback(address) || address.IsIPv6LinkLocal || address.IsIPv6SiteLocal
            || address.IsIPv6Multicast || address.IsIPv6UniqueLocal)
        {
            return true;
        }

        if (address.AddressFamily != AddressFamily.InterNetwork)
        {
            // Anything else exotic (unmapped IPv6, etc.) - fail closed rather than
            // risk missing an internal-only range.
            return true;
        }

        var b = address.GetAddressBytes();
        return b[0] == 0                                   // 0.0.0.0/8
            || b[0] == 10                                   // 10.0.0.0/8
            || b[0] == 127                                  // 127.0.0.0/8
            || (b[0] == 169 && b[1] == 254)                 // 169.254.0.0/16 - covers the cloud metadata IP
            || (b[0] == 172 && b[1] >= 16 && b[1] <= 31)     // 172.16.0.0/12
            || (b[0] == 192 && b[1] == 168)                 // 192.168.0.0/16
            || b[0] >= 224;                                 // multicast/reserved (224.0.0.0+)
    }
}