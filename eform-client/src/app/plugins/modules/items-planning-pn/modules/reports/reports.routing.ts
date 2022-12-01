import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from 'src/app/common/guards';
import {ReportContainerComponent} from './components';
import {ItemsPlanningPnClaims} from 'src/app/plugins/modules/items-planning-pn/enums';

export const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    component: ReportContainerComponent,
    data: {
      requiredPermission: ItemsPlanningPnClaims.accessItemsPlanningPlugin,
    },
  },
  {
    path: ':dateFrom/:dateTo',
    canActivate: [PermissionGuard],
    component: ReportContainerComponent,
    data: {
      requiredPermission: ItemsPlanningPnClaims.accessItemsPlanningPlugin,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRouting {
}
