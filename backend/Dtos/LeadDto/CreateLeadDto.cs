using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class CreateLeadDto
{
    public Guid? CustomerId { get; set; }
    public Guid? QuoteId { get; set; }
    public Guid WorkspaceId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Source { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public LeadPriority Priority { get; set; } = LeadPriority.Normal;
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public string? Notes { get; set; }
}
