using backend.Models;

namespace backend.Dtos.CustomerPhoneDto;

public class CreateCustomerPhoneDto
{
    public PhoneType PhoneType { get; set; } = PhoneType.Work;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsReceiveMessage { get; set; }
    public Guid CustomerId { get; set; }
}