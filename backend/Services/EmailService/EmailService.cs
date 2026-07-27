using SendGrid;
using SendGrid.Helpers.Mail;

namespace backend.Services.EmailService;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["AppSettings:SendGrid:ApiKey"]) &&
        !string.IsNullOrWhiteSpace(_configuration["AppSettings:SendGrid:SenderEmail"]);

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
            .Select(e => new EmailAddress(e.Trim()))
            .ToList() ?? [];

        if (recipients.Count == 0)
        {
            Console.WriteLine("Email not sent: no recipients supplied.");
            return false;
        }

        var apiKey = _configuration["AppSettings:SendGrid:ApiKey"];
        var senderEmail = _configuration["AppSettings:SendGrid:SenderEmail"];
        var senderName = _configuration["AppSettings:SendGrid:SenderName"];

        if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(senderEmail))
        {
            Console.WriteLine("Email not sent: SendGrid is not configured.");
            return false;
        }

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(senderEmail, senderName);

        // showAllRecipients: false gives each recipient their own copy so they
        // cannot see the other addresses on the send.
        var msg = MailHelper.CreateSingleEmailToMultipleRecipients(
            from, recipients, subject, plainTextContent, htmlContent, showAllRecipients: false);

        if (attachments != null)
        {
            foreach (var attachment in attachments)
            {
                msg.AddAttachment(
                    attachment.FileName,
                    Convert.ToBase64String(attachment.Content),
                    attachment.ContentType);
            }
        }

        var response = await client.SendEmailAsync(msg);

        if (response.StatusCode != System.Net.HttpStatusCode.Accepted &&
            response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            var errorBody = await response.Body.ReadAsStringAsync();
            Console.WriteLine($"Failed to send email. Status: {response.StatusCode}, Body: {errorBody}");
            return false;
        }

        return true;
    }
}
