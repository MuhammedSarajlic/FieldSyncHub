using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.NotesDto;

public class AddNotesDto
{
    [Key]
    public Guid Id { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? NoteText { get; set; }
    public string? PathFile { get; set; }
    public Guid CustomerId { get; set; }
}