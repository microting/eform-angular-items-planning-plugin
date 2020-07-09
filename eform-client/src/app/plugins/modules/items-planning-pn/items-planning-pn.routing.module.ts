import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminGuard, AuthGuard, PermissionGuard} from 'src/app/common/guards';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {
  PlanningsPageComponent,
  ItemsPlanningSettingsComponent,
  ReportGeneratorContainerComponent,
  PlanningCasePageComponent,
  PlanningCaseResultPageComponent,
  PlanningCaseUploadedDataComponent,
  PlanningUnitImportComponent, PlanningEditComponent, PlanningCreateComponent
} from './components';
import {ItemsPlanningPnClaims} from './enums';

export const routes: Routes = [
  {
    path: '',
    component: ItemsPlanningPnLayoutComponent,
    canActivate: [PermissionGuard],
    data: {requiredPermission: ItemsPlanningPnClaims.accessItemsPlanningPlugin},
    children: [
      {
        path: 'lists',
        canActivate: [AuthGuard],
        component: PlanningsPageComponent
      },
      {
        path: 'lists/edit/:id',
        canActivate: [AuthGuard],
        component: PlanningEditComponent
      },
      {
        path: 'lists/create',
        canActivate: [AuthGuard],
        component: PlanningCreateComponent
      },
      {
        path: 'item-cases/:id',
        canActivate: [AuthGuard],
        component: PlanningCasePageComponent
      },
      {
        path: 'item-itemCase-results/:id',
        canActivate: [AuthGuard],
        component: PlanningCaseResultPageComponent
      },
      {
        path: 'settings',
        canActivate: [AdminGuard],
        component: ItemsPlanningSettingsComponent
      },
      {
        path: 'reports',
        canActivate: [AdminGuard],
        component: ReportGeneratorContainerComponent
      },
      {
        path: 'item-cases/:id/:id',
        canActivate: [AdminGuard],
        component: PlanningCaseUploadedDataComponent
      },
      {
        path: 'import',
        canActivate: [AdminGuard],
        component: PlanningUnitImportComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsPlanningPnRouting { }
