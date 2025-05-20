using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services.EmailService
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string toEmail, string subject, string plainTextContent, string htmlContent);
    }
}
