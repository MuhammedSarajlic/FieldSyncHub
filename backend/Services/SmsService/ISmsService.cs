namespace backend.Services.SmsService;

public interface ISmsService
{
    bool IsConfigured { get; }
    Task<bool> SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
}
