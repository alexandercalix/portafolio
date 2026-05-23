using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public interface IContactMessageService
    {
        Task<PagedResult<ContactSubmission>> GetContactMessagesAsync(PaginationQueryRequest query, string? status = null);
        Task UpdateContactMessageStatusAsync(string id, string status);
        Task DeleteContactMessageAsync(string id);
    }

    public class ContactMessageService : IContactMessageService
    {
        private readonly IMongoCollection<ContactSubmission> _contactCollection;

        public ContactMessageService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _contactCollection = database.GetCollection<ContactSubmission>("ContactSubmissions");
        }

        public async Task<PagedResult<ContactSubmission>> GetContactMessagesAsync(PaginationQueryRequest query, string? status = null)
        {
            var builder = Builders<ContactSubmission>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrEmpty(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                filter &= builder.Eq(x => x.Status, status);
            }

            var totalRecords = await _contactCollection.CountDocumentsAsync(filter);
            var totalPages = (int)Math.Ceiling((double)totalRecords / query.PageSize);

            var data = await _contactCollection.Find(filter)
                .SortByDescending(x => x.SubmittedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Limit(query.PageSize)
                .ToListAsync();

            return new PagedResult<ContactSubmission>
            {
                Data = data,
                TotalRecords = totalRecords,
                CurrentPage = query.Page,
                TotalPages = totalPages
            };
        }

        public async Task UpdateContactMessageStatusAsync(string id, string status)
        {
            var update = Builders<ContactSubmission>.Update.Set(x => x.Status, status);
            await _contactCollection.UpdateOneAsync(x => x.Id == id, update);
        }

        public async Task DeleteContactMessageAsync(string id) =>
            await _contactCollection.DeleteOneAsync(x => x.Id == id);
    }
}
