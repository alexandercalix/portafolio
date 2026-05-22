using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class CreateProjectRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public string? Url { get; set; }
        public string? GithubUrl { get; set; }
        public List<string> Technologies { get; set; } = new();
        public AuthorProfile? Author { get; set; }
        public bool? IsPublished { get; set; }
    }
}
