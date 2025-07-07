namespace backend.Dtos.NotesDto;

public class CreateNoteDto
{
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public string? NoteText { get; set; }
    public string? PathFile { get; set; }
}