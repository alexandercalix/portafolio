using System.IO;
using System.Threading.Tasks;

namespace otdev.Backend.Services
{
    public interface IR2Service
    {
        Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType);
        Task DeleteImageAsync(string imageUrl);
    }
}
