using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Job
{
    [Key]
    public Guid JobId { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }

    // Customer & Property Info
    public Guid CustomerId { get; set; }
    public Customers? Customer { get; set; } // Navigation property
    public Guid? PropertyId { get; set; }
    public Property? Property { get; set; } // Navigation property
    // public string? AlternateAddress { get; set; }

    // Job Type
    public string JobType { get; set; } = "one-time"; // "one-time" or "recurring"
    public string Repeats { get; set; }

    // Line Items
    public ICollection<LineItem> LineItems { get; set; } = new List<LineItem>(); // Combine service and custom items

    // Status Tracking
    public string Status { get; set; } = "scheduled"; // "scheduled", "dispatched", "in_progress", "completed", "cancelled"
    public ICollection<StatusChange> StatusHistory { get; set; } = new List<StatusChange>();
    public string Priority { get; set; } = "normal"; // "low", "normal", "high", "urgent"

    // Scheduling
    public DateTime StartDate { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? ArrivalWindowStart { get; set; }
    public DateTime? ArrivalWindowEnd { get; set; }
    public int? Duration { get; set; }
    public string? TimeZone { get; set; } // Important for recurring jobs
    public int EstimatedDurationMinutes { get; set; } // Renamed from DurationMinutes

    // Team Assignment
    public List<Guid> AssignedTeamMemberIds { get; set; } = new List<Guid>(); // More descriptive name
    public ICollection<Notes>? TeamNotes { get; set; }

    // Financials
    public string PaymentStatus { get; set; } = "unpaid"; // "unpaid", "partial", "paid", "refunded"
    public decimal DepositAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    // Communication Flags
    public bool SendInvoice { get; set; }
    public bool SendReminder { get; set; }
    public int ReminderDaysBefore { get; set; } = 1;
    public bool ConfirmationSent { get; set; }
    public bool ReminderSent { get; set; }
    public bool InvoiceSent { get; set; }

    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? Source { get; set; } // "web", "phone", "email", "walk-in", etc.
    public List<string> Tags { get; set; } = new List<string>(); // Changed from string to collection

    // Customer Instructions
    public string? CustomerNotes { get; set; }
    public string? InternalNotes { get; set; }
}