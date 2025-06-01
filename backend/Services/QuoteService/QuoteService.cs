using backend.Data;
using backend.Dtos.QuoteDto;
using backend.Models.Quote;
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

}
