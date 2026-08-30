using backend.Dtos.LineItemDto;
using backend.Models.QuoteModels;

namespace backend.Dtos.QuoteDto;

public class UpdateQuoteDto
{
    public Guid Id { get; set; }
    public Guid? AssignedToUserId { get; set; }

    public List<UpdateLineItemDto>? LineItems { get; set; }
    public string? Title { get; set; }
    public Guid? PropertyId { get; set; }
    public DiscountType? DiscountType { get; set; }
    public decimal? DiscountValue { get; set; }
    public decimal? TaxRate { get; set; }
    public string? PaymentTerms { get; set; }
    public decimal? DepositAmount { get; set; }
    public string? Source { get; set; }
}
