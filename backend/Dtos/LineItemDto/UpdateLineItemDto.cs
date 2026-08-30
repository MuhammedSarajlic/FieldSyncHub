namespace backend.Dtos.LineItemDto;

public class UpdateLineItemDto
{
    public Guid? Id { get; set; }
    public Guid? ServiceItemId { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsOptional { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? Cost { get; set; }
    public bool? IsTaxable { get; set; }
    public decimal? Quantity { get; set; }
}
