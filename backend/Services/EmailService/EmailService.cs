using Resend;

namespace backend.Services.EmailService;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IResend _resend;

    public EmailService(IConfiguration configuration, IResend resend)
    {
        _configuration = configuration;
        _resend = resend;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["AppSettings:Resend:ApiToken"]) &&
        !string.IsNullOrWhiteSpace(_configuration["AppSettings:Resend:SenderEmail"]);

    public Task<EmailSendResult> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
        => SendEmailAsync([toEmail], subject, plainTextContent, htmlContent, null);

    public async Task<EmailSendResult> SendEmailAsync(
        IEnumerable<string> toEmails,
        string subject,
        string plainTextContent,
        string htmlContent,
        IEnumerable<EmailAttachment>? attachments = null)
    {
        var recipients = toEmails?
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? [];

        if (recipients.Count == 0)
        {
            return EmailSendResult.Failed("No recipients were supplied.");
        }

        if (!IsConfigured)
        {
            return EmailSendResult.Failed("Resend is not configured (missing API token or sender address).");
        }

        var senderEmail = _configuration["AppSettings:Resend:SenderEmail"];
        var senderName = _configuration["AppSettings:Resend:SenderName"];

        var message = new EmailMessage
        {
            From = new EmailAddress { Email = senderEmail!, DisplayName = senderName },
            Subject = subject,
            TextBody = plainTextContent,
            HtmlBody = htmlContent,
        };

        foreach (var recipient in recipients)
        {
            message.To.Add(recipient);
        }

        if (attachments != null)
        {
            message.Attachments = attachments
                .Select(a => new Resend.EmailAttachment
                {
                    Filename = a.FileName,
                    Content = a.Content,
                    ContentType = a.ContentType,
                })
                .ToList();
        }

        var response = await _resend.EmailSendAsync(message);

        if (!response.Success)
        {
            var reason = response.Exception?.Message ?? "Unknown error";
            Console.WriteLine($"Failed to send email via Resend: {reason}");
            return EmailSendResult.Failed(reason);
        }

        return EmailSendResult.Ok;
    }
}
