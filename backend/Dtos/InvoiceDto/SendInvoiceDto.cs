namespace backend.Dtos.InvoiceDto;

public class SendInvoiceDto
{
    public List<string> Recipients { get; set; } = [];
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool AttachPdf { get; set; } = true;
    public List<SendInvoiceAttachmentDto> Attachments { get; set; } = [];
}

public class SendInvoiceAttachmentDto
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";

    /// <summary>Raw base64 payload, without a data: URI prefix.</summary>
    public string Content { get; set; } = string.Empty;
}
