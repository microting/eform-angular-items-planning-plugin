import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminGuard, PermissionGuard} from 'src/app/common/guards';
import {ItemsPlanningPnLayoutComponent} from './layouts';
import {
  ItemsPlanningSettingsComponent,
} from './components';
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
        path: 'settings',
        canActivate: [AdminGuard],
        component: ItemsPlanningSettingsComponent,
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'pairing',
        loadChildren: () =>
          import('./modules/pairing/pairing.module').then(
            (m) => m.PairingModule
          ),
      },
      {
        path: 'case',
        loadChildren: () =>
          import('./modules/planning-case/planning-case.module').then(
            (m) => m.PlanningCaseModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemsPlanningPnRouting {}
