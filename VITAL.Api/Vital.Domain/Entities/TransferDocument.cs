namespace Vital.Domain.Entities;

public class TransferDocument
{
    public Guid Id { get; set; }
    public Guid TransferRequestId { get; set; }
    public OwnershipTransferRequest TransferRequest { get; set; } = null!;
    public string OriginalName { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string DocumentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
