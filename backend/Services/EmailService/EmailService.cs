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

    public Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
        => SendEmailAsync([toEmail], subject, plainTextContent, htmlContent, null);

    public async Task<bool> SendEmailAsync(
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
            Console.WriteLine("Email not sent: no recipients supplied.");
            return false;
        }

        if (!IsConfigured)
        {
            Console.WriteLine("Email not sent: Resend is not configured.");
            return false;
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
            Console.WriteLine($"Failed to send email via Resend: {response.Exception?.Message}");
            return false;
        }

        return true;
    }
}
