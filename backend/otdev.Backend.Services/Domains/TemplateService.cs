using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public class TemplateService : ITemplateService
    {
        private readonly IMongoCollection<EmailTemplate> _templateCollection;

        public TemplateService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _templateCollection = database.GetCollection<EmailTemplate>("EmailTemplates");
        }

        public async Task<EmailTemplate?> GetTemplateAsync(string id)
        {
            return await _templateCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
        }

        public async Task UpsertTemplateAsync(EmailTemplate template)
        {
            var filter = Builders<EmailTemplate>.Filter.Eq(t => t.Id, template.Id);
            var options = new ReplaceOptions { IsUpsert = true };
            await _templateCollection.ReplaceOneAsync(filter, template, options);
        }
    }
}
