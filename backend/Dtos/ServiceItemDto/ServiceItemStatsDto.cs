namespace backend.Dtos.ServiceItemDto;

public class ServiceItemStatsDto
{
    public int TotalItems { get; set; }
    public int TotalMaterialItems { get; set; }
    public int TotalServiceItems { get; set; }
    public decimal TotalPricebookValue { get; set; }
    public decimal AverageItemPrice { get; set; }

    public string TotalItemsChange { get; set; }
    public string MaterialItemsChange { get; set; }
    public string ServiceItemsChange { get; set; }
    public string AverageItemPriceChange { get; set; }
}