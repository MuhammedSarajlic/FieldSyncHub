using backend.Dtos.LineItemDto;
using backend.Models;

namespace backend.Dtos.LeadDto;

public class UpdateLeadDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Source { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDateTime { get; set; }
    public DateTime? EndDateTime { get; set; }
    public LeadStatus? Status { get; set; }
    public LeadPriority? Priority { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; }
    public string? Notes { get; set; }
}
