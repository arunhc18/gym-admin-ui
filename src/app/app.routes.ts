import { Routes } from '@angular/router';

import {
  AppLayoutComponent
} from './core/layout/app-layout/app-layout';

import {
  PlatformLayoutComponent
} from './core/layout/platform-layout/platform-layout';


export const routes: Routes = [


  // =====================================================
  // PLATFORM ADMIN
  // =====================================================

  {
    path: 'platform',

    component:
      PlatformLayoutComponent,

    children: [


      // =================================================
      // PLATFORM DEFAULT
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
            m =>
              m.PlatformDashboardComponent
          ),

        data: {

          title:
            'Platform Dashboard',

          description:
            'Manage tenants, subscriptions and platform operations'

        }
      },


      // =====================================================
      // PLATFORM SUBSCRIPTION PLANS
      // =====================================================


      // CREATE PLAN
      {
        path:
          'subscription-plans/new',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          ).then(
            m =>
              m.PlanFormComponent
          ),

        data: {

          title:
            'Create Subscription Plan',

          description:
            'Create a new SaaS subscription plan'

        }
      },


      // EDIT PLAN
      {
        path:
          'subscription-plans/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          ).then(
            m =>
              m.PlanFormComponent
          ),

        data: {

          title:
            'Edit Subscription Plan',

          description:
            'Update subscription plan information'

        }
      },


      // PLAN DETAILS
      {
        path:
          'subscription-plans/:id',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-details/plan-details'
          ).then(
            m =>
              m.PlanDetailsComponent
          ),

        data: {

          title:
            'Subscription Plan Details',

          description:
            'View subscription plan information'

        }
      },


      // PLAN LIST
      {
        path:
          'subscription-plans',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-list/plan-list'
          ).then(
            m =>
              m.PlanListComponent
          ),

        data: {

          title:
            'Subscription Plans',

          description:
            'Manage GymAdmin SaaS subscription plans'

        }
      },


      // =====================================================
      // PLATFORM TENANTS
      // =====================================================


      // CREATE TENANT
      {
        path:
          'tenants/new',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          ).then(
            m =>
              m.TenantFormComponent
          ),

        data: {

          title:
            'Create Tenant',

          description:
            'Create a new gym organization'

        }
      },


      // EDIT TENANT
      {
        path:
          'tenants/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          ).then(
            m =>
              m.TenantFormComponent
          ),

        data: {

          title:
            'Edit Tenant',

          description:
            'Update tenant and subscription information'

        }
      },


      // TENANT DETAILS
      {
        path:
          'tenants/:id',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-details/tenant-details'
          ).then(
            m =>
              m.TenantDetailsComponent
          ),

        data: {

          title:
            'Tenant Details',

          description:
            'View tenant organization information'

        }
      },


      // TENANT LIST
      {
        path:
          'tenants',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-list/tenant-list'
          ).then(
            m =>
              m.TenantListComponent
          ),

        data: {

          title:
            'Tenants',

          description:
            'Manage gym organizations using the platform'

        }
      },


      // =====================================================
      // TENANT SUBSCRIPTIONS
      // =====================================================

      {
        path:
          'subscriptions',

        loadComponent: () =>
          import(
            './features/platform/subscriptions/subscription-list/subscription-list'
          ).then(
            m =>
              m.SubscriptionListComponent
          ),

        data: {

          title:
            'Subscriptions',

          description:
            'Manage tenant subscriptions, renewals and plan assignments'

        }
      },


      // =====================================================
      // PLATFORM ACCOUNTS
      //
      // SaaS / TENANT BILLING
      //
      // Completely separate from Gym Accounts.
      // =====================================================


      // PLATFORM ACCOUNTS DEFAULT
      {
        path:
          'accounts',

        pathMatch:
          'full',

        redirectTo:
          'accounts/payments'
      },


      // PLATFORM CREATE PAYMENT
      {
        path:
          'accounts/payments/new',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/payment-form/payment-form'
          ).then(
            m =>
              m.PaymentFormComponent
          ),

        data: {

          title:
            'New Payment',

          description:
            'Record a new tenant payment'

        }
      },


      // PLATFORM PAYMENTS
      {
        path:
          'accounts/payments',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/payment-list/payment-list'
          ).then(
            m =>
              m.PaymentListComponent
          ),

        data: {

          title:
            'Payments',

          description:
            'View and manage tenant payments'

        }
      },


      // PLATFORM INVOICE DETAILS
      {
        path:
          'accounts/invoices/:id',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/invoice-details/invoice-details'
          ).then(
            m =>
              m.InvoiceDetailsComponent
          ),

        data: {

          title:
            'Invoice Details',

          description:
            'View and print invoice information'

        }
      },


      // PLATFORM INVOICE LIST
      {
        path:
          'accounts/invoices',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/invoice/invoice-list'
          ).then(
            m =>
              m.InvoiceListComponent
          ),

        data: {

          title:
            'Invoices',

          description:
            'View tenant invoices and outstanding balances'

        }
      },


      // =====================================================
      // PLATFORM SETTINGS
      // =====================================================

      {
        path:
          'settings',

        loadComponent: () =>
          import(
            './features/platform/dashboard/dashboard'
          ).then(
            m =>
              m.PlatformDashboardComponent
          ),

        data: {

          title:
            'Platform Settings',

          description:
            'Configure platform settings'

        }
      }


    ]

  },


  // =====================================================
  // GYM ADMIN / MANAGER
  // =====================================================

  {
    path: '',

    component:
      AppLayoutComponent,

    children: [


      // =================================================
      // DEFAULT GYM ROUTE
      // =================================================

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },


      // =====================================================
      // DASHBOARD
      // =====================================================

      {
        path:
          'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m =>
              m.DashboardComponent
          ),

        data: {

          title:
            'Dashboard',

          description:
            'Overview of your gym operations'

        }
      },


      // =====================================================
      // MEMBERS
      // =====================================================


      // ADD MEMBER
      {
        path:
          'members/new',

        loadComponent: () =>
          import(
            './features/members/pages/add-member/add-member'
          ).then(
            m =>
              m.AddMemberComponent
          ),

        data: {

          title:
            'Add Member',

          description:
            'Create a new gym member profile'

        }
      },


      // MEMBER DETAILS
      {
        path:
          'members/:id',

        loadComponent: () =>
          import(
            './features/members/pages/member-details/member-details'
          ).then(
            m =>
              m.MemberDetailsComponent
          ),

        data: {

          title:
            'Member Details',

          description:
            'View member profile and membership information'

        }
      },


      // MEMBER LIST
      {
        path:
          'members',

        loadComponent: () =>
          import(
            './features/members/pages/member-list/member-list'
          ).then(
            m =>
              m.MembersListComponent
          ),

        data: {

          title:
            'Members',

          description:
            'Manage gym members'

        }
      },


      // RENEWALS
      {
        path:
          'renewals',

        loadComponent: () =>
          import(
            './features/members/pages/renewals/renewals'
          ).then(
            m =>
              m.RenewalsComponent
          ),

        data: {

          title:
            'Renewals',

          description:
            'Manage membership renewals'

        }
      },


      // =====================================================
      // ENQUIRIES
      // =====================================================


      // NEW ENQUIRY
      {
        path:
          'enquiries/new',

        loadComponent: () =>
          import(
            './features/enquiries/pages/quick-enquiry/quick-enquiry'
          ).then(
            m =>
              m.QuickEnquiryComponent
          ),

        data: {

          title:
            'Quick Enquiry',

          description:
            'Create a new enquiry'

        }
      },


      // EDIT ENQUIRY
      {
        path:
          'enquiries/:id/edit',

        loadComponent: () =>
          import(
            './features/enquiries/pages/edit-enquiry/edit-enquiry'
          ).then(
            m =>
              m.EditEnquiryComponent
          ),

        data: {

          title:
            'Edit Enquiry',

          description:
            'Update enquiry details'

        }
      },


      // ENQUIRY LIST
      {
        path:
          'enquiries',

        loadComponent: () =>
          import(
            './features/enquiries/pages/enquiry-list/enquiry-list'
          ).then(
            m =>
              m.EnquiryListComponent
          ),

        data: {

          title:
            'Enquiries',

          description:
            'Manage prospective members'

        }
      },


      // =====================================================
      // VISITORS
      // =====================================================


      // NEW VISITOR
      {
        path:
          'visitors/new',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-entry/visitor-entry'
          ).then(
            m =>
              m.VisitorEntryComponent
          ),

        data: {

          title:
            'New Visitor',

          description:
            'Record a new visitor check-in'

        }
      },


      // VISITOR LIST
      {
        path:
          'visitors',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-list/visitor-list'
          ).then(
            m =>
              m.VisitorListComponent
          ),

        data: {

          title:
            'Visitors',

          description:
            'Track gym visitors and guest activity'

        }
      },


      // =====================================================
      // STAFF
      // =====================================================


      // ADD STAFF
      {
        path:
          'staff/add',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          ).then(
            m =>
              m.StaffFormComponent
          ),

        data: {

          title:
            'Add Staff',

          description:
            'Add a new staff member'

        }
      },


      // EDIT STAFF
      {
        path:
          'staff/:id/edit',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          ).then(
            m =>
              m.StaffFormComponent
          ),

        data: {

          title:
            'Edit Staff',

          description:
            'Update staff member details'

        }
      },


      // STAFF DETAILS
      {
        path:
          'staff/:id',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-details/staff-details'
          ).then(
            m =>
              m.StaffDetailsComponent
          ),

        data: {

          title:
            'Staff Details',

          description:
            'View staff member profile'

        }
      },


      // STAFF LIST
      {
        path:
          'staff',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-list/staff-list'
          ).then(
            m =>
              m.StaffListComponent
          ),

        data: {

          title:
            'Staff',

          description:
            'Manage trainers and gym staff'

        }
      },


      // =====================================================
      // ATTENDANCE
      //
      // Temporary placeholder until the attendance page
      // is connected here.
      // =====================================================

      // =====================================================
