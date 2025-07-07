using System.Security.Claims;
using backend.Data;
using backend.Dtos.NotesDto;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.ServiceItemService;
using backend.Wrappers;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.QuoteService;

public class QuoteService : IQuoteService
{
    private readonly DataContext _context;
    private readonly IServiceItemService _serviceItemService;

    public QuoteService(DataContext context, IServiceItemService serviceItemService)
    {
        _context = context;
        _serviceItemService = serviceItemService;
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
                                        .Include(q => q.CustomerNotes.OrderByDescending(n => n.CreatedAt))
                                        .Include(q => q.InternalNotes.OrderByDescending(n => n.CreatedAt))
                                        .Include(q => q.Attachments)
                                        .Include(q => q.ActivityHistory.OrderByDescending(a => a.ChangedAt))
                                        .FirstOrDefaultAsync(q => q.Id == id);
        return quote;
    }

    public async Task<ApiResponse<PagedResult<Quote>>> GetQuotesByWorkspace(Guid workspaceId, int pageNumber, int pageSize)
    {
        var query = _context.Quotes
            .Include(q => q.Customer)
                .ThenInclude(c => c.Properties)
            .Include(q => q.LineItems)
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
        var quotes = await _context.Quotes.Include(q => q.LineItems)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.Properties)
                                        .Where(q => q.CustomerId == customerId)
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
                lineItem.TaxRate = serviceItem.TaxRate;
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
                lineItem.TaxRate = 0m;
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

        foreach (var activity in quote.ActivityHistory)
        {
            activity.Action = $"created quote #{quote.QuoteNumber}";
        }

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

        AddActivity(quote, "customer_note_added", $"added customer note to quote.", noteDto.CreatedBy, noteDto.CreatedByName);

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

        AddActivity(quote, "internal_note_added", $"added internal note to quote.", noteDto.CreatedBy, noteDto.CreatedByName);

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

        AddActivity(quote, "attachment_added", $"added attachment {attachmentDto.FileName} to quote.", userId, userName);

        await _context.QuoteAttachments.AddAsync(attachment);
        await _context.SaveChangesAsync();

        return attachment;
    }


    public async Task<Quote> UpdateQuote(UpdateQuoteDto updatedQuoteDto)
    {
        var quote = await _context.Quotes
            .Include(q => q.LineItems)
            .FirstOrDefaultAsync(q => q.Id == updatedQuoteDto.Id) ?? throw new KeyNotFoundException($"Quote with ID {updatedQuoteDto.Id} not found.");

        if (updatedQuoteDto.ExpiresAt.HasValue) quote.ExpiresAt = updatedQuoteDto.ExpiresAt.Value;
        if (updatedQuoteDto.DiscountType.HasValue) quote.DiscountType = updatedQuoteDto.DiscountType.Value;
        if (updatedQuoteDto.DiscountValue.HasValue) quote.DiscountValue = updatedQuoteDto.DiscountValue.Value;
        if (updatedQuoteDto.TaxRate.HasValue) quote.TaxRate = updatedQuoteDto.TaxRate.Value;
        quote.Source = updatedQuoteDto.Source ?? quote.Source;

        if (updatedQuoteDto.LineItems != null)
        {
            if (updatedQuoteDto.LineItems.Count == 0)
            {
                _context.LineItems.RemoveRange(quote.LineItems);
                quote.LineItems.Clear();
            }
            else
            {
                var itemsToRemove = quote.LineItems
                    .Where(existingItem => !updatedQuoteDto.LineItems.Any(dtoItem => dtoItem.Id == existingItem.Id && dtoItem.Id.HasValue))
                    .ToList();
                _context.LineItems.RemoveRange(itemsToRemove);

                foreach (var itemDto in updatedQuoteDto.LineItems)
                {
                    if (itemDto.Id.HasValue && itemDto.Id.Value != Guid.Empty)
                    {
                        var existingLineItem = quote.LineItems.FirstOrDefault(li => li.Id == itemDto.Id.Value);

                        if (existingLineItem != null)
                        {
                            existingLineItem.ServiceItemId = itemDto.ServiceItemId ?? existingLineItem.ServiceItemId;
                            existingLineItem.Name = itemDto.Name ?? existingLineItem.Name;
                            existingLineItem.Description = itemDto.Description ?? existingLineItem.Description;
                            if (itemDto.UnitPrice.HasValue) existingLineItem.UnitPrice = itemDto.UnitPrice.Value;
                            if (itemDto.Quantity.HasValue) existingLineItem.Quantity = itemDto.Quantity.Value;

                            existingLineItem.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    else
                    {
                        var newLineItem = new LineItem
                        {
                            Id = Guid.NewGuid(),
                            QuoteId = quote.Id,
                            ServiceItemId = itemDto.ServiceItemId,
                            Name = itemDto.Name ?? "",
                            Description = itemDto.Description,
                            UnitPrice = itemDto.UnitPrice ?? 0,
                            Quantity = itemDto.Quantity ?? 1,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        quote.LineItems.Add(newLineItem);
                    }
                }
            }
        }

        quote.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return quote;
    }

    public async Task<bool> DeleteQuote(Guid id)
    {
        var quote = await _context.Quotes.FindAsync(id);
        if (quote == null) return false;
        _context.Quotes.Remove(quote);
        await _context.SaveChangesAsync();
        return true;
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

    private void AddActivity(Quote quote, string type, string action, string userId, string userName)
    {
        var activity = new ActivityHistory
        {
            Id = Guid.NewGuid(),
            ChangedBy = Guid.Parse(userId),
            ChangedByName = userName,
            Type = type,
            Action = action,
            CreatedAt = DateTime.UtcNow
        };

        quote.ActivityHistory.Add(activity);
        _context.ActivityHistorys.Add(activity);
    }
}
