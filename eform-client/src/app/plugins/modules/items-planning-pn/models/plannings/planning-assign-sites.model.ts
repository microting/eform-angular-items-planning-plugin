export class PlanningAssignSitesModel {
  planningId: number;
  assignments: PlanningAssignmentSiteModel[] = [];
}

export class PlanningAssignmentSiteModel {
  id: number;
  isChecked: boolean;
}
