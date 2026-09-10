import { Routes } from '@angular/router';

import { AppLayoutComponent } from './core/layout/app-layout/app-layout';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },

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
      // ADD MEMBER
      // IMPORTANT: Must come before members/:id
      // =====================================================
      {
        path: 'members/new',

        loadComponent: () =>
          import(
            './features/members/pages/add-member/add-member'
          ).then(
            m => m.AddMemberComponent
          ),

        data: {
          title: 'Add Member',
          description: 'Create a new gym member profile'
        }
      },

      // =====================================================
      // MEMBER DETAILS
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

      {
        path: 'enquiries/new',

        loadComponent: () =>
          import(
            './features/enquiries/pages/quick-enquiry/quick-enquiry'
          ).then(
            m => m.QuickEnquiryComponent
          ),

        data: {
          title: 'Quick Enquiry',
          description: 'Create a new enquiry'
        }
      },

      {
        path: 'enquiries/:id/edit',

        loadComponent: () =>
          import(
            './features/enquiries/pages/edit-enquiry/edit-enquiry'
          ).then(
            m => m.EditEnquiryComponent
          ),

        data: {
          title: 'Edit Enquiry',
          description: 'Update enquiry details'
        }
      },

      {
        path: 'enquiries',

        loadComponent: () =>
          import(
            './features/enquiries/pages/enquiry-list/enquiry-list'
          ).then(
            m => m.EnquiryListComponent
          ),

        data: {
          title: 'Enquiries',
          description: 'Manage prospective members'
        }
      },

      // =====================================================
      // PLACEHOLDER ROUTES
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

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];