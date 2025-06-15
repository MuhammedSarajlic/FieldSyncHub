using backend.Models;

namespace backend.Dtos.CustomFieldDto;

public class UpdateCustomFieldDto
{
    public Guid? Id { get; set; }
    public string? FieldName { get; set; } = string.Empty;
    public CustomFieldType? FieldType { get; set; } = CustomFieldType.Text;
    public string? DefaultValue { get; set; }
    public List<string>? DropdownOptions { get; set; }
    public bool? IsRequired { get; set; } = false;
    public bool? IsArchived { get; set; } = false;
}