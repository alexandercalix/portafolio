using MongoDB.Bson;
using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public interface IProfileService
    {
        Task<SiteProfile?> GetProfileAsync();
        Task UpsertProfileAsync(SiteProfile profile);
    }

    public class ProfileService : IProfileService
    {
        private readonly IMongoCollection<SiteProfile> _profileCollection;

        public ProfileService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _profileCollection = database.GetCollection<SiteProfile>("SiteProfile");
        }

        public async Task<SiteProfile?> GetProfileAsync() =>
            await _profileCollection.Find(Builders<SiteProfile>.Filter.Empty).FirstOrDefaultAsync();

        public async Task UpsertProfileAsync(SiteProfile profile)
        {
            var existingProfile = await GetProfileAsync();
            if (existingProfile != null)
            {
                profile.Id = existingProfile.Id;
            }
            else if (string.IsNullOrEmpty(profile.Id))
            {
                profile.Id = ObjectId.GenerateNewId().ToString();
            }

            var filter = Builders<SiteProfile>.Filter.Eq(x => x.Id, profile.Id);
            await _profileCollection.ReplaceOneAsync(filter, profile, new ReplaceOptions { IsUpsert = true });
        }
    }
}
