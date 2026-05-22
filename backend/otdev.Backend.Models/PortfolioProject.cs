using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class PortfolioProject
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("slug")]
        public string Slug { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("technologyStack")]
        public List<string> TechnologyStack { get; set; } = new();

        [BsonElement("role")]
        public string? Role { get; set; }

        [BsonElement("liveUrl")]
        public string? LiveUrl { get; set; }

        [BsonElement("repositoryUrl")]
        public string? RepositoryUrl { get; set; }

        [BsonElement("images")]
        public List<string> Images { get; set; } = new();

        [BsonElement("technologies")]
        public List<string> Technologies { get; set; } = new();

        [BsonElement("author")]
        public AuthorProfile? Author { get; set; }

        [BsonElement("createdAt")]
        public System.DateTime CreatedAt { get; set; } = System.DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public System.DateTime? UpdatedAt { get; set; }

        [BsonElement("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }

        [BsonElement("excerpt")]
        public string? Excerpt { get; set; }

        [BsonElement("isPublished")]
        public bool IsPublished { get; set; } = false;

        [BsonElement("publishedAt")]
        public System.DateTime? PublishedAt { get; set; }
    }
}
