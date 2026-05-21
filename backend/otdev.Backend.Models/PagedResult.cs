using System.Collections.Generic;

namespace otdev.Backend.Models
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public long TotalRecords { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }
}
