namespace backend.Dtos.NotesDto;

public class CreateNoteDto
{
    public Guid? CustomerId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public string? NoteText { get; set; }
    public string? PathFile { get; set; }
}