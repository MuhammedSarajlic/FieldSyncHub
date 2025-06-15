namespace backend.Dtos.CustomerPhoneDto;

public class UpdateCustomerPhoneDto
{
    public Guid Id { get; set; }
    public string PhoneType { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public bool IsReceiveMessage { get; set; }
}