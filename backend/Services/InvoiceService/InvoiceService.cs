using System.Linq.Expressions;
using backend.Data;
using backend.Dtos.InvoiceDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.Billing;
using backend.Services.EmailService;
using backend.Services.StorageService;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.InvoiceService;

public class InvoiceService : IInvoiceService
{
    private const int MaxDocumentNumberGenerationAttempts = 5;
    private readonly DataContext _context;
    private readonly IEmailService _emailService;

    public InvoiceService(DataContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<Invoice> GetInvoiceById(Guid id, Guid callerWorkspaceId)
    {
        var invoice = await _context.Invoices
            .Where(i => i.Id == id)
            .Include(i => i.Customer)
                .ThenInclude(c => c!.CustomerPhones)
            .Include(i => i.Customer)
                .ThenInclude(c => c!.EmailRecords)
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
            .ThenInclude(c => c!.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c!.CustomerPhones)
            .Include(i => i.Customer)
            .ThenInclude(c => c!.EmailRecords)
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
            .ThenInclude(c => c!.EmailRecords)
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
            .AsNoTracking()
            .AsQueryable();

        if (filterDto.DueDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(filterDto.DueDateMin.Value, DateTimeKind.Utc);
            query = query.Where(i => i.DueDate >= minUtc);
        }

        if (filterDto.DueDateMax.HasValue)
        {
            var nextDayUtc = DateTime.SpecifyKind(filterDto.DueDateMax.Value.Date.AddDays(1), DateTimeKind.Utc);
            query = query.Where(i => i.DueDate < nextDayUtc);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            var q = filterDto.Q.Trim().ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(q) ||
                (i.Customer != null && (i.Customer.FirstName.ToLower().Contains(q) || i.Customer.LastName.ToLower().Contains(q))));
        }

        var hasStatusFilter = Enum.TryParse<InvoiceStatus>(filterDto.Status, true, out var parsedStatus);
        if (hasStatusFilter)
        {
            var succeededPayments = query.Select(i => new
            {
                Invoice = i,
                AmountPaid = i.Payments
                    .Where(p => p.Status == PaymentRecordStatus.Succeeded)
                    .Sum(p => (decimal?)p.Amount) ?? 0m
            });

            query = parsedStatus switch
            {
                InvoiceStatus.Draft => succeededPayments
                    .Where(x => x.Invoice.WorkflowStatus == InvoiceStatus.Draft)
                    .Select(x => x.Invoice),
                InvoiceStatus.Paid => succeededPayments
                    .Where(x => x.Invoice.Total <= x.AmountPaid)
                    .Select(x => x.Invoice),
                InvoiceStatus.Overdue => succeededPayments
                    .Where(x => x.Invoice.WorkflowStatus != InvoiceStatus.Draft
                        && x.Invoice.DueDate < DateTime.UtcNow.Date
                        && x.Invoice.Total > x.AmountPaid)
                    .Select(x => x.Invoice),
                InvoiceStatus.Partial => succeededPayments
                    .Where(x => x.Invoice.WorkflowStatus != InvoiceStatus.Draft
                        && x.Invoice.DueDate >= DateTime.UtcNow.Date
                        && x.AmountPaid > 0m
                        && x.Invoice.Total > x.AmountPaid)
                    .Select(x => x.Invoice),
                _ => succeededPayments
                    .Where(x => x.Invoice.WorkflowStatus != InvoiceStatus.Draft
                        && x.Invoice.DueDate >= DateTime.UtcNow.Date
                        && x.AmountPaid <= 0m
                        && x.Invoice.Total > x.AmountPaid)
                    .Select(x => x.Invoice)
            };
        }

        if (filterDto.TotalMin.HasValue)
        {
            query = query.Where(i => i.Total >= filterDto.TotalMin.Value);
        }

        if (filterDto.TotalMax.HasValue)
        {
            query = query.Where(i => i.Total <= filterDto.TotalMax.Value);
        }

        query = filterDto.SortBy?.ToLower() switch
        {
            "invoice-number" => filterDto.Sort == "desc"
                ? query.OrderByDescending(i => i.InvoiceNumber)
                : query.OrderBy(i => i.InvoiceNumber),

            "customer" => filterDto.Sort == "desc"
                ? query.OrderByDescending(i => i.Customer == null ? "" : i.Customer.FirstName)
                    .ThenByDescending(i => i.Customer == null ? "" : i.Customer.LastName)
                : query.OrderBy(i => i.Customer == null ? "" : i.Customer.FirstName)
                    .ThenBy(i => i.Customer == null ? "" : i.Customer.LastName),

            "due-date" => filterDto.Sort == "desc"
                ? query.OrderByDescending(i => i.DueDate)
                : query.OrderBy(i => i.DueDate),

            "total" => filterDto.Sort == "desc"
                ? query.OrderByDescending(i => i.Total)
                : query.OrderBy(i => i.Total),

            _ => query.OrderByDescending(i => i.IssueDate)
        };

        var totalCount = await query.CountAsync();
        var paged = await query
            .Include(i => i.Customer)
            .ThenInclude(c => c!.EmailRecords)
            .Include(i => i.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .Include(i => i.Payments)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

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
            .ThenInclude(c => c!.Properties)
            .Include(i => i.Customer)
            .ThenInclude(c => c!.CustomerPhones)
            .Include(i => i.Customer)
            .ThenInclude(c => c!.EmailRecords)
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
        for (var attempt = 0; attempt < MaxDocumentNumberGenerationAttempts; attempt++)
        {
            var invoice = createInvoiceDto.Adapt<Invoice>();
            invoice.InvoiceNumber = await GenerateInvoiceNumber(createInvoiceDto.WorkspaceId);
            invoice.DueDate = CalculateDueDate(invoice.IssueDate, invoice.PaymentTerms, createInvoiceDto.DueDate);

            var customer = await _context.Customers.FindAsync(createInvoiceDto.CustomerId)
                ?? throw new KeyNotFoundException($"Customer with ID {createInvoiceDto.CustomerId} not found.");
            customer.LastActivity = DateTime.UtcNow;
            invoice.RecalculateTotals();

            _context.Invoices.Add(invoice);

            try
            {
                await _context.SaveChangesAsync();
                return invoice;
            }
            catch (DbUpdateException)
            {
                _context.ChangeTracker.Clear();

                if (!await _context.Invoices.IgnoreQueryFilters()
                    .AnyAsync(i => i.WorkspaceId == createInvoiceDto.WorkspaceId && i.InvoiceNumber == invoice.InvoiceNumber))
                {
                    throw;
                }
            }
        }

        throw new InvalidOperationException("Could not generate a unique invoice number. Please try again.");
    }

    //TODO: Later refactor and make update like on customer to use other repositories to update child elements
    public async Task<Invoice> UpdateInvoice(UpdateInvoiceDto updatedInvoiceDto, Guid callerWorkspaceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.LineItems)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == updatedInvoiceDto.Id);

