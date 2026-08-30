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
using backend.Services.StorageService;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.QuoteService;

public class QuoteService : IQuoteService
{
    private const int MaxDocumentNumberGenerationAttempts = 5;
    private readonly DataContext _context;
    private readonly IServiceItemService _serviceItemService;
    private readonly IEmailService _emailService;
    private readonly QuotePdfService _quotePdfService;
    private readonly IStorageService _storageService;

    public QuoteService(
        DataContext context,
        IServiceItemService serviceItemService,
        IEmailService emailService,
        QuotePdfService quotePdfService,
        IStorageService storageService)
    {
        _context = context;
        _serviceItemService = serviceItemService;
        _emailService = emailService;
        _quotePdfService = quotePdfService;
        _storageService = storageService;
    }

    public async Task<Quote> GetByIdAsync(Guid id, Guid callerWorkspaceId)
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
                                        .FirstOrDefaultAsync(q => q.Id == id && q.WorkspaceId == callerWorkspaceId);

        if (quote != null)
        {
            MarkExpiredIfNeeded(quote);
            foreach (var attachment in quote.Attachments)
            {
                attachment.Url = await _storageService.ResolveAsync(attachment.Url);
            }
        }

        return quote;
    }

    private static void MarkExpiredIfNeeded(Quote quote)
    {
        if (quote.ExpiresAt.HasValue && quote.ExpiresAt.Value <= DateTime.UtcNow
            && quote.Status is QuoteStatus.Sent or QuoteStatus.AwaitingResponse or QuoteStatus.AwaitingApproval)
        {
            quote.Status = QuoteStatus.Expired;
        }
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

    public async Task<ApiResponse<List<Quote>>> GetQuotesByCustomerId(Guid customerId, Guid callerWorkspaceId)
    {
        var quotes = await _context.Quotes.Where(q => q.CustomerId == customerId && q.WorkspaceId == callerWorkspaceId)
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
            decimal total = quote.Total;

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
        for (var attempt = 0; attempt < MaxDocumentNumberGenerationAttempts; attempt++)
        {
            var quote = createQuoteDto.Adapt<Quote>();
            quote.Id = Guid.NewGuid();
            quote.QuoteNumber = await GenerateQuoteNumber(createQuoteDto.WorkspaceId);
            quote.ExpiresAt = DateTime.UtcNow.AddDays(30);
            var workspace = await _context.Workspaces.AsNoTracking().FirstOrDefaultAsync(w => w.Id == createQuoteDto.WorkspaceId);
            quote.PaymentTerms = createQuoteDto.PaymentTerms ?? workspace?.DefaultPaymentTerms ?? "uponReceipt";
            quote.DepositAmount = createQuoteDto.DepositAmount ?? 0m;
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

                    lineItem.ServiceItemId = serviceItem.Id;
                    lineItem.Name = serviceItem.Name;
                    lineItem.Description = serviceItem.Description;
                    lineItem.UnitPrice = serviceItem.UnitPrice;
                    lineItem.Cost = serviceItem.Cost;
                    lineItem.IsTaxable = serviceItem.IsTaxable;
                }
                else
                {
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

            var user = await _context.Users.FindAsync(createQuoteDto.CreatedByUserId)
                ?? throw new KeyNotFoundException($"User with ID {createQuoteDto.CreatedByUserId} not found.");

            AddActivity(quote, QuoteActivityType.QuoteCreated, $"created quote #{quote.QuoteNumber}", user.Id.ToString(), user.FullName);

            var customer = await _context.Customers.FindAsync(createQuoteDto.CustomerId)
                ?? throw new KeyNotFoundException($"Customer with ID {createQuoteDto.CustomerId} not found.");
            customer.LastActivity = DateTime.UtcNow;

            _context.Quotes.Add(quote);

            try
            {
                await _context.SaveChangesAsync();

                quote = await _context.Quotes
                    .Include(q => q.Property)
                    .FirstOrDefaultAsync(q => q.Id == quote.Id);

                return quote;
            }
            catch (DbUpdateException)
            {
                _context.ChangeTracker.Clear();

                if (!await _context.Quotes.IgnoreQueryFilters()
                    .AnyAsync(q => q.WorkspaceId == createQuoteDto.WorkspaceId && q.QuoteNumber == quote.QuoteNumber))
                {
                    throw;
                }
            }
        }

        throw new InvalidOperationException("Could not generate a unique quote number. Please try again.");
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

    public async Task<QuoteAttachment> AddAttachmentToQuote(Guid quoteId, QuoteAttachmentDto attachmentDto, string userId, string userName, Guid callerWorkspaceId)
    {
        var quote = await _context.Quotes
            .Include(q => q.Attachments)
            .FirstOrDefaultAsync(q => q.Id == quoteId)
            ?? throw new Exception("Quote not found");

        if (quote.WorkspaceId != callerWorkspaceId)
        {
            throw new UnauthorizedAccessException("That quote is not in your workspace.");
        }

        // Only accept a path this caller actually uploaded for this workspace -
        // never an arbitrary client-supplied URL or another tenant's path.
        var url = attachmentDto.Url;
        if (!string.IsNullOrWhiteSpace(url) && !UploadPolicy.IsOwnedBy(url, callerWorkspaceId, null))
        {
            url = null;
        }

        var attachment = new QuoteAttachment
        {
            Id = Guid.NewGuid(),
            FileName = attachmentDto.FileName,
            Url = url,
            QuoteId = quoteId,
            CreatedAt = DateTime.UtcNow
        };

        quote.Attachments.Add(attachment);

        AddActivity(quote, QuoteActivityType.AttachmentAdded, $"added attachment {attachmentDto.FileName} to quote.", userId, userName);

        await _context.QuoteAttachments.AddAsync(attachment);
        await _context.SaveChangesAsync();

        attachment.Url = await _storageService.ResolveAsync(attachment.Url);
        return attachment;
    }


    public async Task<Quote> UpdateQuote(UpdateQuoteDto updatedQuoteDto, string userId, string userName, Guid callerWorkspaceId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var quote = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == updatedQuoteDto.Id);

            if (quote == null || quote.WorkspaceId != callerWorkspaceId)
            {
                throw new KeyNotFoundException($"Quote with ID {updatedQuoteDto.Id} not found.");
            }

            EnsureQuoteIsEditable(quote);

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

    public async Task<bool> DeleteQuote(Guid id, Guid callerWorkspaceId)
    {
        var quote = await _context.Quotes
            .Include(q => q.ActivityHistory)
            .Include(q => q.InternalNotes)
            .Include(q => q.CustomerNotes)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quote == null || quote.WorkspaceId != callerWorkspaceId) return false;

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
                quote.Viewed = true;
                quote.ViewedAt = DateTime.UtcNow;
                AddActivity(quote, QuoteActivityType.MarkedAccepted, $"marked quote as approved.", userId, userName);
            }
            else if (status == QuoteStatus.Declined)
            {
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

    public async Task<ApiResponse<Quote>> SendQuote(Guid id, SendQuoteDto sendQuoteDto, string userId, string userName, Guid callerWorkspaceId)
    {
        var quote = await _context.Quotes.Where(q => q.Id == id)
                                        .Include(q => q.ActivityHistory)
                                        .Include(q => q.Customer)
                                        .Include(q => q.CreatedByUser)
                                            .ThenInclude(u => u.Workspace)
                                        .FirstOrDefaultAsync();

        // Same "not found" message whether the quote doesn't exist or belongs to
        // another workspace, so this can't be used to probe for other tenants' ids.
        if (quote == null || quote.WorkspaceId != callerWorkspaceId)
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

        var customerEmails = quote.Customer?.Emails ?? [];
        var unknownRecipients = recipients
            .Where(r => !customerEmails.Any(e => e.Equals(r, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (unknownRecipients.Count > 0)
        {
            // The sending domain isn't an open relay - every recipient has to be an
            // address already on file for this quote's customer.
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = $"These addresses aren't on file for this quote's customer: {string.Join(", ", unknownRecipients)}."
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

        if (!UploadPolicy.TryGetRules("quote-attachment", out var attachmentRules))
        {
            throw new InvalidOperationException("Missing upload policy for quote-attachment.");
        }

        // Reject anything over budget from its base64 *string* length - roughly
        // 4/3 the decoded size - before ever calling Convert.FromBase64String, so
        // an oversized attachment never gets a decode buffer allocated for it at all.
        long totalAttachmentBytes = 0;
        foreach (var file in sendQuoteDto.Attachments ?? [])
        {
            if (string.IsNullOrWhiteSpace(file.Content)) continue;

            var contentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType;
            if (!attachmentRules.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            {
                return new ApiResponse<Quote>
                {
                    Success = false,
                    ErrorMessage = $"Attachment '{file.FileName}' has a file type that isn't allowed."
                };
            }

            var estimatedBytes = (long)file.Content.Length * 3 / 4;
            if (estimatedBytes > attachmentRules.MaxBytes || totalAttachmentBytes + estimatedBytes > attachmentRules.MaxBytes)
            {
                return new ApiResponse<Quote>
                {
                    Success = false,
                    ErrorMessage = $"Attachments exceed the {attachmentRules.MaxBytes / (1024 * 1024)}MB total limit for a single email."
                };
            }

            totalAttachmentBytes += estimatedBytes;
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

        if (!sent.Success)
        {
            return new ApiResponse<Quote>
            {
                Success = false,
                ErrorMessage = $"The email could not be delivered: {sent.Error}"
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
            EntityType = nameof(Quote),
            EntityId = quote.Id,
            WorkspaceId = quote.WorkspaceId,
            CreatedAt = DateTime.UtcNow
        };

        quote.ActivityHistory.Add(activity);
        _context.ActivityHistorys.Add(activity);
    }

    private static void EnsureQuoteIsEditable(Quote quote)
    {
        if (quote.Status == QuoteStatus.Draft)
        {
            return;
        }

        throw new InvalidOperationException(
            "This quote is locked because it has already been sent or responded to. Revise and resend by creating a new quote version.");
    }
}
