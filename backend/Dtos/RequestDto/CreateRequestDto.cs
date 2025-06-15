using backend.Dtos.LineItemDto;
using backend.Models.RequestModels;

namespace backend.Dtos.RequestDto;

public class CreateRequestDto
{
    public Guid CustomerId { get; set; }
    public Guid? QuoteId { get; set; }
    public Guid WorkspaceId { get; set; }
    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;
    public DateTime? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public RequestPriority Priority { get; set; } = RequestPriority.Normal;
    public List<CreateLineItemDto> LineItems { get; set; } = [];
    public string? Notes { get; set; }
}