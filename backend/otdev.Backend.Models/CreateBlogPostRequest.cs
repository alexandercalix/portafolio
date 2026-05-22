using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class CreateBlogPostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Excerpt { get; set; }
        public string? Category { get; set; }
        public List<string> Tags { get; set; } = new();
        public List<string> Technologies { get; set; } = new();
        public AuthorProfile? Author { get; set; }
        public bool? IsPublished { get; set; }
    }
}
