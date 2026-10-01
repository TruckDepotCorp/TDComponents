namespace WebAppSSR.Interfaces
{
    public interface IContactoService
    {
        int Count { get; }

        void Save(string fullName, string email, string message);
    }
}
