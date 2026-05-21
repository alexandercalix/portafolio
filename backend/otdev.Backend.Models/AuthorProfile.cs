using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class AuthorProfile
    {
        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("profilePicUrl")]
        public string? ProfilePicUrl { get; set; }

        [BsonElement("bio")]
        public string? Bio { get; set; }

        [BsonElement("links")]
        public Dictionary<string, string>? Links { get; set; }
    }
}
