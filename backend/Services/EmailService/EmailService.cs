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

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent)
    {
        var apiKey = _configuration["AppSettings:SendGrid:ApiKey"];
        var senderEmail = _configuration["AppSettings:SendGrid:SenderEmail"];
        var senderName = _configuration["AppSettings:SendGrid:SenderName"];

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(senderEmail, senderName);
        var to = new EmailAddress(toEmail);
        var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

        var response = await client.SendEmailAsync(msg);

        if (response.StatusCode != System.Net.HttpStatusCode.Accepted &&
            response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            var errorBody = await response.Body.ReadAsStringAsync();
            Console.WriteLine($"Failed to send invite. Status: {response.StatusCode}, Body: {errorBody}");
            return false;
        }

        Console.WriteLine("Invitation email sent successfully.");
        return true;
    }
}
