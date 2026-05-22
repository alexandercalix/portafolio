using MongoDB.Bson;
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
        private readonly IMongoCollection<SiteProfile> _profileCollection;

        public MongoService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME");
            if (string.IsNullOrEmpty(databaseName)) databaseName = "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _blogCollection = database.GetCollection<BlogPost>("BlogPosts");
            _projectCollection = database.GetCollection<PortfolioProject>("PortfolioDB");
            _profileCollection = database.GetCollection<SiteProfile>("SiteProfile");
        }

        public async Task<PagedResult<BlogPost>> GetBlogPostsAsync(PaginationQueryRequest query, bool includeDrafts = false)
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

            if (!includeDrafts)
            {
                filter &= builder.Eq(x => x.IsPublished, true);
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

        public async Task<BlogPost?> GetBlogPostBySlugAsync(string slug, bool includeDrafts = false)
        {
            var filter = Builders<BlogPost>.Filter.Eq(x => x.Slug, slug);
            if (!includeDrafts)
            {
                filter &= Builders<BlogPost>.Filter.Eq(x => x.IsPublished, true);
            }
            return await _blogCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<BlogPost?> GetBlogPostByIdAsync(string id) =>
            await _blogCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateBlogPostAsync(BlogPost post) =>
            await _blogCollection.InsertOneAsync(post);

        public async Task UpdateBlogPostAsync(string id, BlogPost post) =>
            await _blogCollection.ReplaceOneAsync(x => x.Id == id, post);

        public async Task DeleteBlogPostAsync(string id) =>
            await _blogCollection.DeleteOneAsync(x => x.Id == id);

        public async Task<PagedResult<PortfolioProject>> GetProjectsAsync(PaginationQueryRequest query, bool includeDrafts = false)
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

            if (!includeDrafts)
            {
                filter &= builder.Eq(x => x.IsPublished, true);
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

        public async Task<PortfolioProject?> GetProjectBySlugAsync(string slug, bool includeDrafts = false)
        {
            var filter = Builders<PortfolioProject>.Filter.Eq(x => x.Slug, slug);
            if (!includeDrafts)
            {
                filter &= Builders<PortfolioProject>.Filter.Eq(x => x.IsPublished, true);
            }
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
