using System.Security.Claims;
using backend.Data;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.EmailService;
using backend.Services.PdfService;
using backend.Services.ServiceItemService;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.Services.QuoteService;

public class QuoteService : IQuoteService
{
    private readonly DataContext _context;
    private readonly IServiceItemService _serviceItemService;
    private readonly IEmailService _emailService;
    private readonly QuotePdfService _quotePdfService;

    public QuoteService(
        DataContext context,
        IServiceItemService serviceItemService,
        IEmailService emailService,
        QuotePdfService quotePdfService)
    {
        _context = context;
        _serviceItemService = serviceItemService;
        _emailService = emailService;
        _quotePdfService = quotePdfService;
    }

    public async Task<List<Quote>> GetAllAsync()
    {
        var quotes = await _context.Quotes.Include(q => q.LineItems).ToListAsync();
        return quotes;
    }

    public async Task<Quote> GetByIdAsync(Guid id)
    {
        var quote = await _context.Quotes.Include(q => q.LineItems)
                                        .Include(q => q.Property)
                                        .Include(q => q.CreatedByUser)
                                        .Include(q => q.Customer)
                                            .ThenInclude(c => c.CustomerPhones)
                                        .Include(q => q.Customer)
                                            .ThenInclude(c => c.Properties)
                                        .Include(q => q.CustomerNotes.OrderByDescending(n => n.CreatedAt))
                                        .Include(q => q.InternalNotes.OrderByDescending(n => n.CreatedAt))
                                        .Include(q => q.Attachments)
                                        .Include(q => q.ActivityHistory.OrderByDescending(a => a.ChangedAt))
                                        .Include(q => q.AssignedToUser)
                                        .FirstOrDefaultAsync(q => q.Id == id);
        return quote;
    }

    public async Task<ApiResponse<PagedResult<Quote>>> GetQuotesByWorkspace(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Quotes
            .Include(q => q.Customer)
                .ThenInclude(c => c.Properties)
            .Include(q => q.LineItems)
            .OrderByDescending(q => q.CreatedAt)
            .Where(q => q.WorkspaceId == workspaceId);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ApiResponse<PagedResult<Quote>>
        {
            Success = true,
            Payload = new PagedResult<Quote>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<ApiResponse<List<Quote>>> GetQuotesByCustomerId(Guid customerId)
    {
        var quotes = await _context.Quotes.Where(q => q.CustomerId == customerId)
                                        .Include(q => q.LineItems)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.Properties)
                                        .OrderByDescending(q => q.CreatedAt)
                                        .ToListAsync();
        return new ApiResponse<List<Quote>> { Success = true, Payload = quotes };
    }

    public async Task<ApiResponse<PagedResult<Quote>>> GetQuotesByFilter(
        Guid workspaceId,
        int pageNumber,
        int pageSize,
        QuoteFilterDto filterDto
    )
    {
        var dbQuery = _context.Quotes
            .Where(q => q.WorkspaceId == workspaceId);

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            dbQuery = dbQuery.Where(q =>
                q.Customer != null &&
                (
                    q.Customer.FirstName.Contains(filterDto.Q) ||
                    q.Customer.LastName.Contains(filterDto.Q)
                )
            );
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Status) &&
            Enum.TryParse<QuoteStatus>(filterDto.Status, true, out var parsedStatus))
        {
            dbQuery = dbQuery.Where(q => q.Status == parsedStatus);
        }

        if (filterDto.CreatedDateMin.HasValue)
        {
            var minUtc = DateTime.SpecifyKind(filterDto.CreatedDateMin.Value, DateTimeKind.Utc);
            dbQuery = dbQuery.Where(q => q.CreatedAt >= minUtc);
        }

        if (filterDto.CreatedDateMax.HasValue)
        {
            var maxUtc = DateTime.SpecifyKind(filterDto.CreatedDateMax.Value, DateTimeKind.Utc);
            dbQuery = dbQuery.Where(q => q.CreatedAt <= maxUtc);
        }

        var quotesList = await dbQuery
            .Include(q => q.Customer).ThenInclude(c => c.Properties)
            .Include(q => q.LineItems)
            .ToListAsync();

        if (filterDto.TotalMin.HasValue)
        {
            quotesList = quotesList
                .Where(q => q.Total >= filterDto.TotalMin.Value)
                .ToList();
        }

