import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
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
    MatDialogModule,
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
