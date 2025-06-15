using System.Linq.Expressions;
using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using Mapster;
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

    public async Task<List<Invoice>> GetAllInvoices()
    {
        return await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .ToListAsync();
    }

    public async Task<Invoice?> GetInvoiceById(Guid id)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice ?? throw new KeyNotFoundException($"Invoice with ID {id} not found.");
    }

    public async Task<Invoice> GetInvoiceByInvoiceNumber(Guid workspaceId, string invoiceNumber)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .Where(i => i.InvoiceNumber == invoiceNumber && i.WorkspaceId == workspaceId)
            .Include(i => i.Customer)
            .ThenInclude(c => c.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c.CustomerPhones)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .FirstOrDefaultAsync();

        return invoice ?? throw new KeyNotFoundException($"Invoice with number {invoiceNumber} not found in workspace {workspaceId}");
    }

    public async Task<List<Invoice>> GetInvoicesByWorkspaceId(Guid workspaceId)
    {
        return await _context.Invoices
            .AsNoTracking()
            .Where(i => i.WorkspaceId == workspaceId)
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .ToListAsync();
    }

    public async Task<ApiResponse<List<Invoice>>> GetInvoicesByFilter(InvoiceFilterDto filterDto, Guid workspaceId)
    {
        if (workspaceId == Guid.Empty)
        {
            return new ApiResponse<List<Invoice>>
            {
                Success = false,
                ErrorMessage = "Workspace ID is required for filtering invoices.",
                Payload = null
            };
        }

        var queryable = _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId)
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .AsQueryable();

        // Workspace filter (mandatory)
        queryable = queryable.Where(i => i.WorkspaceId == workspaceId);

        // Status filter (InvoiceStatus enum)
        if (Enum.TryParse<InvoiceStatus>(filterDto.Status, true, out var parsedStatus))
        {
            queryable = queryable.Where(i => i.Status == parsedStatus);
        }

        // Due Date range filter
        if (filterDto.DueDateMin.HasValue)
            queryable = queryable.Where(i => i.DueDate >= filterDto.DueDateMin.Value.Date);

        if (filterDto.DueDateMax.HasValue)
            queryable = queryable.Where(i => i.DueDate <= filterDto.DueDateMax.Value.Date.AddDays(1).AddTicks(-1));

        // Search query (InvoiceNumber or Customer name)
        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.Trim().ToLower();
            queryable = queryable.Where(i =>
                i.InvoiceNumber.ToLower().Contains(q) ||
                (i.Customer != null &&
                    (i.Customer.FirstName.ToLower().Contains(q) ||
                     i.Customer.LastName.ToLower().Contains(q) ||
                     (i.Customer.FullName != null && i.Customer.FullName.ToLower().Contains(q)))
                ));
        }

        // Materialize list to apply total-based filters (in-memory)
        var resultList = await queryable.ToListAsync();

        // Apply Total filtering in-memory
        resultList = resultList.Where(i =>
        {
            var subtotal = i.LineItems.Sum(li => (li.ServiceItem?.UnitPrice ?? li.UnitPrice) * li.Quantity);
            var discount = i.DiscountType == DiscountType.Percentage ? subtotal * i.Discount / 100 : i.Discount;
            var total = subtotal - discount + ((subtotal - discount) * i.TaxRate);

            return (!filterDto.TotalMin.HasValue || total >= filterDto.TotalMin.Value)
                && (!filterDto.TotalMax.HasValue || total <= filterDto.TotalMax.Value);
        }).ToList();

        // Sorting (in-memory because total can't be sorted in SQL)
        resultList = filterDto.SortBy?.ToLower() switch
        {
            "invoice-number" => filterDto.Sort == "desc"
                ? resultList.OrderByDescending(i => i.InvoiceNumber).ToList()
                : resultList.OrderBy(i => i.InvoiceNumber).ToList(),

            "customer" => filterDto.Sort == "desc"
                ? resultList.OrderByDescending(i => i.Customer?.FullName ?? "").ToList()
                : resultList.OrderBy(i => i.Customer?.FullName ?? "").ToList(),

            "due-date" => filterDto.Sort == "desc"
                ? resultList.OrderByDescending(i => i.DueDate).ToList()
                : resultList.OrderBy(i => i.DueDate).ToList(),

            "total" => filterDto.Sort == "desc"
                ? resultList.OrderByDescending(i =>
                {
                    var subtotal = i.LineItems.Sum(li => (li.ServiceItem?.UnitPrice ?? li.UnitPrice) * li.Quantity);
                    var discount = i.DiscountType == DiscountType.Percentage ? subtotal * i.Discount / 100 : i.Discount;
                    return subtotal - discount + ((subtotal - discount) * i.TaxRate);
                }).ToList()
                : resultList.OrderBy(i =>
                {
                    var subtotal = i.LineItems.Sum(li => (li.ServiceItem?.UnitPrice ?? li.UnitPrice) * li.Quantity);
                    var discount = i.DiscountType == DiscountType.Percentage ? subtotal * i.Discount / 100 : i.Discount;
                    return subtotal - discount + ((subtotal - discount) * i.TaxRate);
                }).ToList(),

            _ => resultList.OrderByDescending(i => i.IssueDate).ToList() // default: recent first
        };

        return new ApiResponse<List<Invoice>>
        {
            Success = true,
            Payload = resultList
        };
    }

    public async Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId)
    {
        var invoices = await _context.Invoices
            .Where(i => i.CustomerId == customerId)
            .AsNoTracking()
            .Include(i => i.Customer)
            .ThenInclude(c => c.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c.CustomerPhones)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .ToListAsync();

        return new ApiResponse<List<Invoice>>
        {
            Success = true,
            ErrorMessage = null,
            Payload = invoices
        };
    }

    public async Task<Invoice> CreateInvoice(CreateInvoiceDto createInvoiceDto)
    {
        var invoice = createInvoiceDto.Adapt<Invoice>();
        invoice.InvoiceNumber = await GenerateInvoiceNumber(createInvoiceDto.WorkspaceId);
        invoice.DueDate = CalculateDueDate(invoice.IssueDate, invoice.PaymentTerms, createInvoiceDto.DueDate);

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return invoice;
    }

    public async Task<Invoice> UpdateInvoice(Guid invoiceId, UpdateInvoiceDto updatedInvoiceDto)
    {
        var invoice = await _context.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (updatedInvoiceDto.TaxRate.HasValue) invoice.TaxRate = updatedInvoiceDto.TaxRate.Value;
        if (updatedInvoiceDto.Discount.HasValue) invoice.Discount = updatedInvoiceDto.Discount.Value;
        if (updatedInvoiceDto.DiscountType.HasValue) invoice.DiscountType = updatedInvoiceDto.DiscountType.Value;
        if (updatedInvoiceDto.IssueDate.HasValue) invoice.IssueDate = updatedInvoiceDto.IssueDate.Value;
        if (updatedInvoiceDto.Notes != null) invoice.Notes = updatedInvoiceDto.Notes;
        if (updatedInvoiceDto.InternalNotes != null) invoice.InternalNotes = updatedInvoiceDto.InternalNotes;
        if (updatedInvoiceDto.Status.HasValue) invoice.Status = updatedInvoiceDto.Status.Value;
        if (updatedInvoiceDto.IsPaid.HasValue) invoice.IsPaid = updatedInvoiceDto.IsPaid.Value;

        if (updatedInvoiceDto.PaymentTerms != null || updatedInvoiceDto.IssueDate.HasValue || updatedInvoiceDto.DueDate.HasValue)
        {
            invoice.PaymentTerms = updatedInvoiceDto.PaymentTerms ?? invoice.PaymentTerms;
            invoice.DueDate = CalculateDueDate(
                updatedInvoiceDto.IssueDate ?? invoice.IssueDate,
                invoice.PaymentTerms,
                updatedInvoiceDto.DueDate
            );
        }

        if (updatedInvoiceDto.LineItems != null)
        {
            var itemsToRemove = invoice.LineItems
                .Where(existingItem => !updatedInvoiceDto.LineItems.Any(dtoItem => dtoItem.Id == existingItem.Id && dtoItem.Id.HasValue))
                .ToList();
            _context.LineItems.RemoveRange(itemsToRemove);

            foreach (var itemDto in updatedInvoiceDto.LineItems)
            {
                if (itemDto.Id.HasValue)
                {
                    var existing = invoice.LineItems.FirstOrDefault(i => i.Id == itemDto.Id.Value);
                    if (existing != null)
                    {
                        if (itemDto.Name != null) existing.Name = itemDto.Name;
                        if (itemDto.UnitPrice.HasValue) existing.UnitPrice = itemDto.UnitPrice.Value;
                        if (itemDto.Description != null) existing.Description = itemDto.Description;
                        if (itemDto.Quantity.HasValue) existing.Quantity = itemDto.Quantity.Value;
                    }
                }
                else
                {
                    invoice.LineItems.Add(new LineItem
                    {
                        Id = Guid.NewGuid(),
                        Name = itemDto.Name ?? "",
                        UnitPrice = itemDto.UnitPrice ?? 0,
                        Description = itemDto.Description,
                        Quantity = itemDto.Quantity ?? 1,
                        InvoiceId = invoice.Id
                    });
                }
            }
        }

        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return invoice;
    }

    public async Task DeleteInvoice(Guid id)
    {
        var invoiceToDelete = await _context.Invoices.FindAsync(id);

        _context.Invoices.Remove(invoiceToDelete);
        await _context.SaveChangesAsync();
    }

    public byte[] GenerateDocument(Invoice invoice)
    {
        QuestPDF.Settings.License = LicenseType.Community;

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

                        foreach (var item in invoice.LineItems)
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

    private DateTime CalculateDueDate(DateTime issueDate, string paymentTerms, DateTime? dueDate)
    {
        if (paymentTerms.Equals("custom", StringComparison.OrdinalIgnoreCase) && dueDate.HasValue)
        {
            return dueDate.Value;
        }

        return paymentTerms.ToLower() switch
        {
            "uponreceipt" => issueDate,
            "net15" => issueDate.AddDays(15),
            "net30" => issueDate.AddDays(30),
            _ => issueDate
        };
    }

    private async Task<string> GenerateInvoiceNumber(Guid workspaceId)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = "FSH-";
        var datePart = today.ToString("yyMMdd");

        var lastInvoice = await _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId && i.InvoiceNumber.StartsWith(prefix + datePart))
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

        return $"{prefix}{datePart}-{sequence:D4}";
    }
}