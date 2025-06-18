namespace backend.Dtos.LineItemDto;

public class CreateLineItemDto
{
    public Guid? ServiceItemId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public decimal UnitPrice { get; set; } = 0;
    public decimal? Cost { get; set; }
    public decimal? TaxRate { get; set; }
    public bool? IsTaxable { get; set; }
    public int Quantity { get; set; } = 1;

    public Guid? JobId { get; set; }
    public Guid? InvoiceId { get; set; }
    public Guid? QuoteId { get; set; }
    public Guid? RequestId { get; set; }
}