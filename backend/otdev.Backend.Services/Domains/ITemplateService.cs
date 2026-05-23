using System.Threading.Tasks;
using otdev.Backend.Models;

namespace otdev.Backend.Services.Domains
{
    public interface ITemplateService
    {
        Task<EmailTemplate?> GetTemplateAsync(string id);
        Task UpsertTemplateAsync(EmailTemplate template);
    }
}
