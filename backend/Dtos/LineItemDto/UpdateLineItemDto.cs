namespace backend.Dtos.LineItemDto;

public class UpdateLineItemDto
{
    public Guid? Id { get; set; }
    public Guid? ServiceItemId { get; set; }

    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool IsOptional { get; set; }
    public decimal? UnitPrice { get; set; }
    public int? Quantity { get; set; }
}