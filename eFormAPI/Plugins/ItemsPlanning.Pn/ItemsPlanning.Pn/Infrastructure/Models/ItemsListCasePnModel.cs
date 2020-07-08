using System.Collections.Generic;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
    public class ItemsListCasePnModel
    {
        public int Total { get; set; }
        public List<ItemsListPnItemCaseModel> Items { get; set; }
            = new List<ItemsListPnItemCaseModel>();
    }
}