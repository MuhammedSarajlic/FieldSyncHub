namespace backend.Dtos.EmployeeDto
{
    public class UpdateEmployeeDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid WorkspaceId { get; set; } 
        public string? Position { get; set; }
        public string? Department { get; set; }
        public string Status { get; set; } = "active";
        public DateTime HireDate { get; set; }
    }
}