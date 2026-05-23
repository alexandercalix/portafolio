using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace otdev.Backend.Models
{
    public class ContactSubmission
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("subject")]
        public string Subject { get; set; } = string.Empty;

        [BsonElement("message")]
        public string Message { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Unread";

        [BsonElement("submittedAt")]
        public DateTime SubmittedAt { get; set; }
    }
}
