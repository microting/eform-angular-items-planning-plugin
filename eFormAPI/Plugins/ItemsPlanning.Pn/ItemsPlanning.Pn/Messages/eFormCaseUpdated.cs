namespace ItemsPlanning.Pn.Messages
{
    // ReSharper disable once InconsistentNaming
    public class eFormCaseUpdated
    {
        public int caseId { get; protected set; }

        public eFormCaseUpdated(int caseId)
        {
            this.caseId = caseId;
        }
    }
}