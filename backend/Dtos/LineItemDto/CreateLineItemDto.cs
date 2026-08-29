namespace backend.Dtos.LineItemDto;

public class CreateLineItemDto
{
    public Guid? ServiceItemId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public decimal UnitPrice { get; set; } = 0;
    public decimal? Cost { get; set; }
    public decimal Quantity { get; set; } = 1m;
    public bool? IsTaxable { get; set; }
    public bool IsOptional { get; set; }
    public Guid? JobId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? QuoteId { get; set; }
    public Guid? RequestId { get; set; }
}
