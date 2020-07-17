using System;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
    public class PlanningCasesPnRequestModel
    {
        public string NameFilter { get; set; }
        public string Sort { get; set; }
        public int PageIndex { get; set; }
        public int Offset { get; set; }
        public bool IsSortDsc { get; set; }
        public int PageSize { get; set; }
        public int PlanningId { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}