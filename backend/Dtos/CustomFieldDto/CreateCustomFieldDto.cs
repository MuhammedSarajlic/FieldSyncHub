using backend.Models;

namespace backend.Dtos.CustomFieldDto;

public class CreateCustomFieldDto
{
    public Guid WorkspaceId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public CustomFieldType FieldType { get; set; }
    public string? DefaultValue { get; set; }
    public List<string>? DropdownOptions { get; set; }
    public bool IsRequired { get; set; } = false;
}