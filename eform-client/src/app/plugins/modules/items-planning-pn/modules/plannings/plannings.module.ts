import {NgModule} from '@angular/core';
import {
  PlanningCreateComponent,
  PlanningEditComponent,
  PlanningsContainerComponent,
  PlanningAssignSitesModalComponent,
  PlanningDeleteComponent,
  PlanningFoldersModalComponent,
  PlanningMultipleDeleteComponent,
  PlanningsBulkImportModalComponent,
  PlanningsHeaderComponent,
  PlanningsTableComponent,
  PlanningTagsComponent,
} from './components';
import {PlanningsRouting} from './plannings.routing';

@NgModule({
    imports: [
        PlanningsRouting,
        PlanningCreateComponent,
        PlanningEditComponent,
        PlanningsContainerComponent,
        PlanningAssignSitesModalComponent,
        PlanningDeleteComponent,
        PlanningFoldersModalComponent,
        PlanningMultipleDeleteComponent,
        PlanningsBulkImportModalComponent,
        PlanningsHeaderComponent,
        PlanningsTableComponent,
        PlanningTagsComponent,
    ],
    exports: [
        PlanningTagsComponent
    ]
})
export class PlanningsModule {
}
