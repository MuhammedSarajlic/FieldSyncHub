using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class UpdateLeadDto
{
    public Guid Id { get; set; }
    public DateTime? RequestedDate { get; set; }
    public string? Description { get; set; }
    public DateTime? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public LeadStatus? Status { get; set; }
    public LeadPriority? Priority { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; }
    public string? Notes { get; set; }
}