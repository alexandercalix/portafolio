using otdev.Backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace otdev.Backend.Services
{
    public interface IMongoService
    {
        Task<PagedResult<BlogPost>> GetBlogPostsAsync(PaginationQueryRequest query, bool includeDrafts = false);
        Task<BlogPost?> GetBlogPostBySlugAsync(string slug, bool includeDrafts = false);
        Task<BlogPost?> GetBlogPostByIdAsync(string id);
        Task CreateBlogPostAsync(BlogPost post);
        Task UpdateBlogPostAsync(string id, BlogPost post);
        Task DeleteBlogPostAsync(string id);

        Task<PagedResult<PortfolioProject>> GetProjectsAsync(PaginationQueryRequest query, bool includeDrafts = false);
        Task<PortfolioProject?> GetProjectBySlugAsync(string slug, bool includeDrafts = false);
        Task<PortfolioProject?> GetProjectByIdAsync(string id);
        Task CreateProjectAsync(PortfolioProject project);
        Task UpdateProjectAsync(string id, PortfolioProject project);
        Task DeleteProjectAsync(string id);

        Task<SiteProfile?> GetProfileAsync();
        Task UpsertProfileAsync(SiteProfile profile);
    }
}
