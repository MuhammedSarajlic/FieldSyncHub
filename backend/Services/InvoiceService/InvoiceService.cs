using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using Microsoft.EntityFrameworkCore;

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

    public async Task<Invoice?> UpdateInvoice(Guid id, UpdateInvoiceDto invoiceDto)
    {
        var existingInvoice = await _context.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);

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
}