// ATTENDANCE
// =====================================================

{
  path: 'attendance',

  loadComponent: () =>
    import(
      './features/attendance/attendance-list/attendance-list'
    ).then(
      m => m.AttendanceListComponent
    ),

  data: {
    title: 'Attendance',
    description:
      'Weekly attendance for members and staff'
  }
},


      // =====================================================
      // GYM ACCOUNTS
      // =====================================================


      // =================================================
      // ACCOUNTS DEFAULT
      // =================================================

      {
        path:
          'accounts',

        pathMatch:
          'full',

        redirectTo:
          'accounts/overview'
      },


      // =====================================================
      // ACCOUNTS OVERVIEW
      // =====================================================

      {
        path:
          'accounts/overview',

        loadComponent: () =>
          import(
            './features/accounts/pages/accounts-overview/accounts-overview'
          ).then(
            m =>
              m.AccountsOverviewComponent
          ),

        data: {

          title:
            'Accounts',

          description:
            'Financial overview of gym collections and outstanding invoices'

        }
      },


      // =====================================================
      // INVOICES
      // =====================================================


      // CREATE INVOICE
      //
      // IMPORTANT:
      // Keep before accounts/invoices/:id
      {
        path:
          'accounts/invoices/new',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-form/invoice-form'
          ).then(
            m =>
              m.InvoiceFormComponent
          ),

        data: {

          title:
            'Create Invoice',

          description:
            'Generate a member invoice and record payment'

        }
      },


      // RECORD PAYMENT
      //
      // IMPORTANT:
      // Keep before accounts/invoices/:id
      {
        path:
          'accounts/invoices/:id/payment',

        loadComponent: () =>
          import(
            './features/accounts/pages/payments/payment-form/payment-form'
          ).then(
            m =>
              m.PaymentFormComponent
          ),

        data: {

          title:
            'Record Payment',

          description:
            'Record payment against a member invoice'

        }
      },


      // INVOICE DETAILS
      {
        path:
          'accounts/invoices/:id',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-details/invoice-details'
          ).then(
            m =>
              m.InvoiceDetailsComponent
          ),

        data: {

          title:
            'Invoice Details',

          description:
            'View and print member invoice'

        }
      },


      // INVOICE LIST
      {
        path:
          'accounts/invoices',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-list/invoice-list'
          ).then(
            m =>
              m.InvoiceListComponent
          ),

        data: {

          title:
            'Invoices',

          description:
            'Manage member invoices and outstanding balances'

        }
      },


      // =====================================================
      // PAYMENTS
      // =====================================================

      {
        path:
          'accounts/payments',

        loadComponent: () =>
          import(
            './features/accounts/pages/payments/payment-list/payment-list'
          ).then(
            m =>
              m.PaymentListComponent
          ),

        data: {

          title:
            'Payments',

          description:
            'View member payment transactions and collections'

        }
      },


      // =====================================================
      // EXPENSES
      // =====================================================


      // CREATE EXPENSE
      //
      // Keep before accounts/expenses
      {
        path:
          'accounts/expenses/new',

        loadComponent: () =>
          import(
            './features/accounts/pages/expenses/expense-list/expense-form/expense-form'
          ).then(
            m =>
              m.ExpenseFormComponent
          ),

        data: {

          title:
            'Add Expense',

          description:
            'Record a new gym operational expense'

        }
      },


      // EXPENSE LIST
      {
        path:
          'accounts/expenses',

        loadComponent: () =>
          import(
            './features/accounts/pages/expenses/expense-list/expense-list'
          ).then(
            m =>
              m.ExpenseListComponent
          ),

        data: {

          title:
            'Expenses',

          description:
            'Track and manage gym operational expenses'

        }
      },


      // =====================================================
      // REFUNDS
      // =====================================================


      // PROCESS REFUND
      //
      // IMPORTANT:
      // Keep before accounts/refunds
      //
      // Example:
      //
      // /accounts/refunds/new/1
      //
      // where 1 is paymentId.
      // =================================================

      {
        path:
          'accounts/refunds/new/:paymentId',

        loadComponent: () =>
          import(
            './features/accounts/pages/refunds/refund-form/refund-form'
          ).then(
            m =>
              m.RefundFormComponent
          ),

        data: {

          title:
            'Process Refund',

          description:
            'Refund an existing member payment'

        }
      },


      // REFUND LIST
      {
        path:
          'accounts/refunds',

        loadComponent: () =>
          import(
            './features/accounts/pages/refunds/refund-list/refund-list'
          ).then(
            m =>
              m.RefundListComponent
          ),

        data: {

          title:
            'Refunds',

          description:
            'View and manage member payment refunds'

        }
      },
      // =====================================================
