using System;
using MongoDB.Bson.Serialization.Attributes;

namespace otdev.Backend.Models
{
    public class Education
    {
        [BsonElement("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("degreeOrCertificate")]
        public string DegreeOrCertificate { get; set; } = string.Empty;

        [BsonElement("institution")]
        public string Institution { get; set; } = string.Empty;

        [BsonElement("dateObtained")]
        public DateTime DateObtained { get; set; }

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;
    }
}
