using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Response;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.InvoiceService;

public class InvoiceService : IInvoiceService
{
    private readonly DataContext _context;

    public InvoiceService(DataContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Invoice>> GetAllInvoices()
    {
        return await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.Items)
            .ThenInclude(item => item.ServiceItem)
            .ToListAsync();
    }

    public async Task<Invoice?> GetInvoiceById(Guid id)
    {
        return await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.Items)
            .ThenInclude(item => item.ServiceItem)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);
    }

    public async Task<Invoice?> GetInvoiceByInvoiceNumber(string invoiceNumber)
    {
        return await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .ThenInclude(c => c.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c.CustomerPhones)
            .Include(i => i.Job)
            .Include(i => i.Items)
            .ThenInclude(item => item.ServiceItem)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
    }

    public async Task<IEnumerable<Invoice>> GetInvoicesByWorkspaceId(Guid workspaceId)
    {
        return await _context.Invoices
            .AsNoTracking()
            .Where(i => i.WorkspaceId == workspaceId)
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.Items)
            .ThenInclude(item => item.ServiceItem)
            .ToListAsync();
    }

    public async Task<Invoice> CreateInvoice(CreateInvoiceDto invoiceDto)
    {
        var invoice = new Invoice
        {
            CustomerId = invoiceDto.CustomerId,
            JobId = invoiceDto.JobId,
            WorkspaceId = invoiceDto.WorkspaceId,
            InvoiceNumber = await GenerateInvoiceNumberAsync(),
            Items = invoiceDto.Items.Select(itemDto => new LineItem
            {
                ServiceItemId = itemDto.ServiceItemId,
                Name = itemDto.Name,
                UnitPrice = itemDto.UnitPrice,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity
            }).ToList(),
            TaxRate = invoiceDto.TaxRate,
            Discount = invoiceDto.Discount,
            DiscountType = invoiceDto.DiscountType,
            IssueDate = invoiceDto.IssueDate,
            PaymentTerms = invoiceDto.PaymentTerms,
            Notes = invoiceDto.Notes,
            InternalNotes = invoiceDto.InternalNotes,
            Status = "draft",
            IsPaid = false
        };

        invoice.DueDate = CalculateDueDate(invoice.IssueDate, invoice.PaymentTerms, invoiceDto.CustomDueDate);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    public async Task<Invoice?> UpdateInvoice(Guid invoiceId, UpdateInvoiceDto invoiceDto)
    {
        var existingInvoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

        if (existingInvoice == null)
        {
            return null;
        }

        if (invoiceDto.CustomerId.HasValue) existingInvoice.CustomerId = invoiceDto.CustomerId.Value;
        if (invoiceDto.JobId.HasValue) existingInvoice.JobId = invoiceDto.JobId;
        if (invoiceDto.TaxRate.HasValue) existingInvoice.TaxRate = invoiceDto.TaxRate.Value;
        if (invoiceDto.Discount.HasValue) existingInvoice.Discount = invoiceDto.Discount.Value;
        if (invoiceDto.DiscountType != null) existingInvoice.DiscountType = invoiceDto.DiscountType;
        if (invoiceDto.IssueDate.HasValue) existingInvoice.IssueDate = invoiceDto.IssueDate.Value;
        if (invoiceDto.Notes != null) existingInvoice.Notes = invoiceDto.Notes;
        if (invoiceDto.InternalNotes != null) existingInvoice.InternalNotes = invoiceDto.InternalNotes;
        if (invoiceDto.Status != null) existingInvoice.Status = invoiceDto.Status;
        if (invoiceDto.IsPaid.HasValue) existingInvoice.IsPaid = invoiceDto.IsPaid.Value;

        if (invoiceDto.PaymentTerms != null || invoiceDto.IssueDate.HasValue || invoiceDto.CustomDueDate.HasValue)
        {
            existingInvoice.PaymentTerms = invoiceDto.PaymentTerms ?? existingInvoice.PaymentTerms;
            existingInvoice.DueDate = CalculateDueDate(
                invoiceDto.IssueDate ?? existingInvoice.IssueDate,
                existingInvoice.PaymentTerms,
                invoiceDto.CustomDueDate
            );
        }

        if (invoiceDto.Items != null)
        {
            // Identify items to remove (existing items not present in the DTO's items with an ID)
            var itemsToRemove = existingInvoice.Items
                .Where(existingItem => !invoiceDto.Items.Any(dtoItem => dtoItem.LineItemId == existingItem.LineItemId && dtoItem.LineItemId.HasValue))
                .ToList();
            _context.LineItems.RemoveRange(itemsToRemove);

            foreach (var itemDto in invoiceDto.Items)
            {
                if (itemDto.LineItemId.HasValue)
                {
                    var existingItem = existingInvoice.Items.FirstOrDefault(i => i.LineItemId == itemDto.LineItemId);
                    if (existingItem != null)
                    {
                        if (itemDto.ServiceItemId.HasValue) existingItem.ServiceItemId = itemDto.ServiceItemId;
                        if (itemDto.Name != null) existingItem.Name = itemDto.Name;
                        if (itemDto.UnitPrice.HasValue) existingItem.UnitPrice = itemDto.UnitPrice;
                        if (itemDto.Description != null) existingItem.Description = itemDto.Description;
                        if (itemDto.Quantity.HasValue) existingItem.Quantity = itemDto.Quantity.Value;
                    }
                }
                else
                {
                    existingInvoice.Items.Add(new LineItem
                    {
                        LineItemId = Guid.NewGuid(),
                        ServiceItemId = itemDto.ServiceItemId,
                        Name = itemDto.Name,
                        UnitPrice = itemDto.UnitPrice,
                        Description = itemDto.Description,
                        Quantity = itemDto.Quantity ?? 1,
                        InvoiceId = existingInvoice.InvoiceId
                    });
                }
            }
        }

        await _context.SaveChangesAsync();
        return existingInvoice;
    }

    public async Task<bool> DeleteInvoice(Guid id)
    {
        var invoiceToDelete = await _context.Invoices.FindAsync(id);
        if (invoiceToDelete == null)
        {
            return false;
        }

        _context.Invoices.Remove(invoiceToDelete);
        await _context.SaveChangesAsync();
        return true;
    }

    private DateTime CalculateDueDate(DateTime issueDate, string paymentTerms, DateTime? customDueDate)
    {
        if (paymentTerms.Equals("custom", StringComparison.OrdinalIgnoreCase) && customDueDate.HasValue)
        {
            return customDueDate.Value;
        }

        return paymentTerms.ToLower() switch
        {
            "uponreceipt" => issueDate,
            "net15" => issueDate.AddDays(15),
            "net30" => issueDate.AddDays(30),
            _ => issueDate
        };
    }

    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var today = DateTime.UtcNow.Date;
        var prefix = "FSH-";
        var datePart = today.ToString("yyMMdd");

        var lastInvoice = await _context.Invoices
            .Where(i => i.InvoiceNumber.StartsWith(prefix + datePart))
            .OrderByDescending(i => i.InvoiceNumber)
            .Select(i => i.InvoiceNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastInvoice != null)
        {
            var parts = lastInvoice.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastSequence))
            {
                sequence = lastSequence + 1;
            }
        }

        return $"{prefix}{datePart}-{sequence:D3}";
    }

    public byte[] GenerateDocument(Invoice invoice)
    {
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Size(PageSizes.A4);

                page.Header().Text("INVOICE").FontSize(24).Bold().AlignCenter();

                page.Content().Column(col =>
                {
                    col.Spacing(20);

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Invoice #: {invoice.InvoiceNumber}");
                            // c.Item().Text($"Service Date: {invoice.ServiceDate:MMMM dd, yyyy}");
                            c.Item().Text($"Payment Terms: {invoice.PaymentTerms}");
                            c.Item().Text($"Due Date: {invoice.DueDate:MMMM dd, yyyy}");
                        });

                        row.ConstantItem(200).Column(c =>
                        {
                            c.Item().Text("Inat Digital").Bold();
                            c.Item().Text("Muhamed Sarajlic");
                            c.Item().Text("(387) 624-0991");
                            c.Item().Text("lordmest.lm@gmail.com");
                        });
                    });

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(4);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Services").Bold();
                            header.Cell().Text("Qty").Bold();
                            header.Cell().Text("Unit Price").Bold();
                            header.Cell().Text("Amount").Bold();
                        });

                        foreach (var item in invoice.Items)
                        {
                            table.Cell().Text(item.Name);
                            table.Cell().Text($"{item.Quantity}");
                            table.Cell().Text($"${item.UnitPrice:0.00}");
                            table.Cell().Text($"${item.TotalPrice:0.00}");
                        }
                    });

                    col.Item().AlignRight().Column(totals =>
                    {
                        totals.Item().Text($"Subtotal: ${invoice.Subtotal:0.00}");
                        totals.Item().Text($"Tax: ${invoice.TaxRate:0.00}");
                        totals.Item().Text($"Total: ${invoice.Total:0.00}").Bold();
                    });

                    col.Item().Text("See our Terms & Conditions").Italic().FontSize(10);
                    // col.Item().Text(invoice.TermsUrl).FontSize(10).Underline().Color(Colors.Blue.Medium);
                });

                page.Footer().AlignCenter().Text("Inat Digital 1 of 1").FontSize(10);
            });
        });

        return pdf.GeneratePdf();
    }

    public async Task<ApiResponse<List<Invoice>>> GetInvoicesByFilter(Guid? workspaceId, string? status, DateTime? dueDateMin, DateTime? dueDateMax, decimal? totalMin, decimal? totalMax, string? sortBy, string? sort)
    {
        var queryable = _context.Invoices
        .Include(i => i.Customer)
        .Include(i => i.Items)
            .ThenInclude(item => item.ServiceItem)
        .AsQueryable();

        if (workspaceId.HasValue && workspaceId != Guid.Empty)
        {
            queryable = queryable.Where(i => i.WorkspaceId == workspaceId);
        }

        if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
        {
            queryable = queryable.Where(i => i.Status.ToLower() == status.ToLower());
        }

        if (dueDateMin.HasValue)
        {
            queryable = queryable.Where(i => i.DueDate >= dueDateMin.Value);
        }

        if (dueDateMax.HasValue)
        {
            queryable = queryable.Where(i => i.DueDate <= dueDateMax.Value);
        }

        if (totalMin.HasValue)
        {
            queryable = queryable.Where(i =>
                i.Items.Sum(x => (x.ServiceItem != null ? x.ServiceItem.UnitPrice : x.UnitPrice) * x.Quantity) +
                (i.Items.Sum(x => (x.ServiceItem != null ? x.ServiceItem.UnitPrice : x.UnitPrice) * x.Quantity) * i.TaxRate) -
                i.Discount >= totalMin.Value);
        }

        if (totalMax.HasValue)
        {
            queryable = queryable.Where(i =>
                i.Items.Sum(x => (x.ServiceItem != null ? x.ServiceItem.UnitPrice : x.UnitPrice) * x.Quantity) +
                (i.Items.Sum(x => (x.ServiceItem != null ? x.ServiceItem.UnitPrice : x.UnitPrice) * x.Quantity) * i.TaxRate) -
                i.Discount <= totalMax.Value);
        }

        queryable = sortBy?.ToLower() switch
        {
            "invoice-number" => sort == "desc"
                ? queryable.OrderByDescending(i => i.InvoiceNumber)
                : queryable.OrderBy(i => i.InvoiceNumber),

            "customer" => sort == "desc"
                ? queryable.OrderByDescending(i => i.Customer.FullName)
                : queryable.OrderBy(i => i.Customer.FullName),

            "due-date" => sort == "desc"
                ? queryable.OrderByDescending(i => i.DueDate)
                : queryable.OrderBy(i => i.DueDate),

            "total" => sort == "desc"
                ? queryable.OrderByDescending(i => i.Total)
                : queryable.OrderBy(i => i.Total),

            _ => queryable.OrderBy(i => i.IssueDate)
        };

        var invoices = await queryable.ToListAsync();

        return new ApiResponse<List<Invoice>>
        {
            Success = true,
            Payload = invoices
        };
    }
}