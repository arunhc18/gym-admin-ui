import {
  Routes
} from '@angular/router';

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
          )
            .then(
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


      // =================================================
      // PLATFORM SUBSCRIPTION PLANS
      // =================================================

      {
        path:
          'subscription-plans/new',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          )
            .then(
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


      {
        path:
          'subscription-plans/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-form/plan-form'
          )
            .then(
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


      {
        path:
          'subscription-plans/:id',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-details/plan-details'
          )
            .then(
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


      {
        path:
          'subscription-plans',

        loadComponent: () =>
          import(
            './features/platform/subscription-plans/pages/plan-list/plan-list'
          )
            .then(
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


      // =================================================
      // PLATFORM TENANTS
      // =================================================

      {
        path:
          'tenants/new',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          )
            .then(
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


      {
        path:
          'tenants/:id/edit',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-form/tenant-form'
          )
            .then(
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


      {
        path:
          'tenants/:id',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-details/tenant-details'
          )
            .then(
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


      {
        path:
          'tenants',

        loadComponent: () =>
          import(
            './features/platform/tenants/pages/tenant-list/tenant-list'
          )
            .then(
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


      // =================================================
      // TENANT SUBSCRIPTIONS
      // =================================================

      {
        path:
          'subscriptions',

        loadComponent: () =>
          import(
            './features/platform/subscriptions/subscription-list/subscription-list'
          )
            .then(
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


      // =================================================
      // PLATFORM ACCOUNTS
      // =================================================

      {
        path: 'accounts',

        pathMatch: 'full',

        redirectTo:
          'accounts/payments'
      },


      {
        path:
          'accounts/payments/new',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/payment-form/payment-form'
          )
            .then(
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


      {
        path:
          'accounts/payments',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/payment-list/payment-list'
          )
            .then(
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


      {
        path:
          'accounts/invoices/:id',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/invoice-details/invoice-details'
          )
            .then(
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


      {
        path:
          'accounts/invoices',

        loadComponent: () =>
          import(
            './features/platform/accounts/pages/invoice/invoice-list'
          )
            .then(
              m =>
                m.InvoiceListComponent
            ),

        data: {
          title:
            'Invoices',

          description:
            'View tenant invoices and outstanding balances'
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
      // DEFAULT
      // =================================================

      {
        path: '',

        pathMatch: 'full',

        redirectTo:
          'dashboard'
      },


      // =================================================
      // DASHBOARD
      // =================================================

      {
        path:
          'dashboard',

        loadComponent: () =>
          import(
            './features/dashboard/dashboard'
          )
            .then(
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


      // =================================================
      // VENDORS
      // =================================================

      {
        path:
          'vendors',

        loadComponent: () =>
          import(
            './features/vendors/pages/vendor-list/vendor-list'
          )
            .then(
              m =>
                m.VendorListComponent
            ),

        data: {
          title:
            'Vendors',

          description:
            'Manage gym vendors and suppliers'
        }
      },


      // =================================================
      // PRODUCTS
      // =================================================

      {
        path:
          'products',

        loadComponent: () =>
          import(
            './features/products/pages/product-list/product-list'
          )
            .then(
              m =>
                m.ProductListComponent
            ),

        data: {
          title:
            'Products',

          description:
            'Manage products, categories, inventory and stock'
        }
      },


      // =================================================
      // MEMBERS
      // =================================================

      {
        path:
          'members/new',

        loadComponent: () =>
          import(
            './features/members/pages/add-member/add-member'
          )
            .then(
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


      {
        path:
          'members/:id',

        loadComponent: () =>
          import(
            './features/members/pages/member-details/member-details'
          )
            .then(
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


      {
        path:
          'members',

        loadComponent: () =>
          import(
            './features/members/pages/member-list/member-list'
          )
            .then(
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


      // =================================================
      // RENEWALS
      // =================================================

      {
        path:
          'renewals',

        loadComponent: () =>
          import(
            './features/members/pages/renewals/renewals'
          )
            .then(
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


      // =================================================
      // ENQUIRIES
      // =================================================

      {
        path:
          'enquiries/new',

        loadComponent: () =>
          import(
            './features/enquiries/pages/quick-enquiry/quick-enquiry'
          )
            .then(
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


      {
        path:
          'enquiries/:id/edit',

        loadComponent: () =>
          import(
            './features/enquiries/pages/edit-enquiry/edit-enquiry'
          )
            .then(
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


      {
        path:
          'enquiries',

        loadComponent: () =>
          import(
            './features/enquiries/pages/enquiry-list/enquiry-list'
          )
            .then(
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


      // =================================================
      // VISITORS
      // =================================================

      {
        path:
          'visitors/new',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-entry/visitor-entry'
          )
            .then(
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


      {
        path:
          'visitors',

        loadComponent: () =>
          import(
            './features/visitors/pages/visitor-list/visitor-list'
          )
            .then(
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


      // =================================================
      // STAFF
      // =================================================

      {
        path:
          'staff/add',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          )
            .then(
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


      {
        path:
          'staff/:id/edit',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-form/staff-form'
          )
            .then(
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


      {
        path:
          'staff/:id',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-details/staff-details'
          )
            .then(
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


      {
        path:
          'staff',

        loadComponent: () =>
          import(
            './features/staff/pages/staff-list/staff-list'
          )
            .then(
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


      // =================================================
      // TRAINING - CLASS SCHEDULE
      // =================================================

      {
        path:
          'classes',

        loadComponent: () =>
          import(
            './features/classes/pages/class-list/class-list'
          )
            .then(
              m =>
                m.ClassListComponent
            ),

        data: {
          title:
            'Class Schedule',

          description:
            'Manage class schedules',

          breadcrumbParent:
            'Training'
        }
      },


      // =================================================
      // TRAINING - CLASS BOOKINGS
      // =================================================

      {
        path:
          'classes/bookings',

        loadComponent: () =>
          import(
            './features/classes/pages/class-bookings/class-bookings'
          )
            .then(
              m =>
                m.ClassBookingsComponent
            ),

        data: {
          title:
            'Class Bookings',

          description:
            'Manage class bookings and waitlists',

          breadcrumbParent:
            'Training',

          breadcrumbParentUrl:
            '/classes'
        }
      },


      // =================================================
      // TRAINING - CLASS TYPES
      // =================================================

      {
        path:
          'classes/types',

        loadComponent: () =>
          import(
            './features/classes/pages/class-types/class-types'
          )
            .then(
              m =>
                m.ClassTypesComponent
            ),

        data: {
          title:
            'Class Types',

          description:
            'Manage the gym class catalog',

          breadcrumbParent:
            'Training',

          breadcrumbParentUrl:
            '/classes'
        }
      },


      // =================================================
      // PERSONAL TRAINING DEFAULT
      // =================================================

      {
        path:
          'training/personal-training',

        pathMatch:
          'full',

        redirectTo:
          'training/personal-training/packages'
      },


      // =================================================
      // PERSONAL TRAINING - NEW PACKAGE
      // =================================================

      {
        path:
          'training/personal-training/packages/new',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-package-form/pt-package-form'
          )
            .then(
              m =>
                m.PtPackageFormComponent
            ),

        data: {
          title:
            'New PT Package',

          description:
            'Create a new personal training package',

          breadcrumbParent:
            'Personal Training',

          breadcrumbParentUrl:
            '/training/personal-training/packages'
        }
      },


      // =================================================
      // PERSONAL TRAINING - EDIT PACKAGE
      // =================================================

      {
        path:
          'training/personal-training/packages/:id/edit',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-package-form/pt-package-form'
          )
            .then(
              m =>
                m.PtPackageFormComponent
            ),

        data: {
          title:
            'Edit PT Package',

          description:
            'Update personal training package details',

          breadcrumbParent:
            'Personal Training',

          breadcrumbParentUrl:
            '/training/personal-training/packages'
        }
      },


      // =================================================
      // PERSONAL TRAINING - PACKAGES
      // =================================================

      {
        path:
          'training/personal-training/packages',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-package-list/pt-package-list'
          )
            .then(
              m =>
                m.PtPackageListComponent
            ),

        data: {
          title:
            'Personal Training',

          description:
            'Manage personal training packages and pricing',

          breadcrumbParent:
            'Training',

          breadcrumbParentUrl:
            '/classes'
        }
      },


      // =================================================
      // PERSONAL TRAINING - ASSIGN CLIENT
      // =================================================

      {
        path:
          'training/personal-training/clients/new',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-subscription-form/pt-subscription-form'
          )
            .then(
              m =>
                m.PtSubscriptionFormComponent
            ),

        data: {
          title:
            'Assign PT Client',

          description:
            'Assign a personal training package to a member',

          breadcrumbParent:
            'PT Clients',

          breadcrumbParentUrl:
            '/training/personal-training/clients'
        }
      },


      // =================================================
      // PERSONAL TRAINING - EDIT CLIENT
      // =================================================

      {
        path:
          'training/personal-training/clients/:id/edit',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-subscription-form/pt-subscription-form'
          )
            .then(
              m =>
                m.PtSubscriptionFormComponent
            ),

        data: {
          title:
            'Edit PT Client',

          description:
            'Update personal training client assignment',

          breadcrumbParent:
            'PT Clients',

          breadcrumbParentUrl:
            '/training/personal-training/clients'
        }
      },


      // =================================================
      // PERSONAL TRAINING - CLIENTS
      // =================================================

      {
        path:
          'training/personal-training/clients',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-subscription-list/pt-subscription-list'
          )
            .then(
              m =>
                m.PtSubscriptionListComponent
            ),

        data: {
          title:
            'PT Clients',

          description:
            'Manage personal training clients',

          breadcrumbParent:
            'Personal Training',

          breadcrumbParentUrl:
            '/training/personal-training/packages'
        }
      },


      // =================================================
      // PERSONAL TRAINING - SCHEDULE SESSION
      // =================================================

      {
        path:
          'training/personal-training/sessions/new',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-session-form/pt-session-form'
          )
            .then(
              m =>
                m.PtSessionFormComponent
            ),

        data: {
          title:
            'Schedule PT Session',

          description:
            'Schedule a personal training session',

          breadcrumbParent:
            'PT Sessions',

          breadcrumbParentUrl:
            '/training/personal-training/sessions'
        }
      },


      // =================================================
      // PERSONAL TRAINING - EDIT SESSION
      // =================================================

      {
        path:
          'training/personal-training/sessions/:id/edit',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-session-form/pt-session-form'
          )
            .then(
              m =>
                m.PtSessionFormComponent
            ),

        data: {
          title:
            'Edit PT Session',

          description:
            'Update personal training session details',

          breadcrumbParent:
            'PT Sessions',

          breadcrumbParentUrl:
            '/training/personal-training/sessions'
        }
      },


      // =================================================
      // PERSONAL TRAINING - SESSIONS
      // =================================================

      {
        path:
          'training/personal-training/sessions',

        loadComponent: () =>
          import(
            './features/personal-training/pages/pt-session-list/pt-session-list'
          )
            .then(
              m =>
                m.PtSessionListComponent
            ),

        data: {
          title:
            'PT Sessions',

          description:
            'Manage personal training sessions',

          breadcrumbParent:
            'Personal Training',

          breadcrumbParentUrl:
            '/training/personal-training/packages'
        }
      },


      // =================================================
      // ATTENDANCE
      // =================================================

      {
        path:
          'attendance',

        loadComponent: () =>
          import(
            './features/attendance/attendance-list/attendance-list'
          )
            .then(
              m =>
                m.AttendanceListComponent
            ),

        data: {
          title:
            'Attendance',

          description:
            'Weekly and monthly attendance for members and staff'
        }
      },


      // =================================================
      // GYM ACCOUNTS DEFAULT
      // =================================================

      {
        path:
          'accounts',

        pathMatch:
          'full',

        redirectTo:
          'accounts/overview'
      },


      // =================================================
      // ACCOUNTS OVERVIEW
      // =================================================

      {
        path:
          'accounts/overview',

        loadComponent: () =>
          import(
            './features/accounts/pages/accounts-overview/accounts-overview'
          )
            .then(
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


      // =================================================
      // CREATE INVOICE
      // =================================================

      {
        path:
          'accounts/invoices/new',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-form/invoice-form'
          )
            .then(
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


      // =================================================
      // RECORD PAYMENT
      // =================================================

      {
        path:
          'accounts/invoices/:id/payment',

        loadComponent: () =>
          import(
            './features/accounts/pages/payments/payment-form/payment-form'
          )
            .then(
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


      // =================================================
      // INVOICE DETAILS
      // =================================================

      {
        path:
          'accounts/invoices/:id',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-details/invoice-details'
          )
            .then(
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


      // =================================================
      // INVOICE LIST
      // =================================================

      {
        path:
          'accounts/invoices',

        loadComponent: () =>
          import(
            './features/accounts/pages/invoices/invoice-list/invoice-list'
          )
            .then(
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


      // =================================================
      // PAYMENTS
      // =================================================

      {
        path:
          'accounts/payments',

        loadComponent: () =>
          import(
            './features/accounts/pages/payments/payment-list/payment-list'
          )
            .then(
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


      // =================================================
      // CREATE EXPENSE
      // =================================================

      {
        path:
          'accounts/expenses/new',

        loadComponent: () =>
          import(
            './features/accounts/pages/expenses/expense-list/expense-form/expense-form'
          )
            .then(
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


      // =================================================
      // EXPENSE LIST
      // =================================================

      {
        path:
          'accounts/expenses',

        loadComponent: () =>
          import(
            './features/accounts/pages/expenses/expense-list/expense-list'
          )
            .then(
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


      // =================================================
      // PROCESS REFUND
      // =================================================

      {
        path:
          'accounts/refunds/new/:paymentId',

        loadComponent: () =>
          import(
            './features/accounts/pages/refunds/refund-form/refund-form'
          )
            .then(
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


      // =================================================
      // REFUND LIST
      // =================================================

      {
        path:
          'accounts/refunds',

        loadComponent: () =>
          import(
            './features/accounts/pages/refunds/refund-list/refund-list'
          )
            .then(
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


      // =================================================
      // PAYMENT METHODS
      // =================================================

      {
        path:
          'accounts/payment-methods',

        loadComponent: () =>
          import(
            './features/accounts/pages/payment-methods/payment-method-list/payment-method-list'
          )
            .then(
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


      // =================================================
      // LEGACY PAYMENT ROUTE
      // =================================================

      {
        path:
          'payments',

        pathMatch:
          'full',

        redirectTo:
          'accounts/payments'
      },


      // =================================================
      // LEGACY EXPENSE ROUTE
      // =================================================

      {
        path:
          'expenses',

        pathMatch:
          'full',

        redirectTo:
          'accounts/expenses'
      },


      // =================================================
      // MEMBERSHIP PLANS
      // =================================================

      {
        path:
          'plans',

        loadComponent: () =>
          import(
            './features/plans/pages/plan-list/plan-list'
          )
            .then(
              m =>
                m.PlanListComponent
            ),

        data: {
          title:
            'Plans',

          description:
            'Manage membership plans and pricing'
        }
      },


      // =================================================
      // EQUIPMENT
      // =================================================

      {
        path:
          'equipment',

        loadComponent: () =>
          import(
            './features/equipment/pages/equipment-list/equipment-list'
          )
            .then(
              m =>
                m.EquipmentListComponent
            ),

        data: {
          title:
            'Equipment',

          description:
            'Equipment inventory and maintenance'
        }
      },


      // =================================================
      // REPORTS
      // =================================================

      {
        path:
          'reports',

        loadComponent: () =>
          import(
            './features/reports/pages/reports-dashboard/reports-dashboard'
          )
            .then(
              m =>
                m.ReportsDashboardComponent
            ),

        data: {
          title:
            'Reports',

          description:
            'Financial, membership and attendance reports'
        }
      }

    ]
  },


  // =====================================================
  // GLOBAL FALLBACK
  // =====================================================

  {
    path: '**',

    redirectTo:
      'dashboard'
  }


];