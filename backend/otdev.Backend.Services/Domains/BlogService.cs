using MongoDB.Driver;
using otdev.Backend.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace otdev.Backend.Services.Domains
{
    public interface IBlogService
    {
        Task<PagedResult<BlogPost>> GetBlogPostsAsync(PaginationQueryRequest query, bool includeDrafts = false);
        Task<BlogPost?> GetBlogPostBySlugAsync(string slug, bool includeDrafts = false);
        Task<BlogPost?> GetBlogPostByIdAsync(string id);
        Task CreateBlogPostAsync(BlogPost post);
        Task UpdateBlogPostAsync(string id, BlogPost post);
        Task DeleteBlogPostAsync(string id);
    }

    public class BlogService : IBlogService
    {
        private readonly IMongoCollection<BlogPost> _blogCollection;

        public BlogService(IMongoClient mongoClient)
        {
            var databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
            var database = mongoClient.GetDatabase(databaseName);
            _blogCollection = database.GetCollection<BlogPost>("BlogPosts");
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

            if (query.StartDate.HasValue) filter &= builder.Gte(x => x.CreatedAt, query.StartDate.Value);
            if (query.EndDate.HasValue) filter &= builder.Lte(x => x.CreatedAt, query.EndDate.Value);
            if (!includeDrafts) filter &= builder.Eq(x => x.IsPublished, true);

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
            if (!includeDrafts) filter &= Builders<BlogPost>.Filter.Eq(x => x.IsPublished, true);
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
    }
}
