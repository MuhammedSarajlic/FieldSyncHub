namespace backend.Services.EmailService;

public record EmailAttachment(string FileName, string ContentType, byte[] Content);

public record EmailSendResult(bool Success, string? Error = null)
{
    public static readonly EmailSendResult Ok = new(true);
    public static EmailSendResult Failed(string error) => new(false, error);
}

public interface IEmailService
{
    /// <summary>False when no Resend API token is configured, so callers can say so plainly.</summary>
    bool IsConfigured { get; }

    Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent);

    Task<EmailSendResult> SendEmailAsync(
        IEnumerable<string> toEmails,
        string subject,
        string plainTextContent,
        string htmlContent,
        IEnumerable<EmailAttachment>? attachments = null);
}
