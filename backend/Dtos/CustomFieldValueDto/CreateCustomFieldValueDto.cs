namespace backend.Dtos.CustomFieldValueDto;

public class CreateCustomFieldValueDto
{
    public Guid CustomerId { get; set; }
    public Guid CustomFieldId { get; set; }
    public string? Value { get; set; }
}