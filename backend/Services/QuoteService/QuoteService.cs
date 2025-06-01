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

    public async Task<List<QuoteDto>> GetAllAsync()
    {
        var quotes = await _context.Quotes.Include(q => q.LineItems).ToListAsync();
        return quotes.Select(q => q.Adapt<QuoteDto>()).ToList();
    }

    public async Task<QuoteDto> GetByIdAsync(Guid id)
    {
        var quote = await _context.Quotes.Include(q => q.LineItems).FirstOrDefaultAsync(q => q.Id == id);
        return quote.Adapt<QuoteDto>();
    }

    public async Task<QuoteDto> CreateAsync(CreateQuoteDto dto)
    {
        var quote = dto.Adapt<Quote>();
        quote.Id = Guid.NewGuid();
        quote.QuoteNumber = GenerateQuoteNumber();
        quote.CreatedAt = DateTime.UtcNow;
        quote.UpdatedAt = DateTime.UtcNow;
        _context.Quotes.Add(quote);
        await _context.SaveChangesAsync();
        return quote.Adapt<QuoteDto>();
    }

    public async Task<QuoteDto> UpdateAsync(Guid id, CreateQuoteDto dto)
    {
        var quote = await _context.Quotes.Include(q => q.LineItems).FirstOrDefaultAsync(q => q.Id == id);
        if (quote == null) return null;
        dto.Adapt(quote);
        quote.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return quote.Adapt<QuoteDto>();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var quote = await _context.Quotes.FindAsync(id);
        if (quote == null) return false;
        _context.Quotes.Remove(quote);
        await _context.SaveChangesAsync();
        return true;
    }

    private string GenerateQuoteNumber()
    {
        var year = DateTime.Now.Year;
        var month = DateTime.Now.Month.ToString("00");
        var count = _context.Quotes.Count(q => q.CreatedAt.Year == year) + 1;
        return $"QT-{year}-{month}-{count.ToString("000")}";
    }

    public async Task<ApiResponse<List<Quote>>> GetQuotesByFilter(Guid? workspaceId, string? status, DateTime? createdMin, DateTime? createdMax, decimal? totalMin, decimal? totalMax, string? sortBy, string? sort)
    {
        var queryable = _context.Quotes
        .Include(q => q.Customer)
        .Include(q => q.LineItems)
        .AsQueryable();

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

    public async Task<QuoteDto> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        var quote = await _context.Quotes.Include(q => q.LineItems).FirstOrDefaultAsync(q => q.WorkspaceId == workspaceId);
        return quote.Adapt<QuoteDto>();
    }
}
