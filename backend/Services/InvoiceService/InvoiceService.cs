using System.Linq.Expressions;
using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.Billing;
using backend.Wrappers;
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

    public async Task<Invoice?> GetInvoiceById(Guid id, Guid callerWorkspaceId)
    {
        var invoice = await _context.Invoices
            .Where(i => i.Id == id)
            .Include(i => i.Customer)
                .ThenInclude(c => c.CustomerPhones)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
                .ThenInclude(item => item.ServiceItem)
            .Include(i => i.Payments)
            .Include(i => i.Property)
            .FirstOrDefaultAsync();

        // Same exception whether it doesn't exist or belongs to another tenant, so
        // this can't be used to probe for other workspaces' invoice ids.
        if (invoice == null || invoice.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found.");
        }

        return invoice;
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
            .Include(i => i.Payments)
            .FirstOrDefaultAsync();

        return invoice ?? throw new KeyNotFoundException($"Invoice with number {invoiceNumber} not found in workspace {workspaceId}");
    }

    public async Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByWorkspaceId(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId)
            .Include(i => i.Customer)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
                .ThenInclude(item => item.ServiceItem)
            .Include(i => i.Payments)
            .AsNoTracking();

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ApiResponse<PagedResult<Invoice>>
        {
            Success = true,
            Payload = new PagedResult<Invoice>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<ApiResponse<PagedResult<Invoice>>> GetInvoicesByFilter(
       InvoiceFilterDto filterDto,
       Guid workspaceId,
       int pageNumber,
       int pageSize
    )
    {
        if (workspaceId == Guid.Empty)
        {
            return new ApiResponse<PagedResult<Invoice>>
            {
                Success = false,
                ErrorMessage = "Workspace ID is required for filtering invoices.",
                Payload = null
            };
        }

        var query = _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId)
            .Include(i => i.Customer)
            .Include(i => i.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .Include(i => i.Payments)
            .AsNoTracking()
            .AsQueryable();

        if (filterDto.DueDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(filterDto.DueDateMin.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DueDate >= minUtc);
        }

        if (filterDto.DueDateMax.HasValue)
        {
            var endOfDay = filterDto.DueDateMax.Value.Date.AddDays(1).AddTicks(-1);
            var maxUtc = DateTime.SpecifyKind(endOfDay, DateTimeKind.Utc);
            query = query.Where(i => i.DueDate <= maxUtc);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(q) ||
                (i.Customer.FirstName.ToLower().Contains(q) || i.Customer.LastName.ToLower().Contains(q)));
        }

        var resultList = await query.ToListAsync();

        var hasStatusFilter = Enum.TryParse<InvoiceStatus>(filterDto.Status, true, out var parsedStatus);

        resultList = resultList.Where(i =>
        {
            var total = TotalsCalculator.Calculate(i.LineItems, i.DiscountType, i.Discount, i.TaxRate).Total;

            return (!hasStatusFilter || i.Status == parsedStatus)
                && (!filterDto.TotalMin.HasValue || total >= filterDto.TotalMin.Value)
                && (!filterDto.TotalMax.HasValue || total <= filterDto.TotalMax.Value);
        }).ToList();

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
                ? resultList.OrderByDescending(i => i.Total).ToList()
                : resultList.OrderBy(i => i.Total).ToList(),

            _ => resultList.OrderByDescending(i => i.IssueDate).ToList()
        };

        var totalCount = resultList.Count;
        var paged = resultList
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new ApiResponse<PagedResult<Invoice>>
        {
            Success = true,
            Payload = new PagedResult<Invoice>
            {
                Items = paged,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }


    public async Task<ApiResponse<List<Invoice>>> GetInvoicesByCustomerId(Guid customerId, Guid callerWorkspaceId)
    {
        var invoices = await _context.Invoices
            .Where(i => i.CustomerId == customerId && i.WorkspaceId == callerWorkspaceId)
            .AsNoTracking()
            .Include(i => i.Customer)
            .ThenInclude(c => c.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c.CustomerPhones)
            .Include(i => i.Job)
            .Include(i => i.LineItems)
            .ThenInclude(item => item.ServiceItem)
            .Include(i => i.Payments)
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

        var customer = await _context.Customers.FindAsync(createInvoiceDto.CustomerId);
        customer.LastActivity = DateTime.UtcNow;

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync();

        return invoice;
    }

    //TODO: Later refactor and make update like on customer to use other repositories to update child elements
    public async Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto, Guid callerWorkspaceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == updatedInvoiceDto.Id);

        if (invoice == null || invoice.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {updatedInvoiceDto.Id} not found.");
        }

        if (updatedInvoiceDto.TaxRate.HasValue) invoice.TaxRate = updatedInvoiceDto.TaxRate.Value;
        if (updatedInvoiceDto.Discount.HasValue) invoice.Discount = updatedInvoiceDto.Discount.Value;
        if (updatedInvoiceDto.DiscountType.HasValue) invoice.DiscountType = updatedInvoiceDto.DiscountType.Value;
        if (updatedInvoiceDto.IssueDate.HasValue) invoice.IssueDate = updatedInvoiceDto.IssueDate.Value;
        if (updatedInvoiceDto.Notes != null) invoice.Notes = updatedInvoiceDto.Notes;
        if (updatedInvoiceDto.InternalNotes != null) invoice.InternalNotes = updatedInvoiceDto.InternalNotes;
        if (updatedInvoiceDto.Status.HasValue)
        {
            invoice.WorkflowStatus = PaymentLedgerCalculator.NormalizeWorkflowStatus(updatedInvoiceDto.Status.Value);
        }

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
            if (updatedInvoiceDto.LineItems.Count == 0)
            {
                _context.LineItems.RemoveRange(invoice.LineItems);
                invoice.LineItems.Clear();
            }
            else
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
                            existing.Name = itemDto.Name ?? existing.Name;
                            if (itemDto.UnitPrice.HasValue) existing.UnitPrice = itemDto.UnitPrice.Value;
                            existing.Description = itemDto.Description ?? existing.Description;
                            if (itemDto.Quantity.HasValue) existing.Quantity = itemDto.Quantity.Value;
                            existing.UpdatedAt = DateTime.UtcNow;
                        }
                        // TODO: Handle case where itemDto.Id.Value exists but not found in current invoice.LineItems.
                        // This could happen if an item ID is sent that belongs to another invoice, or is invalid.
                        // You might want to throw an error or log it.
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
                            InvoiceId = invoice.Id,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
            }
        }

        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return invoice;
    }

    public async Task DeleteInvoice(Guid id, Guid callerWorkspaceId)
    {
        var invoiceToDelete = await _context.Invoices.FindAsync(id);

        if (invoiceToDelete == null || invoiceToDelete.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found.");
        }

        _context.Invoices.Remove(invoiceToDelete);
        await _context.SaveChangesAsync();
    }

    public byte[] GenerateDocument(Invoice invoice)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var totals = TotalsCalculator.Calculate(invoice.LineItems, invoice.DiscountType, invoice.Discount, invoice.TaxRate);
        var workspace = _context.Workspaces
            .AsNoTracking()
            .FirstOrDefault(w => w.Id == invoice.WorkspaceId);
        var senderName = GetWorkspaceDisplayName(workspace);
        var senderLines = BuildWorkspaceIdentityLines(workspace);
        var billToLines = BuildBillToLines(invoice);

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
                            c.Item().Text($"Issue Date: {invoice.IssueDate:MMMM dd, yyyy}");
                            c.Item().Text($"Payment Terms: {invoice.PaymentTerms}");
                            c.Item().Text($"Due Date: {invoice.DueDate:MMMM dd, yyyy}");
                        });

                        row.ConstantItem(200).Column(c =>
                        {
                            for (var index = 0; index < senderLines.Count; index++)
                            {
                                var line = senderLines[index];
                                if (index == 0)
                                {
                                    c.Item().Text(line).Bold();
                                }
                                else
                                {
                                    c.Item().Text(line);
                                }
                            }
                        });
                    });

                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Bill To").Bold();

                            foreach (var line in billToLines)
                            {
                                c.Item().Text(line);
                            }
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
                            table.Cell().Text($"${item.Total:0.00}");
                        }
                    });

                    col.Item().AlignRight().Column(summary =>
                    {
                        summary.Item().Text($"Subtotal: ${invoice.Subtotal:0.00}");

                        if (invoice.Discount > 0)
                        {
                            var discountLabel = invoice.DiscountType == DiscountType.Percentage
                                ? $"Discount ({invoice.Discount:0.##}%)"
                                : "Discount";
                            summary.Item().Text($"{discountLabel}: -${totals.Discount:0.00}");
                        }

                        summary.Item().Text($"Tax: ${totals.TaxAmount:0.00}");
                        summary.Item().Text($"Total: ${totals.Total:0.00}").Bold();
                    });

                    col.Item().Text("See our Terms & Conditions").Italic().FontSize(10);
                    // col.Item().Text(invoice.TermsUrl).FontSize(10).Underline().Color(Colors.Blue.Medium);
                });

                page.Footer().AlignCenter().DefaultTextStyle(x => x.FontSize(10)).Text(text =>
                {
                    text.Span(senderName);
                    text.Span(" ");
                    text.CurrentPageNumber();
                    text.Span(" of ");
                    text.TotalPages();
                });
            });
        });

        return pdf.GeneratePdf();
    }

    internal static string GetWorkspaceDisplayName(Workspace? workspace)
        => string.IsNullOrWhiteSpace(workspace?.CompanyName)
            ? (string.IsNullOrWhiteSpace(workspace?.Name) ? "FieldSyncHub" : workspace.Name)
            : workspace.CompanyName;

    internal static List<string> BuildWorkspaceIdentityLines(Workspace? workspace)
    {
        var lines = new List<string> { GetWorkspaceDisplayName(workspace) };

        if (!string.IsNullOrWhiteSpace(workspace?.PhoneNumber))
        {
            lines.Add(workspace.PhoneNumber);
        }

        if (!string.IsNullOrWhiteSpace(workspace?.CompanyUrl))
        {
            lines.Add(workspace.CompanyUrl);
        }

        return lines;
    }

    internal static List<string> BuildBillToLines(Invoice invoice)
    {
        var lines = new List<string>();
        var customer = invoice.Customer;

        if (customer != null)
        {
            if (!string.IsNullOrWhiteSpace(customer.CompanyName))
            {
                lines.Add(customer.CompanyName);
            }

            var customerName = customer.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(customerName))
            {
                lines.Add(customerName);
            }

            var billingAddress = FormatAddress(
                customer.BillingStreet,
                customer.BillingCity,
                customer.BillingState,
                customer.BillingPostalCode,
                customer.BillingCountry);

            if (!string.IsNullOrWhiteSpace(billingAddress))
            {
                lines.Add(billingAddress);
            }

            var phone = customer.CustomerPhones?
                .Select(p => p.PhoneNumber?.Trim())
                .FirstOrDefault(p => !string.IsNullOrWhiteSpace(p));
            if (!string.IsNullOrWhiteSpace(phone))
            {
                lines.Add(phone);
            }

            var email = customer.Emails
                .Select(e => e?.Trim())
                .FirstOrDefault(e => !string.IsNullOrWhiteSpace(e));
            if (!string.IsNullOrWhiteSpace(email))
            {
                lines.Add(email);
            }
        }

        var propertyAddress = FormatAddress(
            invoice.Property?.Street,
            invoice.Property?.City,
            invoice.Property?.State,
            invoice.Property?.PostalCode,
            invoice.Property?.Country);

        if (!string.IsNullOrWhiteSpace(propertyAddress) && !lines.Contains(propertyAddress, StringComparer.OrdinalIgnoreCase))
        {
            lines.Add(propertyAddress);
        }

        if (lines.Count == 0)
        {
            lines.Add("Customer");
        }

        return lines;
    }

    private static string? FormatAddress(string? street, string? city, string? state, string? postalCode, string? country)
    {
        var locality = string.Join(" ", new[] { state?.Trim(), postalCode?.Trim() }.Where(part => !string.IsNullOrWhiteSpace(part)));

        var parts = new[]
        {
            street?.Trim(),
            city?.Trim(),
            locality,
            country?.Trim()
        }.Where(part => !string.IsNullOrWhiteSpace(part));

        var address = string.Join(", ", parts);
        return string.IsNullOrWhiteSpace(address) ? null : address;
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

    public async Task<InvoiceStatsDto> GetInvoiceStats(Guid workspaceId)
    {
        var now = DateTime.UtcNow;
        var firstDayOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var firstDayOfNextMonth = firstDayOfThisMonth.AddMonths(1);

        var invoices = await _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId)
            .Include(i => i.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .Include(i => i.Payments)
            .ToListAsync();

        decimal totalOutstanding = 0;
        decimal totalPaidThisMonth = 0;
        int overdueCount = 0;
        decimal totalInvoiceSum = 0;

        foreach (var invoice in invoices)
        {
            var total = invoice.Total;
            var balanceDue = invoice.BalanceDue;

            totalInvoiceSum += total;

            if (invoice.Status != InvoiceStatus.Draft && balanceDue > 0m)
            {
                totalOutstanding += balanceDue;
            }

            totalPaidThisMonth += invoice.Payments
                .Where(payment => payment.Status == PaymentRecordStatus.Succeeded
                    && payment.PaidAt.HasValue
                    && payment.PaidAt.Value >= firstDayOfThisMonth
                    && payment.PaidAt.Value < firstDayOfNextMonth)
                .Sum(payment => payment.Amount);

            if (invoice.Status == InvoiceStatus.Overdue)
            {
                overdueCount++;
            }
        }

        var averageInvoiceValue = invoices.Count > 0
            ? totalInvoiceSum / invoices.Count
            : 0;

        return new InvoiceStatsDto
        {
            TotalOutstanding = totalOutstanding,
            TotalPaidThisMonth = totalPaidThisMonth,
            OverdueCount = overdueCount,
            AverageInvoiceValue = averageInvoiceValue
        };
    }


}
