namespace ItemsPlanning.Pn.Infrastructure.Models
{
    using System.Collections.Generic;

    public class PlanningAssignSitesModel
    {
        public int PlanningId { get; set; }

        public List<PlanningAssignmentSiteModel> Assignments { get; set; }
            = new List<PlanningAssignmentSiteModel>();
    }
}