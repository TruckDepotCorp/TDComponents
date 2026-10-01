namespace WebAppSSR.Services;

public sealed record ContactSubmission(string FullName, string Email, string Message, DateTimeOffset ReceivedAt);
