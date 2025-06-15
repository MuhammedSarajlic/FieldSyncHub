namespace backend.Dtos.EmployeeInviteDto;

public class EmployeeInviteRequest
{
    public List<string> Emails { get; set; } = [];
    public Guid WorkspaceId { get; set; }
}