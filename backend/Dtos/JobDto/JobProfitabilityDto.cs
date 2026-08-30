namespace backend.Dtos.JobDto;
public class JobProfitabilityDto
{
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal MarginPercent { get; set; }
    public List<ProfitabilityRowDto> ByJob { get; set; } = [];
    public List<ProfitabilityRowDto> ByServiceItem { get; set; } = [];
    public List<ProfitabilityRowDto> ByTechnician { get; set; } = [];
}
public class ProfitabilityRowDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal MarginPercent { get; set; }
}
