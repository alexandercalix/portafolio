using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace otdev.Backend.Models
{
    public class MediaAsset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("url")]
        public string Url { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Orphaned"; // "Orphaned" or "Linked"

        [BsonElement("associatedEntityId")]
        public string? AssociatedEntityId { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
