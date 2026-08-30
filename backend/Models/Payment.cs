using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Payment
{
    [Key]
    public Guid Id { get; set; }
    public Guid? InvoiceId { get; set; }
    [JsonIgnore]
    public Invoice? Invoice { get; set; }
    public Guid? JobId { get; set; }
    [JsonIgnore]
    public Job? Job { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Other;
    public PaymentRecordStatus Status { get; set; } = PaymentRecordStatus.Pending;
    public string? ProcessorReference { get; set; }
    public DateTime? PaidAt { get; set; }
    public Guid? RecordedByUserId { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum PaymentMethod
{
    Cash = 0,
    Check = 1,
    CardOnSite = 2,
    Card = 3,
    BankTransfer = 4,
    Other = 5
}

public enum PaymentRecordStatus
{
    Pending = 0,
    Succeeded = 1,
    Failed = 2,
    Voided = 3,
    Refunded = 4
}
