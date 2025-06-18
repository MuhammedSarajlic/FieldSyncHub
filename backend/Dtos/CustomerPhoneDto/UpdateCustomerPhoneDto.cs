using backend.Models;

namespace backend.Dtos.CustomerPhoneDto;

public class UpdateCustomerPhoneDto
{
    public Guid Id { get; set; }
    public PhoneType? PhoneType { get; set; }
    public string? PhoneNumber { get; set; }
    public bool? IsReceiveMessage { get; set; }
}