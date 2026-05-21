using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace otdev.Backend.Services
{
    /// <summary>
    /// Service for handling MongoDB database operations for Blog Posts and Portfolio Projects.
    /// </summary>
    public class MongoService : IMongoService
    {
        private readonly IMongoCollection<BlogPost> _blogCollection;
        private readonly IMongoCollection<PortfolioProject> _projectCollection;

        public MongoService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME");
            if (string.IsNullOrEmpty(databaseName)) databaseName = "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _blogCollection = database.GetCollection<BlogPost>("BlogPosts");
            _projectCollection = database.GetCollection<PortfolioProject>("PortfolioDB");
        }

        public async Task<PagedResult<BlogPost>> GetBlogPostsAsync(PaginationQueryRequest query)
        {
            var builder = Builders<BlogPost>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrWhiteSpace(query.Tags))
            {
                var tagList = query.Tags.Split(',').Select(t => t.Trim()).ToList();
                filter &= builder.AnyIn(x => x.Technologies, tagList);
            }

            if (query.StartDate.HasValue)
            {
                filter &= builder.Gte(x => x.CreatedAt, query.StartDate.Value);
            }

            if (query.EndDate.HasValue)
            {
                filter &= builder.Lte(x => x.CreatedAt, query.EndDate.Value);
            }

            var totalRecords = await _blogCollection.CountDocumentsAsync(filter);
            var totalPages = (int)Math.Ceiling((double)totalRecords / query.PageSize);

            var data = await _blogCollection.Find(filter)
                .SortByDescending(x => x.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Limit(query.PageSize)
                .ToListAsync();

            return new PagedResult<BlogPost>
            {
                Data = data,
                TotalRecords = totalRecords,
                CurrentPage = query.Page,
                TotalPages = totalPages
            };
        }

        public async Task<BlogPost?> GetBlogPostBySlugAsync(string slug) =>
            await _blogCollection.Find(x => x.Slug == slug).FirstOrDefaultAsync();

        public async Task<BlogPost?> GetBlogPostByIdAsync(string id) =>
            await _blogCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateBlogPostAsync(BlogPost post) =>
            await _blogCollection.InsertOneAsync(post);

        public async Task UpdateBlogPostAsync(string id, BlogPost post) =>
            await _blogCollection.ReplaceOneAsync(x => x.Id == id, post);

        public async Task DeleteBlogPostAsync(string id) =>
            await _blogCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<PagedResult<PortfolioProject>> GetProjectsAsync(PaginationQueryRequest query)
        {
            var builder = Builders<PortfolioProject>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrWhiteSpace(query.Tags))
            {
                var tagList = query.Tags.Split(',').Select(t => t.Trim()).ToList();
                filter &= builder.AnyIn(x => x.Technologies, tagList);
            }

            if (query.StartDate.HasValue)
            {
                filter &= builder.Gte(x => x.CreatedAt, query.StartDate.Value);
            }

            if (query.EndDate.HasValue)
            {
                filter &= builder.Lte(x => x.CreatedAt, query.EndDate.Value);
            }

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

        public async Task<PortfolioProject?> GetProjectBySlugAsync(string slug) =>
            await _projectCollection.Find(x => x.Slug == slug).FirstOrDefaultAsync();

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
