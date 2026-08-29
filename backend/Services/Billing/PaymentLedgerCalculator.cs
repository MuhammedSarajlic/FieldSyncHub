using backend.Models;

namespace backend.Services.Billing;

public static class PaymentLedgerCalculator
{
    public static decimal CalculateAmountPaid(IEnumerable<Payment>? payments)
        => RoundMoney((payments ?? [])
            .Where(payment => payment.Status == PaymentRecordStatus.Succeeded)
            .Sum(payment => payment.Amount));

    public static decimal CalculateBalanceDue(decimal invoiceTotal, IEnumerable<Payment>? payments)
        => RoundMoney(invoiceTotal - CalculateAmountPaid(payments));

    public static InvoiceStatus DeriveInvoiceStatus(InvoiceStatus workflowStatus, decimal balanceDue, decimal amountPaid, DateTime dueDate, DateTime nowUtc)
    {
        if (balanceDue <= 0m)
        {
            return InvoiceStatus.Paid;
        }

        if (workflowStatus == InvoiceStatus.Draft)
        {
            return InvoiceStatus.Draft;
        }

        if (dueDate.Date < nowUtc.Date)
        {
            return InvoiceStatus.Overdue;
        }

        if (amountPaid > 0m)
        {
            return InvoiceStatus.Partial;
        }

        return InvoiceStatus.Sent;
    }

    public static InvoiceStatus NormalizeWorkflowStatus(InvoiceStatus status)
        => status == InvoiceStatus.Draft ? InvoiceStatus.Draft : InvoiceStatus.Sent;

    private static decimal RoundMoney(decimal amount)
        => Math.Round(amount, 2, MidpointRounding.AwayFromZero);
}
