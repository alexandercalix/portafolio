using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public interface IMediaService
    {
        Task InsertMediaAssetAsync(MediaAsset asset);
        Task UpdateMediaAssetsStatusByUrlsAsync(List<string> urls, string status, string? associatedEntityId);
        Task MarkMissingMediaAsOrphanedAsync(string associatedEntityId, List<string> currentUrls);
        Task<List<MediaAsset>> GetOrphanedMediaAsync(DateTime beforeDate);
        Task DeleteMediaAssetAsync(string id);
    }

    public class MediaService : IMediaService
    {
        private readonly IMongoCollection<MediaAsset> _mediaCollection;

        public MediaService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _mediaCollection = database.GetCollection<MediaAsset>("MediaAssets");
        }

        public async Task InsertMediaAssetAsync(MediaAsset asset)
        {
            await _mediaCollection.InsertOneAsync(asset);
        }

        public async Task UpdateMediaAssetsStatusByUrlsAsync(List<string> urls, string status, string? associatedEntityId)
        {
            if (urls == null || !urls.Any()) return;

            var filter = Builders<MediaAsset>.Filter.In(x => x.Url, urls);
            var update = Builders<MediaAsset>.Update
                .Set(x => x.Status, status)
                .Set(x => x.AssociatedEntityId, associatedEntityId);

            await _mediaCollection.UpdateManyAsync(filter, update);
        }

        public async Task MarkMissingMediaAsOrphanedAsync(string associatedEntityId, List<string> currentUrls)
        {
            var filter = Builders<MediaAsset>.Filter.And(
                Builders<MediaAsset>.Filter.Eq(x => x.AssociatedEntityId, associatedEntityId),
                Builders<MediaAsset>.Filter.Nin(x => x.Url, currentUrls)
            );

            var update = Builders<MediaAsset>.Update
                .Set(x => x.Status, "Orphaned")
                .Set(x => x.AssociatedEntityId, null);

            await _mediaCollection.UpdateManyAsync(filter, update);
        }

        public async Task<List<MediaAsset>> GetOrphanedMediaAsync(DateTime beforeDate)
        {
            var filter = Builders<MediaAsset>.Filter.And(
                Builders<MediaAsset>.Filter.Eq(x => x.Status, "Orphaned"),
                Builders<MediaAsset>.Filter.Lt(x => x.CreatedAt, beforeDate)
            );

            return await _mediaCollection.Find(filter).ToListAsync();
        }

        public async Task DeleteMediaAssetAsync(string id)
        {
            await _mediaCollection.DeleteOneAsync(x => x.Id == id);
        }
    }
}
