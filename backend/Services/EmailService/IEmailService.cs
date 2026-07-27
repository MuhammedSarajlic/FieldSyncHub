namespace backend.Services.EmailService;

public record EmailAttachment(string FileName, string ContentType, byte[] Content);

public interface IEmailService
{
    /// <summary>False when no SendGrid credentials are present, so callers can say so plainly.</summary>
    bool IsConfigured { get; }

    Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent);

    Task<bool> SendEmailAsync(
        IEnumerable<string> toEmails,
        string subject,
        string plainTextContent,
        string htmlContent,
        IEnumerable<EmailAttachment>? attachments = null);
}
