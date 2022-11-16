import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanningCasePageComponent} from './planning-case-page/planning-case-page.component';

const routes: Routes = [
  {path: ':id/:templateId/:planningId/:dateFrom/:dateTo', component: PlanningCasePageComponent},
  {path: ':id', component: PlanningCasePageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningCaseRouting { }
