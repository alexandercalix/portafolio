using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Headline { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? GithubUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public List<Experience> Experiences { get; set; } = new List<Experience>();
        public List<Education> Educations { get; set; } = new List<Education>();
    }
}
