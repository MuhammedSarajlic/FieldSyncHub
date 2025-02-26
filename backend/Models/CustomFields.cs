using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class CustomFields
{
    [Key]
    public Guid CustomFieldId { get; set; }
    public Guid CustomerId { get; set; }
    public string? FieldName { get; set; }
    public string? FieldType { get; set; }
    public string? DefaultValue { get; set; }
    public ICollection<CustomFiledValue>? CustomFiledValue { get; set; }
    [NotMapped]
    public Customers? Customer { get; set; }
}