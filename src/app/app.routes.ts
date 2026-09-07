import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/layout/app-layout/app-layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { MemberListComponent } from './features/members/pages/member-list/member-list';
import { MemberDetailsComponent } from './features/members/pages/member-details/member-details';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', description: 'Overview of your gym operations' },
      },
      {
        path: 'members',
        component: MemberListComponent,
        data: { title: 'Members', description: 'Manage your gym members and memberships' },
      },
      {
        path: 'members/:id',
        component: MemberDetailsComponent,
        data: { title: 'Member Details', description: 'View member profile and membership information' },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];