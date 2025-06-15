namespace backend.Dtos.UserDto;

public class UserLookupDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
}