        if (filterDto.TotalMax.HasValue)
        {
            quotesList = quotesList
                .Where(q => q.Total <= filterDto.TotalMax.Value)
                .ToList();
        }

        quotesList = filterDto.SortBy?.ToLower() switch
        {
            "customer" => filterDto.Sort == "desc"
                ? quotesList.OrderByDescending(q => q.Customer?.FirstName).ToList()
                : quotesList.OrderBy(q => q.Customer?.FirstName).ToList(),

            "created" => filterDto.Sort == "desc"
                ? quotesList.OrderByDescending(q => q.CreatedAt).ToList()
                : quotesList.OrderBy(q => q.CreatedAt).ToList(),

            "total" => filterDto.Sort == "desc"
                ? quotesList.OrderByDescending(q => q.Total).ToList()
                : quotesList.OrderBy(q => q.Total).ToList(),

            _ => quotesList.OrderByDescending(q => q.CreatedAt).ToList()
        };

        var totalCount = quotesList.Count;
        var pagedQuotes = quotesList
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new ApiResponse<PagedResult<Quote>>
        {
            Success = true,
            Payload = new PagedResult<Quote>
            {
                Items = pagedQuotes,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            }
        };
    }

    public async Task<QuoteStatsDto> GetQuoteStats(Guid workspaceId)
    {
        var now = DateTime.UtcNow;
        var firstDayOfThisMonth = new DateTime(now.Year, now.Month, 1);
        var firstDayOfLastMonth = firstDayOfThisMonth.AddMonths(-1);
        var lastDayOfLastMonth = firstDayOfThisMonth.AddDays(-1);

        var quotes = await _context.Quotes
            .Where(q => q.WorkspaceId == workspaceId)
            .Include(q => q.LineItems)
                .ThenInclude(li => li.ServiceItem)
            .ToListAsync();

        int totalQuotes = quotes.Count;

        decimal totalValue = 0;
        decimal approvedValue = 0;
        int approvedQuotes = 0;

        foreach (var quote in quotes)
        {
            decimal subtotal = quote.LineItems.Sum(li =>
                (li.ServiceItem?.UnitPrice ?? li.UnitPrice) * li.Quantity);

            decimal discount = quote.DiscountType == DiscountType.Percentage
                ? subtotal * quote.DiscountValue / 100
                : quote.DiscountValue;

            decimal subtotalAfterDiscount = subtotal - discount;
            decimal taxAmount = subtotalAfterDiscount * quote.TaxRate;
            decimal total = subtotalAfterDiscount + taxAmount;

            totalValue += total;

            if (quote.Status == QuoteStatus.Approved)
            {
                approvedValue += total;
                approvedQuotes++;
            }
        }

        double conversionRate = totalQuotes > 0
            ? Math.Round((double)approvedQuotes / totalQuotes * 100, 2)
            : 0;

        return new QuoteStatsDto
        {
            TotalQuotes = totalQuotes,
            TotalValue = totalValue,
            ApprovedValue = approvedValue,
            ConversionRate = conversionRate
        };
    }

    public async Task<Quote> CreateQuote(CreateQuoteDto createQuoteDto)
    {
        var quote = createQuoteDto.Adapt<Quote>();
        quote.Id = Guid.NewGuid();
        quote.QuoteNumber = await GenerateQuoteNumber(createQuoteDto.WorkspaceId);
        quote.ExpiresAt = DateTime.UtcNow.AddDays(30);
        quote.Source = createQuoteDto.Source ?? string.Empty;

        if (quote.LineItems == null)
        {
            quote.LineItems = [];
        }
        else
        {
            quote.LineItems.Clear();
        }

        foreach (var lineItemDto in createQuoteDto.LineItems)
        {
            var lineItem = new LineItem
            {
                Id = Guid.NewGuid(),
                Quantity = lineItemDto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                QuoteId = quote.Id
            };

            if (lineItemDto.ServiceItemId.HasValue)
            {
                var serviceItem = await _serviceItemService.GetServiceItemById(lineItemDto.ServiceItemId.Value)
                    ?? throw new InvalidOperationException($"ServiceItem with ID {lineItemDto.ServiceItemId.Value} not found.");

                // Map data from ServiceItem to LineItem
                lineItem.ServiceItemId = serviceItem.Id;
                lineItem.Name = serviceItem.Name;
                lineItem.Description = serviceItem.Description;
                lineItem.UnitPrice = serviceItem.UnitPrice;
                lineItem.Cost = serviceItem.Cost;
                lineItem.IsTaxable = serviceItem.IsTaxable;
            }
            else
            {
                // Line item is a custom item
                lineItem.ServiceItemId = null;
                lineItem.Name = lineItemDto.Name;
                lineItem.Description = lineItemDto.Description;
                lineItem.UnitPrice = lineItemDto.UnitPrice;
                lineItem.Cost = 0m;
                lineItem.IsTaxable = false;
            }

            quote.LineItems.Add(lineItem);
        }

        quote.CustomerNotes = createQuoteDto.CustomerNotes?.Select(n => new Note
        {
            Id = Guid.NewGuid(),
            CreatedBy = n.CreatedBy,
            CreatedByName = n.CreatedByName,
            NoteText = n.NoteText,
        }).ToList() ?? new List<Note>();

        quote.InternalNotes = createQuoteDto.InternalNotes?.Select(n => new Note
        {
            Id = Guid.NewGuid(),
            CreatedBy = n.CreatedBy,
            CreatedByName = n.CreatedByName,
            NoteText = n.NoteText,
        }).ToList() ?? new List<Note>();

        var user = await _context.Users.FindAsync(createQuoteDto.CreatedByUserId);

        AddActivity(quote, QuoteActivityType.QuoteCreated, $"created quote #{quote.QuoteNumber}", user.Id.ToString(), user.FullName);

        var customer = await _context.Customers.FindAsync(createQuoteDto.CustomerId);
        customer.LastActivity = DateTime.UtcNow;

        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();

        quote = await _context.Quotes
            .Include(q => q.Property)
            .FirstOrDefaultAsync(q => q.Id == quote.Id);

        return quote;
    }

    public async Task<Note> AddCustomerNoteToQuote(Guid quoteId, CreateNoteDto noteDto)
    {
        var quote = await _context.Quotes
            .Include(q => q.CustomerNotes)
            .FirstOrDefaultAsync(q => q.Id == quoteId)
            ?? throw new Exception("Quote not found");

        var note = new Note
        {
            Id = Guid.NewGuid(),
            CreatedBy = noteDto.CreatedBy,
            CreatedByName = noteDto.CreatedByName,
            NoteText = noteDto.NoteText,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        quote.CustomerNotes.Add(note);

        AddActivity(quote, QuoteActivityType.CustomerNoteAdded, $"added customer note to quote.", noteDto.CreatedBy, noteDto.CreatedByName);

        await _context.Notes.AddAsync(note);
        await _context.SaveChangesAsync();

        return note;
    }

    public async Task<Note> AddInternalNoteToQuote(Guid quoteId, CreateNoteDto noteDto)
    {
        var quote = await _context.Quotes
            .Include(q => q.InternalNotes)
            .FirstOrDefaultAsync(q => q.Id == quoteId)
            ?? throw new Exception("Quote not found");

        var note = new Note
        {
            Id = Guid.NewGuid(),
            CreatedBy = noteDto.CreatedBy,
            CreatedByName = noteDto.CreatedByName,
            NoteText = noteDto.NoteText,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        quote.InternalNotes.Add(note);

        AddActivity(quote, QuoteActivityType.InternalNoteAdded, $"added internal note to quote.", noteDto.CreatedBy, noteDto.CreatedByName);

        await _context.Notes.AddAsync(note);
        await _context.SaveChangesAsync();

        return note;
    }

    public async Task<QuoteAttachment> AddAttachmentToQuote(Guid quoteId, QuoteAttachmentDto attachmentDto, string userId, string userName)
    {
        var quote = await _context.Quotes
            .Include(q => q.Attachments)
            .FirstOrDefaultAsync(q => q.Id == quoteId)
            ?? throw new Exception("Quote not found");

        var attachment = new QuoteAttachment
        {
            Id = Guid.NewGuid(),
            FileName = attachmentDto.FileName,
            Url = attachmentDto.Url,
            QuoteId = quoteId,
            CreatedAt = DateTime.UtcNow
        };

        quote.Attachments.Add(attachment);

        AddActivity(quote, QuoteActivityType.AttachmentAdded, $"added attachment {attachmentDto.FileName} to quote.", userId, userName);

        await _context.QuoteAttachments.AddAsync(attachment);
        await _context.SaveChangesAsync();

        return attachment;
    }


    public async Task<Quote> UpdateQuote(UpdateQuoteDto updatedQuoteDto, string userId, string userName)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var quote = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == updatedQuoteDto.Id)
                ?? throw new KeyNotFoundException($"Quote with ID {updatedQuoteDto.Id} not found.");

            if (updatedQuoteDto.DiscountType.HasValue) quote.DiscountType = updatedQuoteDto.DiscountType.Value;
            if (updatedQuoteDto.DiscountValue.HasValue) quote.DiscountValue = updatedQuoteDto.DiscountValue.Value;
            if (updatedQuoteDto.TaxRate.HasValue) quote.TaxRate = updatedQuoteDto.TaxRate.Value;
            if (updatedQuoteDto.AssignedToUserId.HasValue) quote.AssignedToUserId = updatedQuoteDto.AssignedToUserId.Value;
            quote.Title = updatedQuoteDto.Title ?? quote.Title;
            quote.Source = updatedQuoteDto.Source ?? quote.Source;
            quote.PropertyId = updatedQuoteDto.PropertyId;

            if (updatedQuoteDto.LineItems != null)
            {
                if (quote.LineItems == null)
                {
                    quote.LineItems = [];
                }

                var existingLineItems = quote.LineItems.ToList();
                var incomingLineItemIds = updatedQuoteDto.LineItems
                    .Where(x => x.Id != Guid.Empty)
                    .Select(x => x.Id)
                    .ToList();

                var itemsToRemove = existingLineItems
                    .Where(existing => !incomingLineItemIds.Contains(existing.Id))
                    .ToList();

                foreach (var itemToRemove in itemsToRemove)
                {
                    quote.LineItems.Remove(itemToRemove);
                }

                foreach (var itemDto in updatedQuoteDto.LineItems)
                {
                    if (itemDto.Id == Guid.Empty)
                    {
                        var newLineItem = itemDto.Adapt<LineItem>();
                        newLineItem.Id = Guid.NewGuid();
                        newLineItem.QuoteId = quote.Id;

                        quote.LineItems.Add(newLineItem);
                    }
                    else
                    {
                        var existingItem = existingLineItems.FirstOrDefault(x => x.Id == itemDto.Id);
                        if (existingItem != null)
                        {
                            itemDto.Adapt(existingItem);
                            existingItem.QuoteId = quote.Id;
                        }
                        else
                        {
                            var newLineItem = itemDto.Adapt<LineItem>();
                            newLineItem.QuoteId = quote.Id;
                            quote.LineItems.Add(newLineItem);
                        }
                    }
                }
            }

            quote.UpdatedAt = DateTime.UtcNow;

            AddActivity(quote, QuoteActivityType.QuoteEdited, "edited quote", userId, userName);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            quote = await _context.Quotes.Where(q => q.Id == updatedQuoteDto.Id)
                                        .Include(q => q.AssignedToUser)
                                        .Include(q => q.Property)
                                        .FirstOrDefaultAsync();
            return quote;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> DeleteQuote(Guid id)
    {
        var quote = await _context.Quotes
            .Include(q => q.ActivityHistory)
            .Include(q => q.InternalNotes)
            .Include(q => q.CustomerNotes)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote == null) return false;

        var notesToDelete = new List<Note>();
        notesToDelete.AddRange(quote.InternalNotes);
        notesToDelete.AddRange(quote.CustomerNotes);

        _context.ActivityHistorys.RemoveRange(quote.ActivityHistory);
        _context.Notes.RemoveRange(notesToDelete);
        _context.Quotes.Remove(quote);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task ArchiveQuote(Guid id)
    {
        var quote = await _context.Quotes.FirstOrDefaultAsync(q => q.Id == id) ?? throw new KeyNotFoundException($"Quote with ID {id} not found.");

        quote.IsArchived = true;
        quote.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<Quote> ChangeQuoteStatus(Guid id, QuoteStatus status, string userId, string userName)
    {
        var quote = await _context.Quotes.Where(q => q.Id == id)
                                        .Include(q => q.ActivityHistory)
                                        .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"Quote with ID {id} not found.");

        // Re-applying the status the quote already has is a no-op rather than an
        // error - but the caller still gets the quote back so the UI can refresh.
        if (quote.Status != status)
        {
            quote.Status = status;
            quote.UpdatedAt = DateTime.UtcNow;

            if (status == QuoteStatus.Sent)
            {
                quote.SentAt = DateTime.UtcNow;
                quote.Viewed = false;
                quote.ViewedAt = null;
                AddActivity(quote, QuoteActivityType.QuoteSent, $"marked quote as sent.", userId, userName);
            }
            else if (status == QuoteStatus.Approved)
            {
                quote.SentAt = DateTime.UtcNow;
                quote.Viewed = true;
                quote.ViewedAt = DateTime.UtcNow;
                AddActivity(quote, QuoteActivityType.MarkedAccepted, $"marked quote as approved.", userId, userName);
            }
            else if (status == QuoteStatus.Declined)
            {
                quote.SentAt = DateTime.UtcNow;
                quote.Viewed = true;
                quote.ViewedAt = DateTime.UtcNow;
                AddActivity(quote, QuoteActivityType.MarkedRejected, $"marked quote as rejected.", userId, userName);
            }

            await _context.SaveChangesAsync();
        }

        quote = await _context.Quotes
            .Where(q => q.Id == id)
            .Include(q => q.ActivityHistory)
            .FirstOrDefaultAsync();

        quote.ActivityHistory = quote.ActivityHistory
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

        return quote;
    }

    public async Task<ApiResponse<Quote>> SendQuote(Guid id, SendQuoteDto sendQuoteDto, string userId, string userName)
    {
        var quote = await _context.Quotes.Where(q => q.Id == id)
                                        .Include(q => q.ActivityHistory)
                                        .Include(q => q.Customer)
                                        .Include(q => q.CreatedByUser)
                                            .ThenInclude(u => u.Workspace)
                                        .FirstOrDefaultAsync();

        if (quote == null)
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = $"Quote with ID {id} not found."
            };
        }

        var recipients = (sendQuoteDto.Recipients ?? [])
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (recipients.Count == 0)
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = "Add at least one recipient before sending."
            };
        }

        if (string.IsNullOrWhiteSpace(sendQuoteDto.Subject))
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = "A subject is required."
            };
        }

        if (!_emailService.IsConfigured)
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = "Email sending isn't set up yet. Add your Resend API token and sender address to the server configuration."
            };
        }

        var attachments = new List<EmailAttachment>();

        if (sendQuoteDto.AttachPdf)
        {
            try
            {
                var pdfBytes = await _quotePdfService.GenerateQuotePdf(id);
                var fileName = string.IsNullOrWhiteSpace(quote.QuoteNumber)
                    ? "Quote.pdf"
                    : $"Quote-{quote.QuoteNumber}.pdf";
                attachments.Add(new EmailAttachment(fileName, "application/pdf", pdfBytes));
            }
            catch (Exception ex)
            {
                return new ApiResponse<Quote>
                {
                    Success = false,
                    ErrorMessage = $"Could not generate the quote PDF: {ex.Message}"
                };
            }
        }

        foreach (var file in sendQuoteDto.Attachments ?? [])
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
                return new ApiResponse<Quote>
                {
                    Success = false,
                    ErrorMessage = $"Attachment '{file.FileName}' could not be read."
                };
            }
        }

        var companyName = quote.CreatedByUser?.Workspace?.CompanyName
                          ?? quote.CreatedByUser?.Workspace?.Name
                          ?? "FieldSyncHub";

        var sent = await _emailService.SendEmailAsync(
            recipients,
            sendQuoteDto.Subject,
            sendQuoteDto.Message,
            BuildQuoteEmailHtml(sendQuoteDto.Message, companyName),
            attachments);

        if (!sent)
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = "The email could not be delivered. Check the email settings and try again."
            };
        }

        quote.SentAt = DateTime.UtcNow;
        quote.Viewed = false;
        quote.ViewedAt = null;
        quote.UpdatedAt = DateTime.UtcNow;

        // Sending shouldn't walk a quote backwards once the customer has already
        // responded to it or it has become a job.
        if (quote.Status is QuoteStatus.Draft or QuoteStatus.Sent or QuoteStatus.AwaitingResponse)
        {
            quote.Status = QuoteStatus.Sent;
        }

        AddActivity(
            quote,
            QuoteActivityType.QuoteSent,
            $"emailed the quote to {string.Join(", ", recipients)}.",
            userId,
            userName);

        await _context.SaveChangesAsync();

        var updated = await _context.Quotes
            .Where(q => q.Id == id)
            .Include(q => q.ActivityHistory)
            .FirstOrDefaultAsync();

        updated!.ActivityHistory = updated.ActivityHistory
            .OrderByDescending(a => a.CreatedAt)
            .ToList();

        return new ApiResponse<Quote>
        {
            Success = true,
            Payload = updated
        };
    }

    private static string BuildQuoteEmailHtml(string message, string companyName)
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

    public byte[] GenerateQuotePdf(Quote quote)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("Your Company Inc.").Bold().FontSize(20);
                        col.Item().Text("1234 Company St,\nCompany Town, ST 12345");
                    });

                    row.ConstantItem(100).Height(50)
                        .Border(1).AlignCenter().AlignMiddle()
                        .Text("Logo");
                });

                page.Content().Column(col =>
                {
                    col.Item().PaddingVertical(10).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Bill To").Bold().FontColor(Colors.Green.Medium);
                            c.Item().Text(quote.Customer.FullName);
                            c.Item().Text(quote.Customer.FullName);
                        });

                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Quote # {quote.QuoteNumber}");
                            c.Item().Text($"Quote date: {quote.CreatedAt:dd-MM-yyyy}");
                            c.Item().Text($"Due date: {quote.CreatedAt:dd-MM-yyyy}");
                        });
                    });

                    col.Item().PaddingVertical(5).LineHorizontal(0.5f);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(50);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(1);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("QTY").Bold();
                            header.Cell().Text("Description").Bold();
                            header.Cell().AlignRight().Text("Unit Price").Bold();
                            header.Cell().AlignRight().Text("Amount").Bold();
                        });

                        foreach (var item in quote.LineItems)
                        {
                            table.Cell().Text($"{item.Quantity:0.00}");
                            table.Cell().Text(item.Name);
                            table.Cell().AlignRight().Text($"{item.UnitPrice:C}");
                            table.Cell().AlignRight().Text($"{(item.UnitPrice * item.Quantity):C}");
                        }
                    });

                    col.Item().PaddingVertical(5).LineHorizontal(0.5f);

                    col.Item().AlignRight().Column(c =>
                    {
                        c.Item().Text($"Subtotal: {quote.Subtotal:C}");
                        c.Item().Text($"Discount: -{quote.Discount:C}");
                        c.Item().Text($"Tax: +{quote.TaxAmount:C}");
                        c.Item().Text($"Total (USD): {quote.Total:C}").Bold();
                    });

                    col.Item().PaddingTop(20).Text("Terms and Conditions")
                        .Bold().FontColor(Colors.Green.Medium);
                    col.Item().Text("Payment is due in 14 days.\nPlease make checks payable to: Your Company Inc.");
                });

                page.Footer().AlignCenter()
                    .Text("customer signature").Italic().FontSize(10);
            });
        });

        return document.GeneratePdf();
    }



    private async Task<string> GenerateQuoteNumber(Guid workspaceId)
    {
        var today = DateTime.UtcNow.Date;
        var prefix = "QT-";
        var datePart = today.ToString("yyMMdd");

        var lastQuote = await _context.Quotes
            .Where(q => q.WorkspaceId == workspaceId && q.QuoteNumber.StartsWith(prefix + datePart))
            .OrderByDescending(q => q.QuoteNumber)
            .Select(q => q.QuoteNumber)
            .FirstOrDefaultAsync();

        int sequence = 1;
        if (lastQuote != null)
        {
            var parts = lastQuote.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastSequence))
            {
                sequence = lastSequence + 1;
            }
        }

        return $"{prefix}{datePart}-{sequence:D4}";
    }

    private void AddActivity(Quote quote, QuoteActivityType type, string action, string userId, string userName)
    {
        var activityType = type.ToString("G");

        var activity = new ActivityHistory
        {
            Id = Guid.NewGuid(),
            ChangedBy = Guid.Parse(userId),
            ChangedByName = userName,
            Type = activityType,
            Action = action,
            CreatedAt = DateTime.UtcNow
        };

        quote.ActivityHistory.Add(activity);
        _context.ActivityHistorys.Add(activity);
    }
}
