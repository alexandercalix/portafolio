using System;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace otdev.Backend.Models
{
    public class Experience
    {
        [BsonElement("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("jobTitle")]
        public string JobTitle { get; set; } = string.Empty;

        [BsonElement("company")]
        public string Company { get; set; } = string.Empty;

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; }

        [BsonElement("endDate")]
        public DateTime? EndDate { get; set; }

        [BsonElement("isCurrent")]
        public bool IsCurrent { get; set; }

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("technologies")]
        public List<string> Technologies { get; set; } = new List<string>();
    }
}
