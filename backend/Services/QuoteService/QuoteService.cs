using backend.Data;
using backend.Dtos.QuoteDto;
using backend.Models;
using backend.Models.QuoteModels;
using backend.Response;
using backend.Services.ServiceItemService;
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
                                        .Include(q => q.CreatedByUser)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.CustomerPhones)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.Properties)
                                        .FirstOrDefaultAsync(q => q.Id == id);
        return quote;
    }

    public async Task<List<Quote>> GetQuotesByWorkspaceId(Guid workspaceId)
    {
        var quotes = await _context.Quotes.Include(q => q.LineItems)
                                        .Include(q => q.Customer)
                                        .ThenInclude(c => c.Properties)
                                        .Where(q => q.WorkspaceId == workspaceId)
                                        .ToListAsync();
        return quotes;
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

    public async Task<ApiResponse<List<Quote>>> GetQuotesByFilter(Guid workspaceId, QuoteFilterDto filterDto)
    {
        var queryable = _context.Quotes
        .Include(q => q.Customer)
        .Include(q => q.LineItems)
        .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filterDto.Q))
        {
            queryable = queryable.Where(quote =>
            quote.Customer != null && (quote.Customer.FirstName + " " + quote.Customer.LastName).Contains(filterDto.Q));
        }

        if (workspaceId != Guid.Empty)
        {
            queryable = queryable.Where(q => q.WorkspaceId == workspaceId);
        }

        if (!string.IsNullOrWhiteSpace(filterDto.Status) && Enum.TryParse<QuoteStatus>(filterDto.Status, true, out var parsedStatus))
        {
            queryable = queryable.Where(q => q.Status == parsedStatus);
        }

        if (filterDto.CreatedMin.HasValue)
        {
            queryable = queryable.Where(q => q.CreatedAt >= filterDto.CreatedMin.Value);
        }

        if (filterDto.CreatedMax.HasValue)
        {
            queryable = queryable.Where(q => q.CreatedAt <= filterDto.CreatedMax.Value);
        }

        if (filterDto.TotalMin.HasValue)
        {
            queryable = queryable.Where(q => q.Total >= filterDto.TotalMin.Value);
        }

        if (filterDto.TotalMax.HasValue)
        {
            queryable = queryable.Where(q => q.Total <= filterDto.TotalMax.Value);
        }

        queryable = filterDto.SortBy?.ToLower() switch
        {
            "customer" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(q => q.Customer.FirstName)
                : queryable.OrderBy(q => q.Customer.FirstName),

            "created" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(q => q.CreatedAt)
                : queryable.OrderBy(q => q.CreatedAt),

            "total" => filterDto.Sort == "desc"
                ? queryable.OrderByDescending(q => q.Total)
                : queryable.OrderBy(q => q.Total),

            _ => queryable.OrderByDescending(q => q.CreatedAt)
        };

        var result = await queryable.ToListAsync();

        return new ApiResponse<List<Quote>>
        {
            Success = true,
            Payload = result
        };
    }

    public async Task<Quote> CreateAsync(CreateQuoteDto createQuoteDto)
    {
        var quote = createQuoteDto.Adapt<Quote>();
        quote.Id = Guid.NewGuid();
        quote.QuoteNumber = await GenerateQuoteNumber(createQuoteDto.WorkspaceId);

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

        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();

        return quote;
    }

    public async Task<Quote> UpdateAsync(UpdateQuoteDto updatedQuoteDto)
    {
        var quote = await _context.Quotes
            .Include(q => q.LineItems)
            .FirstOrDefaultAsync(q => q.Id == updatedQuoteDto.Id) ?? throw new KeyNotFoundException($"Quote with ID {updatedQuoteDto.Id} not found.");

        if (updatedQuoteDto.ExpiresAt.HasValue) quote.ExpiresAt = updatedQuoteDto.ExpiresAt.Value;
        if (updatedQuoteDto.DiscountType.HasValue) quote.DiscountType = updatedQuoteDto.DiscountType.Value;
        if (updatedQuoteDto.DiscountValue.HasValue) quote.DiscountValue = updatedQuoteDto.DiscountValue.Value;
        if (updatedQuoteDto.TaxRate.HasValue) quote.TaxRate = updatedQuoteDto.TaxRate.Value;
        if (updatedQuoteDto.CustomerNotes != null) quote.CustomerNotes = updatedQuoteDto.CustomerNotes;
        if (updatedQuoteDto.InternalNotes != null) quote.InternalNotes = updatedQuoteDto.InternalNotes;

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

    public async Task<bool> DeleteAsync(Guid id)
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
}
