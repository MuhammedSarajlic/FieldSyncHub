using backend.Dtos.LineItemDto;
using backend.Models.RequestModels;

namespace backend.Dtos.RequestDto;

public class UpdateRequestDto
{
    public Guid Id { get; set; }
    public DateTime? RequestedDate { get; set; }
    public string? Description { get; set; }
    public DateTime? PreferredDate { get; set; }
    public string? PreferredTime { get; set; }
    public RequestStatus? Status { get; set; }
    public RequestPriority? Priority { get; set; }
    public List<UpdateLineItemDto>? LineItems { get; set; } = [];
    public string? Notes { get; set; }
}