using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class CreateLeadDto
{
    // public Guid CustomerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public Guid? QuoteId { get; set; }
    public Guid WorkspaceId { get; set; }
    // public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public LeadPriority Priority { get; set; } = LeadPriority.Normal;
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public string? Notes { get; set; }
}