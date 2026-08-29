namespace backend.Dtos.LineItemDto;

public class GetLineItemDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Quantity { get; set; }
    public decimal Total { get; set; }
}
