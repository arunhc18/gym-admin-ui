import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import {
  combineLatest
} from 'rxjs';

import {
  SubscriptionPlan
} from '../../subscription-plans/models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../../subscription-plans/services/subscription-plan';

import {
  Tenant
} from '../../tenants/models/tenant.model';

import {
  TenantService
} from '../../tenants/services/tenant';


interface SubscriptionRow {

  tenant: Tenant;

  plan?: SubscriptionPlan;

}


@Component({
  selector: 'app-subscription-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './subscription-list.html',

  styleUrl:
    './subscription-list.scss'
})
export class SubscriptionListComponent
  implements OnInit {


  subscriptions:
    SubscriptionRow[] = [];


  filteredSubscriptions:
    SubscriptionRow[] = [];


  plans:
    SubscriptionPlan[] = [];


  searchText = '';

  selectedPlan = '';

  selectedStatus = '';

  selectedExpiry = '';


  constructor(

    private readonly tenantService:
      TenantService,

    private readonly planService:
      SubscriptionPlanService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {

    combineLatest([

      this.tenantService
        .getTenants(),

      this.planService
        .getPlans()

    ])
      .subscribe(
        ([tenants, plans]) => {

          this.plans = plans;


          this.subscriptions =
            tenants.map(
              tenant => ({

                tenant,

                plan:
                  plans.find(
                    plan =>
                      plan.subscriptionPlanId ===
                      tenant.subscriptionPlanId
                  )

              })
            );


          this.applyFilters();

        }
      );

  }


  // =====================================================
  // FILTERS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredSubscriptions =
      this.subscriptions.filter(
        item => {


          const tenant =
            item.tenant;


          const matchesSearch =

            !search ||

            tenant.tenantName
              .toLowerCase()
              .includes(search) ||

            tenant.subdomain
              .toLowerCase()
              .includes(search) ||

            (
              item.plan?.planName ??
              ''
            )
              .toLowerCase()
              .includes(search);


          const matchesPlan =

            !this.selectedPlan ||

            tenant.subscriptionPlanId ===
              Number(
                this.selectedPlan
              );


          const matchesStatus =

            !this.selectedStatus ||

            tenant.subscriptionStatus ===
              this.selectedStatus;


          const matchesExpiry =
            this.matchesExpiryFilter(
              tenant
            );


          return (

            matchesSearch &&

            matchesPlan &&

            matchesStatus &&

            matchesExpiry

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedPlan = '';

    this.selectedStatus = '';

    this.selectedExpiry = '';

    this.applyFilters();

  }


  // =====================================================
  // EXPIRY FILTER
  // =====================================================

  private matchesExpiryFilter(
    tenant: Tenant
  ): boolean {

    if (
      !this.selectedExpiry
    ) {

      return true;

    }


    if (
      this.selectedExpiry ===
        'no-end-date'
    ) {

      return !tenant.subscriptionEndDate;

    }


    if (
      !tenant.subscriptionEndDate
    ) {

      return false;

    }


    const daysRemaining =
      this.getDaysRemaining(
        tenant.subscriptionEndDate
      );


    switch (
      this.selectedExpiry
    ) {

      case 'expiring-30':

        return (
          daysRemaining >= 0 &&
          daysRemaining <= 30
        );


      case 'expiring-7':

        return (
          daysRemaining >= 0 &&
          daysRemaining <= 7
        );


      case 'expired':

        return daysRemaining < 0;


      default:

        return true;

    }

  }


  // =====================================================
  // DAYS REMAINING
  // =====================================================

  getDaysRemaining(
    endDate:
      string |
      null |
      undefined
  ): number {

    if (!endDate) {

      return 0;

    }


    const today =
      new Date();


    today.setHours(
      0,
      0,
      0,
      0
    );


    const expiry =
      new Date(
        endDate
      );


    expiry.setHours(
      0,
      0,
      0,
      0
    );


    const difference =
      expiry.getTime() -
      today.getTime();


    return Math.ceil(
      difference /
      (
        1000 *
        60 *
        60 *
        24
      )
    );

  }


  getExpiryLabel(
    tenant: Tenant
  ): string {

    if (
      !tenant.subscriptionEndDate
    ) {

      return 'No expiry';

    }


    const days =
      this.getDaysRemaining(
        tenant.subscriptionEndDate
      );


    if (
      days < 0
    ) {

      return 'Expired';

    }


    if (
      days === 0
    ) {

      return 'Expires today';

    }


    if (
      days === 1
    ) {

      return '1 day left';

    }


    return `${days} days left`;

  }


  getExpiryClass(
    tenant: Tenant
  ): string {

    if (
      !tenant.subscriptionEndDate
    ) {

      return 'normal';

    }


    const days =
      this.getDaysRemaining(
        tenant.subscriptionEndDate
      );


    if (
      days < 0
    ) {

      return 'expired';

    }


    if (
      days <= 7
    ) {

      return 'critical';

    }


    if (
      days <= 30
    ) {

      return 'warning';

    }


    return 'normal';

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusLabel(
    status: string
  ): string {

    if (
      status === 'past_due'
    ) {

      return 'Past Due';

    }


    return status
      .replace(
        '_',
        ' '
      )
      .replace(
        /\b\w/g,
        letter =>
          letter.toUpperCase()
      );

  }


  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(
        '_',
        '-'
      );

  }


  // =====================================================
  // PRICE
  // =====================================================

  getSubscriptionPrice(
    plan?: SubscriptionPlan
  ): number | null {

    if (!plan) {

      return null;

    }


    if (
      plan.billingCycle ===
        'monthly'
    ) {

      return (
        plan.priceMonthly ??
        null
      );

    }


    if (
      plan.billingCycle ===
        'yearly'
    ) {

      return (
        plan.priceYearly ??
        null
      );

    }


    return null;

  }


  getBillingLabel(
    plan?: SubscriptionPlan
  ): string {

    if (!plan) {

      return '-';

    }


    return plan.billingCycle
      .charAt(0)
      .toUpperCase() +
      plan.billingCycle.slice(1);

  }


  // =====================================================
  // NAVIGATION
  // =====================================================

  openTenant(
    tenant: Tenant
  ): void {

    this.router.navigate([
      '/platform/tenants',
      tenant.tenantId
    ]);

  }


  manageSubscription(
    event: Event,
    tenant: Tenant
  ): void {

    event.stopPropagation();


    this.router.navigate([
      '/platform/tenants',
      tenant.tenantId,
      'edit'
    ]);

  }


  goToDashboard(): void {

    this.router.navigate([
      '/platform/dashboard'
    ]);

  }

}