using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace otdev.Backend.Models
{
    public class EmailTemplate
    {
        [BsonId]
        public string? Id { get; set; }

        [BsonElement("markdownBody")]
        public string MarkdownBody { get; set; } = string.Empty;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
