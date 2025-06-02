using backend.Data;
using backend.Dtos.QuoteDto;
using backend.Models.Quote;
using backend.Response;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.QuoteService;

public class QuoteService : IQuoteService
{
    private readonly DataContext _context;

    public QuoteService(DataContext context)
    {
        _context = context;
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

    public async Task<Quote> CreateAsync(CreateQuoteDto dto)
    {
        var quote = dto.Adapt<Quote>();
        quote.Id = Guid.NewGuid();
        quote.QuoteNumber = await GenerateQuoteNumber();
        quote.CreatedAt = DateTime.UtcNow;
        quote.UpdatedAt = DateTime.UtcNow;
        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();
        return quote;
    }

    public async Task<Quote> UpdateAsync(Guid id, CreateQuoteDto dto)
    {
        var quote = await _context.Quotes.Include(q => q.LineItems).FirstOrDefaultAsync(q => q.Id == id);
        if (quote == null) return null;
        dto.Adapt(quote);
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

    public async Task<ApiResponse<List<Quote>>> GetQuotesByFilter(string? q, Guid? workspaceId, string? status, DateTime? createdMin, DateTime? createdMax, decimal? totalMin, decimal? totalMax, string? sortBy, string? sort)
    {
        var queryable = _context.Quotes
        .Include(q => q.Customer)
        .Include(q => q.LineItems)
        .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            queryable = queryable.Where(quote => quote.Customer.FullName.Contains(q));
        }

        if (workspaceId.HasValue && workspaceId != Guid.Empty)
        {
            queryable = queryable.Where(q => q.WorkspaceId == workspaceId);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<QuoteStatus>(status, true, out var parsedStatus))
        {
            queryable = queryable.Where(q => q.Status == parsedStatus);
        }

        if (createdMin.HasValue)
        {
            queryable = queryable.Where(q => q.CreatedAt >= createdMin.Value);
        }

        if (createdMax.HasValue)
        {
            queryable = queryable.Where(q => q.CreatedAt <= createdMax.Value);
        }

        if (totalMin.HasValue)
        {
            queryable = queryable.Where(q => q.Total >= totalMin.Value);
        }

        if (totalMax.HasValue)
        {
            queryable = queryable.Where(q => q.Total <= totalMax.Value);
        }

        queryable = sortBy?.ToLower() switch
        {
            "customer" => sort == "desc"
                ? queryable.OrderByDescending(q => q.Customer.FirstName)
                : queryable.OrderBy(q => q.Customer.FirstName),

            "created" => sort == "desc"
                ? queryable.OrderByDescending(q => q.CreatedAt)
                : queryable.OrderBy(q => q.CreatedAt),

            "total" => sort == "desc"
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

    private async Task<string> GenerateQuoteNumber()
    {
        var today = DateTime.UtcNow.Date;
        var prefix = "QT-";
        var datePart = today.ToString("yyMMdd");

        var lastQuote = await _context.Quotes
            .Where(q => q.QuoteNumber.StartsWith(prefix + datePart))
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

        return $"{prefix}{datePart}-{sequence:D3}";
    }
}
