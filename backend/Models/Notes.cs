using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Notes
{
    [Key]
    public Guid Id { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? NoteText { get; set; }
    public string? PathFile { get; set; }
    public Guid CustomerId { get; set; }
    [NotMapped]
    public Customers? Customer { get; set; }
}