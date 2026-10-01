using WebAppSSR.Interfaces;

namespace WebAppSSR.Services
{
    public class ContactoService: IContactoService
    {
        private readonly Lock _gate = new();
        private readonly List<ContactSubmission> _items = [];

        public int Count
        {
            get
            {
                lock (_gate)
                {
                    return _items.Count;
                }
            }
        }

        public void Save(string fullName, string email, string message)
        {
            var submission = new ContactSubmission(fullName, email, message, DateTimeOffset.Now);
            lock (_gate)
            {
                _items.Add(submission);
            }
        }

    }
}
