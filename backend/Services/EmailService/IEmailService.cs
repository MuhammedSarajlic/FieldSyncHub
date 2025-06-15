namespace backend.Services.EmailService;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent);
}
