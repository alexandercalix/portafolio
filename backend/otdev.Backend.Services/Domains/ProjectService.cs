using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public interface IProjectService
    {
        Task<PagedResult<PortfolioProject>> GetProjectsAsync(PaginationQueryRequest query, bool includeDrafts = false);
        Task<PortfolioProject?> GetProjectBySlugAsync(string slug, bool includeDrafts = false);
        Task<PortfolioProject?> GetProjectByIdAsync(string id);
        Task CreateProjectAsync(PortfolioProject project);
        Task UpdateProjectAsync(string id, PortfolioProject project);
        Task DeleteProjectAsync(string id);
    }

    public class ProjectService : IProjectService
    {
        private readonly IMongoCollection<PortfolioProject> _projectCollection;

        public ProjectService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _projectCollection = database.GetCollection<PortfolioProject>("PortfolioDB");
        }

        public async Task<PagedResult<PortfolioProject>> GetProjectsAsync(PaginationQueryRequest query, bool includeDrafts = false)
        {
            var builder = Builders<PortfolioProject>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrWhiteSpace(query.Tags))
            {
                var tagList = query.Tags.Split(',').Select(t => t.Trim()).ToList();
                filter &= builder.AnyIn(x => x.Technologies, tagList);
            }

            if (query.StartDate.HasValue) filter &= builder.Gte(x => x.CreatedAt, query.StartDate.Value);
            if (query.EndDate.HasValue) filter &= builder.Lte(x => x.CreatedAt, query.EndDate.Value);
            if (!includeDrafts) filter &= builder.Eq(x => x.IsPublished, true);

            var totalRecords = await _projectCollection.CountDocumentsAsync(filter);
            var totalPages = (int)Math.Ceiling((double)totalRecords / query.PageSize);

            var data = await _projectCollection.Find(filter)
                .SortByDescending(x => x.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Limit(query.PageSize)
                .ToListAsync();

            return new PagedResult<PortfolioProject>
            {
                Data = data,
                TotalRecords = totalRecords,
                CurrentPage = query.Page,
                TotalPages = totalPages
            };
        }

        public async Task<PortfolioProject?> GetProjectBySlugAsync(string slug, bool includeDrafts = false)
        {
            var filter = Builders<PortfolioProject>.Filter.Eq(x => x.Slug, slug);
            if (!includeDrafts) filter &= Builders<PortfolioProject>.Filter.Eq(x => x.IsPublished, true);
            return await _projectCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<PortfolioProject?> GetProjectByIdAsync(string id) =>
            await _projectCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateProjectAsync(PortfolioProject project) =>
            await _projectCollection.InsertOneAsync(project);

        public async Task UpdateProjectAsync(string id, PortfolioProject project) =>
            await _projectCollection.ReplaceOneAsync(x => x.Id == id, project);

        public async Task DeleteProjectAsync(string id) =>
            await _projectCollection.DeleteOneAsync(x => x.Id == id);
    }
}
