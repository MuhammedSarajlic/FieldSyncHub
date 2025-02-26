using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class CustomFiledValue
{
    [Key]
    public Guid CustomFieldValueId { get; set; }
    public Guid CustomFieldId { get; set; }
    public string? Value { get; set; }
    [NotMapped]
    public CustomFields? CustomFields { get; set; }
}