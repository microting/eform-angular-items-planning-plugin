import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PermissionGuard} from 'src/app/common/guards';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {ItemsPlanningPnClaims} from './enums';

export const routes: Routes = [
  {
    path: '',
    component: ItemsPlanningPnLayoutComponent,
    canActivate: [PermissionGuard],
    data: {
      requiredPermission: ItemsPlanningPnClaims.accessItemsPlanningPlugin,
    },
    children: [
      {
        path: 'plannings',
        loadChildren: () =>
          import('./modules/plannings/plannings.module').then(
            (m) => m.PlanningsModule
          ),
      },
      {
        path: 'pairing',
        loadChildren: () =>
          import('./modules/pairing/pairing.module').then(
            (m) => m.PairingModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsPlanningPnRouting {
}