        if (invoice == null || invoice.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {updatedInvoiceDto.Id} not found.");
        }

        EnsureInvoiceIsEditable(invoice);

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
                            if (itemDto.Cost.HasValue) existing.Cost = itemDto.Cost.Value;
                            if (itemDto.IsTaxable.HasValue) existing.IsTaxable = itemDto.IsTaxable.Value;
                            if (itemDto.IsOptional.HasValue) existing.IsOptional = itemDto.IsOptional.Value;
                            if (itemDto.ServiceItemId.HasValue) existing.ServiceItemId = itemDto.ServiceItemId.Value;
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

        invoice.RecalculateTotals();
        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return invoice;
    }

    public async Task<ApiResponse<Invoice>> SendInvoice(Guid id, SendInvoiceDto sendInvoiceDto, Guid callerWorkspaceId, Guid userId, string userName)
    {
        var invoice = await _context.Invoices
            .Where(i => i.Id == id)
            .Include(i => i.Customer)
                .ThenInclude(c => c!.CustomerPhones)
            .Include(i => i.Customer)
                .ThenInclude(c => c!.EmailRecords)
            .Include(i => i.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .Include(i => i.Payments)
            .Include(i => i.Property)
            .FirstOrDefaultAsync();

        if (invoice == null || invoice.WorkspaceId != callerWorkspaceId)
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = $"Invoice with ID {id} not found."
            };
        }

        var recipients = (sendInvoiceDto.Recipients ?? [])
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (recipients.Count == 0)
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = "Add at least one recipient before sending."
            };
        }

        var customerEmails = invoice.Customer?.Emails ?? [];
        var unknownRecipients = recipients
            .Where(r => !customerEmails.Any(e => e.Equals(r, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (unknownRecipients.Count > 0)
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = $"These addresses aren't on file for this invoice's customer: {string.Join(", ", unknownRecipients)}."
            };
        }

        if (string.IsNullOrWhiteSpace(sendInvoiceDto.Subject))
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = "A subject is required."
            };
        }

        if (!_emailService.IsConfigured)
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = "Email sending isn't set up yet. Add your Resend API token and sender address to the server configuration."
            };
        }

        if (!UploadPolicy.TryGetRules("quote-attachment", out var attachmentRules))
        {
            throw new InvalidOperationException("Missing upload policy for quote-attachment.");
        }

        long totalAttachmentBytes = 0;
        foreach (var file in sendInvoiceDto.Attachments ?? [])
        {
            if (string.IsNullOrWhiteSpace(file.Content)) continue;

            var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;
            if (!attachmentRules.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            {
                return new ApiResponse<Invoice>
                {
                    Success = false,
                    ErrorMessage = $"Attachment '{file.FileName}' has a file type that isn't allowed."
                };
            }

            var estimatedBytes = (long)file.Content.Length * 3 / 4;
            if (estimatedBytes > attachmentRules.MaxBytes || totalAttachmentBytes + estimatedBytes > attachmentRules.MaxBytes)
            {
                return new ApiResponse<Invoice>
                {
                    Success = false,
                    ErrorMessage = $"Attachments exceed the {attachmentRules.MaxBytes / (1024 * 1024)}MB total limit for a single email."
                };
            }

            totalAttachmentBytes += estimatedBytes;
        }

        var attachments = new List<EmailAttachment>();

        if (sendInvoiceDto.AttachPdf)
        {
            try
            {
                var pdfBytes = GenerateDocument(invoice);
                var fileName = string.IsNullOrWhiteSpace(invoice.InvoiceNumber)
                    ? "Invoice.pdf"
                    : $"Invoice-{invoice.InvoiceNumber}.pdf";
                attachments.Add(new EmailAttachment(fileName, "application/pdf", pdfBytes));
            }
            catch (Exception ex)
            {
                return new ApiResponse<Invoice>
                {
                    Success = false,
                    ErrorMessage = $"Could not generate the invoice PDF: {ex.Message}"
                };
            }
        }

        foreach (var file in sendInvoiceDto.Attachments ?? [])
        {
            if (string.IsNullOrWhiteSpace(file.Content)) continue;

            try
            {
                attachments.Add(new EmailAttachment(
                    string.IsNullOrWhiteSpace(file.FileName) ? "attachment" : file.FileName,
                    string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                    Convert.FromBase64String(file.Content)));
            }
            catch (FormatException)
            {
                return new ApiResponse<Invoice>
                {
                    Success = false,
                    ErrorMessage = $"Attachment '{file.FileName}' could not be read."
                };
            }
        }

        var workspace = await _context.Workspaces
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == invoice.WorkspaceId);

        var companyName = GetWorkspaceDisplayName(workspace);

        var sent = await _emailService.SendEmailAsync(
            recipients,
            sendInvoiceDto.Subject,
            sendInvoiceDto.Message,
            BuildInvoiceEmailHtml(sendInvoiceDto.Message, companyName),
            attachments);

        if (!sent.Success)
        {
            return new ApiResponse<Invoice>
            {
                Success = false,
                ErrorMessage = $"The email could not be delivered: {sent.Error}"
            };
        }

        invoice.SentAt = DateTime.UtcNow;
        invoice.UpdatedAt = DateTime.UtcNow;

        if (invoice.WorkflowStatus == InvoiceStatus.Draft)
        {
            invoice.WorkflowStatus = InvoiceStatus.Sent;
        }

        _context.ActivityHistorys.Add(new ActivityHistory
        {
            Id = Guid.NewGuid(),
            Type = "InvoiceSent",
            Action = $"emailed the invoice to {string.Join(", ", recipients)}.",
            EntityType = nameof(Invoice),
            EntityId = invoice.Id,
            WorkspaceId = invoice.WorkspaceId,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = userId,
            ChangedByName = userName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return new ApiResponse<Invoice>
        {
            Success = true,
            Payload = await GetInvoiceById(invoice.Id, callerWorkspaceId)
        };
    }

    public async Task<Invoice> RecordPayment(Guid invoiceId, RecordInvoicePaymentDto paymentDto, Guid callerWorkspaceId, Guid recordedByUserId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null || invoice.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
        }

        if (paymentDto.Amount <= 0m)
        {
            throw new InvalidOperationException("Payment amount must be greater than zero.");
        }

        if (invoice.BalanceDue <= 0m)
        {
            throw new InvalidOperationException("This invoice has already been paid in full.");
        }

        if (paymentDto.Amount > invoice.BalanceDue)
        {
            throw new InvalidOperationException("Payment amount cannot exceed the remaining balance due.");
        }

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoice.Id,
            Amount = paymentDto.Amount,
            Method = paymentDto.Method,
            Status = PaymentRecordStatus.Succeeded,
            PaidAt = DateTime.SpecifyKind(paymentDto.PaidAt, DateTimeKind.Utc),
            RecordedByUserId = recordedByUserId,
            Note = string.IsNullOrWhiteSpace(paymentDto.Note) ? null : paymentDto.Note.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var didSyncJob = await SyncJobPaymentStatusAsync(invoice.Id);
        if (didSyncJob)
        {
            await _context.SaveChangesAsync();
        }

        return await GetInvoiceById(invoice.Id, callerWorkspaceId)
            ?? throw new KeyNotFoundException($"Invoice with ID {invoiceId} not found.");
    }

    public async Task DeleteInvoice(Guid id, Guid callerWorkspaceId)
    {
        var invoiceToDelete = await _context.Invoices.FindAsync(id);
        if (invoiceToDelete == null || invoiceToDelete.WorkspaceId != callerWorkspaceId)
        {
            throw new KeyNotFoundException($"Invoice with ID {id} not found.");
        }

        invoiceToDelete.IsArchived = true;
        invoiceToDelete.UpdatedAt = DateTime.UtcNow;
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
        var currencyCode = workspace?.Currency;

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(40);
                page.Size(PageSizes.A4);

                page.Header().Text("INVOICE").FontSize(24).Bold().FontColor(IsHexColor(workspace?.DocumentPrimaryColor) ? workspace!.DocumentPrimaryColor : "#0f5132").AlignCenter();

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
                            table.Cell().Text(CurrencyFormatter.Format(item.UnitPrice, currencyCode));
                            table.Cell().Text(CurrencyFormatter.Format(item.Total, currencyCode));
                        }
                    });

                    col.Item().AlignRight().Column(summary =>
                    {
                        summary.Item().Text($"Subtotal: {CurrencyFormatter.Format(invoice.Subtotal, currencyCode)}");

                        if (invoice.Discount > 0)
                        {
                            var discountLabel = invoice.DiscountType == DiscountType.Percentage
                                ? $"Discount ({invoice.Discount:0.##}%)"
                                : "Discount";
                            summary.Item().Text($"{discountLabel}: -{CurrencyFormatter.Format(totals.Discount, currencyCode)}");
                        }

                        summary.Item().Text($"Tax: {CurrencyFormatter.Format(totals.TaxAmount, currencyCode)}");
                        summary.Item().Text($"Total: {CurrencyFormatter.Format(totals.Total, currencyCode)}").Bold();
                    });

                    col.Item().Text(string.IsNullOrWhiteSpace(workspace?.DocumentFooterText) ? "See our Terms & Conditions" : workspace.DocumentFooterText).Italic().FontSize(10);
                    // col.Item().Text(invoice.TermsUrl).FontSize(10).Underline().Color(Colors.Blue.Medium);
                });

                page.Footer().AlignCenter().DefaultTextStyle(x => x.FontSize(10)).Text(text =>
                {
                    text.Span(workspace?.DocumentFooterText ?? senderName);
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

    private static bool IsHexColor(string? value)
        => value is { Length: 7 } && value[0] == '#' && value.Skip(1).All(Uri.IsHexDigit);

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

        var address = FormatAddress(
            workspace?.AddressLine1,
            workspace?.City,
            workspace?.State,
            workspace?.PostalCode,
            workspace?.Country);
        if (!string.IsNullOrWhiteSpace(workspace?.AddressLine2))
        {
            address = string.IsNullOrWhiteSpace(address)
                ? workspace.AddressLine2
                : $"{workspace.AddressLine2}, {address}";
        }
        if (!string.IsNullOrWhiteSpace(address))
        {
            lines.Add(address);
        }

        if (!string.IsNullOrWhiteSpace(workspace?.TaxRegistrationNumber))
        {
            lines.Add($"Tax ID: {workspace.TaxRegistrationNumber}");
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

    private static string BuildInvoiceEmailHtml(string message, string companyName)
    {
        var body = System.Net.WebUtility.HtmlEncode(message ?? string.Empty)
            .Replace("\r\n", "\n")
            .Replace("\n", "<br />");

        return $@"
<div style=""font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1a2e35; max-width: 640px;"">
  <div>{body}</div>
  <hr style=""border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 12px;"" />
  <p style=""font-size: 12px; color: #6b7280; margin: 0;"">Sent by {System.Net.WebUtility.HtmlEncode(companyName)}</p>
</div>";
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

    private static void EnsureInvoiceIsEditable(Invoice invoice)
    {
        if (invoice.WorkflowStatus == InvoiceStatus.Draft && invoice.AmountPaid <= 0m)
        {
            return;
        }

        throw new InvalidOperationException(
            "This invoice is locked because it has already been sent or paid. Revise and resend by creating a new invoice version.");
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
        var today = now.Date;

        var stats = await _context.Invoices
            .Where(i => i.WorkspaceId == workspaceId)
            .Select(i => new
            {
                i.Total,
                i.WorkflowStatus,
                i.DueDate,
                AmountPaid = i.Payments
                    .Where(payment => payment.Status == PaymentRecordStatus.Succeeded)
                    .Sum(payment => (decimal?)payment.Amount) ?? 0m,
                PaidThisMonth = i.Payments
                    .Where(payment => payment.Status == PaymentRecordStatus.Succeeded
                        && payment.PaidAt.HasValue
                        && payment.PaidAt.Value >= firstDayOfThisMonth
                        && payment.PaidAt.Value < firstDayOfNextMonth)
                    .Sum(payment => (decimal?)payment.Amount) ?? 0m
            })
            .GroupBy(_ => 1)
            .Select(group => new
            {
                InvoiceCount = group.Count(),
                TotalInvoiceSum = group.Sum(invoice => invoice.Total),
                TotalOutstanding = group
                    .Where(invoice => invoice.WorkflowStatus != InvoiceStatus.Draft
                        && invoice.Total > invoice.AmountPaid)
                    .Sum(invoice => invoice.Total - invoice.AmountPaid),
                TotalPaidThisMonth = group.Sum(invoice => invoice.PaidThisMonth),
                OverdueCount = group.Count(invoice => invoice.WorkflowStatus != InvoiceStatus.Draft
                    && invoice.DueDate < today
                    && invoice.Total > invoice.AmountPaid)
            })
            .FirstOrDefaultAsync();

        if (stats == null)
        {
            return new InvoiceStatsDto
            {
                TotalOutstanding = 0m,
                TotalPaidThisMonth = 0m,
                OverdueCount = 0,
                AverageInvoiceValue = 0m
            };
        }

        return new InvoiceStatsDto
        {
            TotalOutstanding = stats.TotalOutstanding,
            TotalPaidThisMonth = stats.TotalPaidThisMonth,
            OverdueCount = stats.OverdueCount,
            AverageInvoiceValue = stats.InvoiceCount > 0
                ? stats.TotalInvoiceSum / stats.InvoiceCount
                : 0m
        };
    }

    private async Task<bool> SyncJobPaymentStatusAsync(Guid invoiceId)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Payments)
            .Include(i => i.LineItems)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice?.JobId is not Guid jobId)
        {
            return false;
        }

        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId);
        if (job == null)
        {
            return false;
        }

        var newStatus = invoice.AmountPaid switch
        {
            <= 0m => PaymentStatus.Unpaid,
            _ when invoice.BalanceDue <= 0m => PaymentStatus.Paid,
            _ => PaymentStatus.Partial
        };

        if (job.PaymentStatus == newStatus)
        {
            return false;
        }

        job.PaymentStatus = newStatus;
        return true;
    }


}
