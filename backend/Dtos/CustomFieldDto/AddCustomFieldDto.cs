using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.CustomFieldDto;

public class AddCustomFieldDto
{
    [Key]
    public Guid CustomFieldId { get; set; }
    public Guid CustomerId { get; set; }
    public string? FieldName { get; set; }
    public string? FieldType { get; set; }
    public string? DefaultValue { get; set; }
}