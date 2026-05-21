using Microsoft.Azure.Functions.Worker.Http;
using System;

namespace otdev.Backend.Models
{
    public class PaginationQueryRequest
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Tags { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public static PaginationQueryRequest FromRequest(HttpRequestData req)
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            return new PaginationQueryRequest
            {
                Page = int.TryParse(query["page"], out var p) && p > 0 ? p : 1,
                PageSize = int.TryParse(query["pageSize"], out var ps) && ps > 0 ? ps : 10,
                Tags = query["tags"],
                StartDate = DateTime.TryParse(query["startDate"], out var sd) ? sd : null,
                EndDate = DateTime.TryParse(query["endDate"], out var ed) ? ed : null
            };
        }
    }
}
