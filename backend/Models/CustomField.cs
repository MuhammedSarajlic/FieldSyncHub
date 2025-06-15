using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class CustomField
{
    [Key]
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }

    [Required]
    public string FieldName { get; set; } = string.Empty;

    [Required]
    public CustomFieldType FieldType { get; set; } = CustomFieldType.Text;

    public string? DefaultValue { get; set; }
    public List<string>? DropdownOptions { get; set; }

    public bool IsRequired { get; set; } = false;
    public bool IsArchived { get; set; } = false;


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum CustomFieldType
{
    Text,
    Number,
    Date,
    Dropdown,
    Checkbox
}
