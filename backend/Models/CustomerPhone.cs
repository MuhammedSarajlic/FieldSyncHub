using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CustomerPhone
    {
        [Key]
        public Guid Id { get; set; }
        public string? PhoneType { get; set; }
        public string? PhoneNumber { get; set; }
        public bool IsReceiveMessage { get; set; }
        public Guid CustomerId { get; set; }
        [NotMapped]
        public Customers? Customer { get; set; }
    }
}