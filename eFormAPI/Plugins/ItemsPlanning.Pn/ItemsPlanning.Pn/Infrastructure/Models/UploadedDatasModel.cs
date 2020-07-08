using System.Collections.Generic;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
    public class UploadedDatasModel
    {
        public int Total { get; set; }
        public List<UploadedDataModel> UploadedDatas { get; set; } 
            = new List<UploadedDataModel>();
    }
}