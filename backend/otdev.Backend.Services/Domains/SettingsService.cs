using MongoDB.Driver;
using otdev.Backend.Models;
using System.Threading.Tasks;
using System;

namespace otdev.Backend.Services.Domains
{
    public class SettingsService : ISettingsService
    {
        private readonly IMongoCollection<SiteSettings> _settingsCollection;

        public SettingsService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _settingsCollection = database.GetCollection<SiteSettings>("SiteSettings");
        }

        public async Task<SiteSettings> GetSettingsAsync()
        {
            var settings = await _settingsCollection.Find(x => x.Id == "GlobalConfig").FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new SiteSettings
                {
                    Id = "GlobalConfig",
                    SiteName = "My Portfolio",
                    FaviconUrl = null,
                    UpdatedAt = DateTime.UtcNow
                };
            }
            return settings;
        }

        public async Task UpsertSettingsAsync(SiteSettings settings)
        {
            settings.Id = "GlobalConfig"; // Enforce singleton
            settings.UpdatedAt = DateTime.UtcNow;

            var filter = Builders<SiteSettings>.Filter.Eq(s => s.Id, settings.Id);
            await _settingsCollection.ReplaceOneAsync(
                filter,
                settings,
                new ReplaceOptions { IsUpsert = true }
            );
        }
    }
}
