using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class UpdateLeadDto
{
    public Guid Id { get; set; }
    // public DateTime? RequestedDate { get; set; }
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
    public string? Description { get; set; }
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public LeadStatus? Status { get; set; }
    public LeadPriority? Priority { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; }
    public string? Notes { get; set; }
}