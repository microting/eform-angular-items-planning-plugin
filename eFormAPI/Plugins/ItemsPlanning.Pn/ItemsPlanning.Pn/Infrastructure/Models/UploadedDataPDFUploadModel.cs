using Microsoft.AspNetCore.Http;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
    public class UploadedDataPDFUploadModel
    {
        public IFormFile File { get; set; }
        public int ItemCaseId { get; set; }
        
    }
}