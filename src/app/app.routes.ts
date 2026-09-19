import { Routes } from '@angular/router';

import { AppLayoutComponent } from './core/layout/app-layout/app-layout';
import { PlatformLayoutComponent } from './core/layout/platform-layout/platform-layout';


export const routes: Routes = [

  // =====================================================
  // PLATFORM ADMIN
  // =====================================================

  {
    path: 'platform',

    component: PlatformLayoutComponent,

    children: [

      // =================================================
      // DEFAULT PLATFORM ROUTE
      // =================================================

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },


      // =================================================
      // PLATFORM DASHBOARD
      // =================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/platform/dashboard/dashboard'
          ).then(
            m => m.PlatformDashboardComponent
          ),

        data: {
          title: 'Platform Dashboard',
          description:
            'Manage tenants, subscriptions and platform operations'
        }
      },


      // =================================================
      // SUBSCRIPTION PLANS - CREATE
      // IMPORTANT: Keep before :id
      // =================================================

      {
        path: 'subscription-plans/new',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          ).then(
            m => m.PlanFormComponent
          ),

        data: {
          title: 'Create Subscription Plan',
          description:
            'Create a new SaaS subscription plan'
        }
      },


      // =================================================
      // SUBSCRIPTION PLANS - EDIT
      // IMPORTANT: Keep before :id
      // =================================================

      {
        path: 'subscription-plans/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          ).then(
            m => m.PlanFormComponent
          ),

        data: {
          title: 'Edit Subscription Plan',
          description:
            'Update subscription plan information'
        }
      },


      // =================================================
      // SUBSCRIPTION PLANS - DETAILS
      // =================================================

      {
        path: 'subscription-plans/:id',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-details/plan-details'
          ).then(
            m => m.PlanDetailsComponent
          ),

        data: {
          title: 'Subscription Plan Details',
          description:
            'View subscription plan information'
        }
      },


      // =================================================
      // SUBSCRIPTION PLANS - LIST
      // =================================================

      {
        path: 'subscription-plans',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-list/plan-list'
          ).then(
            m => m.PlanListComponent
          ),

        data: {
          title: 'Subscription Plans',
          description:
            'Manage GymAdmin SaaS subscription plans'
        }
      },


      // =================================================
      // TENANTS - CREATE
      // IMPORTANT: Keep before :id
      // =================================================

      {
        path: 'tenants/new',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          ).then(
            m => m.TenantFormComponent
          ),

        data: {
          title: 'Create Tenant',
          description:
            'Create a new gym organization'
        }
      },


      // =================================================
      // TENANTS - EDIT
      // IMPORTANT: Keep before :id
      // =================================================

      {
        path: 'tenants/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          ).then(
            m => m.TenantFormComponent
          ),

        data: {
          title: 'Edit Tenant',
          description:
            'Update tenant and subscription information'
        }
      },


      // =================================================
      // TENANTS - DETAILS
      // =================================================

      {
        path: 'tenants/:id',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-details/tenant-details'
          ).then(
            m => m.TenantDetailsComponent
          ),

        data: {
          title: 'Tenant Details',
          description:
            'View tenant organization information'
        }
      },


      // =================================================
      // TENANTS - LIST
      // =================================================

      {
        path: 'tenants',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-list/tenant-list'
          ).then(
            m => m.TenantListComponent
          ),

        data: {
          title: 'Tenants',
          description:
            'Manage gym organizations using the platform'
        }
      },


      // =================================================
      // SUBSCRIPTIONS
      // TEMPORARY PLACEHOLDER
      //
      // We are keeping this because you wanted
      // Subscriptions in the Platform sidebar.
      //
      // Later this will get its own component.
      // =================================================

      {
  path: 'subscriptions',

  loadComponent: () =>
    import(
      './features/platform/subscriptions/subscription-list/subscription-list'
    ).then(
      m => m.SubscriptionListComponent
    ),

  data: {
    title: 'Subscriptions',
    description:
      'Manage tenant subscriptions, renewals and plan assignments'
  }
},


      // =================================================
      // PLATFORM SETTINGS
      // TEMPORARY PLACEHOLDER
      // =================================================

      {
        path: 'settings',

        loadComponent: () =>
          import(
            './features/platform/dashboard/dashboard'
          ).then(
            m => m.PlatformDashboardComponent
          ),

        data: {
          title: 'Platform Settings',
          description:
            'Configure platform settings'
        }
      }

    ]

  },


  // =====================================================
  // GYM ADMIN / TENANT ADMIN
  // =====================================================

  {
    path: '',

    component: AppLayoutComponent,

    children: [

      // =================================================
      // DEFAULT
      // =================================================

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },


      // =================================================
      // DASHBOARD
      // =================================================

      {
        path: 'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Dashboard',
          description:
            'Overview of your gym operations'
        }
      },


      // =================================================
      // MEMBERS - NEW
      // IMPORTANT: Before members/:id
      // =================================================

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
          description:
            'Create a new gym member profile'
        }
      },


      // =================================================
      // MEMBER DETAILS
      // =================================================

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
          description:
            'View member profile and membership information'
        }
      },


      // =================================================
      // MEMBER LIST
      // =================================================

      {
        path: 'members',

        loadComponent: () =>
          import(
            './features/members/pages/member-list/member-list'
          ).then(
            m => m.MembersListComponent
          ),

        data: {
          title: 'Members',
          description:
            'Manage gym members'
        }
      },


      // =================================================
      // RENEWALS
      // =================================================

      {
        path: 'renewals',

        loadComponent: () =>
          import(
            './features/members/pages/renewals/renewals'
          ).then(
            m => m.RenewalsComponent
          ),

        data: {
          title: 'Renewals',
          description:
            'Manage membership renewals'
        }
      },


      // =================================================
      // ENQUIRY - NEW
      // =================================================

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
          description:
            'Create a new enquiry'
        }
      },


      // =================================================
      // ENQUIRY - EDIT
      // =================================================

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
          description:
            'Update enquiry details'
        }
      },


      // =================================================
      // ENQUIRY LIST
      // =================================================

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
          description:
            'Manage prospective members'
        }
      },


      // =================================================
      // VISITOR - NEW
      // =================================================

      {
        path: 'visitors/new',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-entry/visitor-entry'
          ).then(
            m => m.VisitorEntryComponent
          ),

        data: {
          title: 'New Visitor',
          description:
            'Record a new visitor check-in'
        }
      },


      // =================================================
      // VISITOR LIST
      // =================================================

      {
        path: 'visitors',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-list/visitor-list'
          ).then(
            m => m.VisitorListComponent
          ),

        data: {
          title: 'Visitors',
          description:
            'Track gym visitors and guest activity'
        }
      },


      // =================================================
      // STAFF - ADD
      // IMPORTANT: Before staff/:id
      // =================================================

      {
        path: 'staff/add',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          ).then(
            m => m.StaffFormComponent
          ),

        data: {
          title: 'Add Staff',
          description:
            'Add a new staff member'
        }
      },


      // =================================================
      // STAFF - EDIT
      // =================================================

      {
        path: 'staff/:id/edit',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          ).then(
            m => m.StaffFormComponent
          ),

        data: {
          title: 'Edit Staff',
          description:
            'Update staff member details'
        }
      },


      // =================================================
      // STAFF DETAILS
      // =================================================

      {
        path: 'staff/:id',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-details/staff-details'
          ).then(
            m => m.StaffDetailsComponent
          ),

        data: {
          title: 'Staff Details',
          description:
            'View staff member profile'
        }
      },


      // =================================================
      // STAFF LIST
      // =================================================

      {
        path: 'staff',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-list/staff-list'
          ).then(
            m => m.StaffListComponent
          ),

        data: {
          title: 'Staff',
          description:
            'Manage trainers and gym staff'
        }
      },


      // =================================================
      // ATTENDANCE
      // CURRENT PLACEHOLDER
      // =================================================

      {
        path: 'attendance',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Attendance',
          description:
            'Track member and staff attendance'
        }
      },


      // =================================================
      // PAYMENTS
      // CURRENT PLACEHOLDER
      // =================================================

      {
        path: 'payments',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Payments',
          description:
            'Manage member payments and transactions'
        }
      },


      // =================================================
      // EXPENSES
      // CURRENT PLACEHOLDER
      // =================================================

      {
        path: 'expenses',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Expenses',
          description:
            'Track and manage gym expenses'
        }
      },


      // =================================================
      // GYM MEMBERSHIP PLANS
      //
      // This is NOT the same as:
      //
      // /platform/subscription-plans
      // =================================================

      {
        path: 'plans',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Plans',
          description:
            'Manage gym membership plans and pricing'
        }
      },


      // =================================================
      // REPORTS
      // CURRENT PLACEHOLDER
      // =================================================

      {
        path: 'reports',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Reports',
          description:
            'View gym reports and analytics'
        }
      },


      // =================================================
      // GYM SETTINGS
      // CURRENT PLACEHOLDER
      // =================================================

      {
        path: 'settings',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m => m.DashboardComponent
          ),

        data: {
          title: 'Settings',
          description:
            'Configure gym and application settings'
        }
      }

    ]

  },


  // =====================================================
  // GLOBAL FALLBACK
  //
  // IMPORTANT:
  // Always keep this as the final route.
  // =====================================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }

];