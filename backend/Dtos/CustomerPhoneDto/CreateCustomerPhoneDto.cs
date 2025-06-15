namespace backend.Dtos.CustomerPhoneDto;

public class CreateCustomerPhoneDto
{
    public string PhoneType { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsReceiveMessage { get; set; }
    public Guid CustomerId { get; set; }
}