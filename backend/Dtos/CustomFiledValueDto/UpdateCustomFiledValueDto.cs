using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.CustomFiledValueDto;

public class UpdateCustomFiledValueDto
{
    [Key]
    public Guid CustomFieldValueId { get; set; }
    public Guid CustomFieldId { get; set; }
    public string? Value { get; set; }
}