namespace otdev.Backend.Models
{
    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Headline { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? GithubUrl { get; set; }
        public string? LinkedInUrl { get; set; }
    }
}