// PAYMENT METHODS
// =====================================================

{
  path:
    'accounts/payment-methods',

  loadComponent: () =>
    import(
      './features/accounts/pages/payment-methods/payment-method-list/payment-method-list'
    ).then(
      m =>
        m.PaymentMethodListComponent
    ),

  data: {

    title:
      'Payment Methods',

    description:
      'Configure payment methods available for gym transactions'

  }
},


      // =====================================================
      // LEGACY PAYMENT ROUTE
      //
      // Existing old sidebar/bookmarks using /payments
      // will automatically use the new Accounts page.
      // =====================================================

      {
        path:
          'payments',

        pathMatch:
          'full',

        redirectTo:
          'accounts/payments'
      },


      // =====================================================
      // LEGACY EXPENSE ROUTE
      // =====================================================

      {
        path:
          'expenses',

        pathMatch:
          'full',

        redirectTo:
          'accounts/expenses'
      },


      // =====================================================
      // GYM MEMBERSHIP PLANS
      //
      // Temporary placeholder.
      //
      // This is different from Platform subscription plans.
      // =====================================================

      {
        path:
          'plans',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m =>
              m.DashboardComponent
          ),

        data: {

          title:
            'Plans',

          description:
            'Manage gym membership plans and pricing'

        }
      },


      // =====================================================
      // REPORTS
      // =====================================================

      {
        path:
          'reports',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m =>
              m.DashboardComponent
          ),

        data: {

          title:
            'Reports',

          description:
            'View gym reports and analytics'

        }
      },


      // =====================================================
      // SETTINGS
      // =====================================================

      {
        path:
          'settings',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          ).then(
            m =>
              m.DashboardComponent
          ),

        data: {

          title:
            'Settings',

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
  // ALWAYS KEEP THIS AS THE LAST ROUTE.
  // =====================================================

  {
    path: '**',
    redirectTo: 'dashboard'
  }


];