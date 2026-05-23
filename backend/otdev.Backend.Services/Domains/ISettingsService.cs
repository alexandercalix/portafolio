using System.Threading.Tasks;
using otdev.Backend.Models;

namespace otdev.Backend.Services.Domains
{
    public interface ISettingsService
    {
        Task<SiteSettings> GetSettingsAsync();
        Task UpsertSettingsAsync(SiteSettings settings);
    }
}
