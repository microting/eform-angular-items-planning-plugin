using System.Collections.Generic;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
    public class PlanningCasesModel
    {
        public int Total { get; set; }
        public List<PlanningItemCaseModel> Items { get; set; }
            = new List<PlanningItemCaseModel>();
    }
}