using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class CreateLeadDto
{
    public Guid CustomerId { get; set; }
    public Guid? QuoteId { get; set; }
    public Guid WorkspaceId { get; set; }
    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public DateTime? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public LeadPriority Priority { get; set; } = LeadPriority.Normal;
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public string? Notes { get; set; }
}