using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.CustomerPhoneDto;

public class AddCustomerPhoneDto
{
    [Key]
    public Guid Id { get; set; }
    public string? PhoneType { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsReceiveMessage { get; set; }
    public Guid CustomerId { get; set; }
}