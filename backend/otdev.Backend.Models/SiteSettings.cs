using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace otdev.Backend.Models
{
    public class SiteSettings
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = "GlobalConfig";

        [BsonElement("siteName")]
        public string SiteName { get; set; } = string.Empty;

        [BsonElement("faviconUrl")]
        public string? FaviconUrl { get; set; }

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
