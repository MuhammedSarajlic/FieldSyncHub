namespace backend.Dtos.ServiceItemDto;

public class ServiceItemStatsDto
{
    public int TotalItems { get; set; }
    public int TotalMaterialItems { get; set; }
    public int TotalServiceItems { get; set; }
    public decimal TotalPricebookValue { get; set; }
    public decimal AverageItemPrice { get; set; }

    public string TotalItemsChange { get; set; } = string.Empty;
    public string MaterialItemsChange { get; set; } = string.Empty;
    public string ServiceItemsChange { get; set; } = string.Empty;
    public string AverageItemPriceChange { get; set; } = string.Empty;
}
