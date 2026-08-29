using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos.InvoiceDto;

public class RecordInvoicePaymentDto
{
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Other;
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public string? Note { get; set; }
}
