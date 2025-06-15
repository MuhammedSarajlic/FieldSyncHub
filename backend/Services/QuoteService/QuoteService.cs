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
            queryable = queryable.Where(quote => quote.Customer.FullName.Contains(filterDto.Q));
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

    public async Task<Quote> CreateAsync(CreateQuoteDto dto)
    {
        var quote = dto.Adapt<Quote>();
        quote.Id = Guid.NewGuid();
        quote.QuoteNumber = await GenerateQuoteNumber(dto.WorkspaceId);
        quote.CreatedAt = DateTime.UtcNow;
        quote.UpdatedAt = DateTime.UtcNow;

        if (quote.LineItems == null)
        {
            quote.LineItems = [];
        }
        else
        {
            quote.LineItems.Clear();
        }

        foreach (var lineItemDto in dto.LineItems)
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
        var quote = await _context.Quotes.Include(q => q.LineItems)
                                        .FirstOrDefaultAsync(q => q.Id == updatedQuoteDto.Id);

        if (quote == null) return null;

        updatedQuoteDto.Adapt(quote);
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
