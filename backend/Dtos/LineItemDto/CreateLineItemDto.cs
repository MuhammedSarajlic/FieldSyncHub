namespace backend.Dtos.LineItemDto;

public class CreateLineItemDto
{
    public Guid? ServiceItemId { get; set; }
    public string? Name { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? Description { get; set; }
    public int Quantity { get; set; }
}