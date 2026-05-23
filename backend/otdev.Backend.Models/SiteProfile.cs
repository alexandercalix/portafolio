using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class SiteProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("headline")]
        public string Headline { get; set; } = string.Empty;

        [BsonElement("bio")]
        public string Bio { get; set; } = string.Empty;

        [BsonElement("currentFocus")]
        public string CurrentFocus { get; set; } = string.Empty;

        [BsonElement("systemCapabilities")]
        public List<string> SystemCapabilities { get; set; } = new List<string>();

        [BsonElement("avatarUrl")]
        public string? AvatarUrl { get; set; }

        [BsonElement("resumeUrl")]
        public string? ResumeUrl { get; set; }

        [BsonElement("githubUrl")]
        public string? GithubUrl { get; set; }

        [BsonElement("linkedInUrl")]
        public string? LinkedInUrl { get; set; }

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("experiences")]
        public List<Experience> Experiences { get; set; } = new List<Experience>();

        [BsonElement("educations")]
        public List<Education> Educations { get; set; } = new List<Education>();
    }
}
