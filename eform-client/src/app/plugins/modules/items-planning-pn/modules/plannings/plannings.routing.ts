import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard, PermissionGuard} from 'src/app/common/guards';
import {PlanningCreateComponent, PlanningEditComponent, PlanningsContainerComponent} from './components';
import {ItemsPlanningPnClaims} from 'src/app/plugins/modules/items-planning-pn/enums';

export const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: {
      requiredPermission: ItemsPlanningPnClaims.getPlannings,
    },
    component: PlanningsContainerComponent,
  },
  {
    path: 'edit/:id',
    canActivate: [PermissionGuard],
    data: {
      requiredPermission: ItemsPlanningPnClaims.editPlanning,
    },
    component: PlanningEditComponent,
  },
  {
    path: 'create',
    canActivate: [AuthGuard],
    component: PlanningCreateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanningsRouting {
}
