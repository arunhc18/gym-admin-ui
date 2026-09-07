import { Routes } from '@angular/router';

import { AppLayoutComponent } from './core/layout/app-layout/app-layout';

export const routes: Routes = [

  // =========================================================
  // COMMON APPLICATION LAYOUT
  // =========================================================
  {
    path: '',
    component: AppLayoutComponent,

    children: [

      // =====================================================
      // DEFAULT ROUTE
      // =====================================================
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

      // =====================================================
      // DASHBOARD
      // =====================================================
      {
        path: 'dashboard',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Dashboard',
          description: 'Overview of your gym operations'
        }
      },

      // =====================================================
      // MEMBER LIST
      // Developer 1
      // =====================================================
      {
        path: 'members',

        loadComponent: () =>
          import(
            './features/members/pages/member-list/member-list'
          ).then(
            m => m.MemberListComponent
          ),

        data: {
          title: 'Members'
        }
      },

      // =====================================================
      // MEMBER DETAILS
      // Developer 2
      // =====================================================
      {
        path: 'members/:id',

        loadComponent: () =>
          import(
            './features/members/pages/member-details/member-details'
          ).then(
            m => m.MemberDetailsComponent
          ),

        data: {
          title: 'Member Details',
          description: 'View member profile and membership information'
        }
      },

      // =====================================================
      // PLACEHOLDER ROUTES
      // These can be replaced later when those modules are built
      // =====================================================

      {
        path: 'staff',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Staff',
          description: 'Manage trainers and gym staff'
        }
      },

      {
        path: 'attendance',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Attendance',
          description: 'Track member and staff attendance'
        }
      },

      {
        path: 'payments',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Payments',
          description: 'Manage member payments and transactions'
        }
      },

      {
        path: 'expenses',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Expenses',
          description: 'Track and manage gym expenses'
        }
      },

      {
        path: 'plans',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Plans',
          description: 'Manage membership plans and pricing'
        }
      },

      {
        path: 'reports',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Reports',
          description: 'View gym reports and analytics'
        }
      },

      {
        path: 'settings',

        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent),

        data: {
          title: 'Settings',
          description: 'Configure gym and application settings'
        }
      }

    ]
  },

  // =========================================================
  // UNKNOWN ROUTES
  // =========================================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];