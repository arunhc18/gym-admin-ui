import { CommonModule } from '@angular/common';

import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';

import { Router } from '@angular/router';

import {
  combineLatest
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  SubscriptionPlan
} from '../subscription-plans/models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../subscription-plans/services/subscription-plan';

import {
  Tenant
} from '../tenants/models/tenant.model';

import {
  TenantService
} from '../tenants/services/tenant';


interface PlanOverview {
  plan: SubscriptionPlan;
  tenantCount: number;
  percentage: number;
}


@Component({
  selector: 'app-platform-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.scss'
})
export class PlatformDashboardComponent
  implements OnInit {


  private readonly destroyRef =
    inject(DestroyRef);


  tenants: Tenant[] = [];

  plans: SubscriptionPlan[] = [];


  totalTenants = 0;

  activeTenants = 0;

  totalPlans = 0;

  monthlyRevenue = 0;


  recentTenants: Tenant[] = [];

  planOverview: PlanOverview[] = [];


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
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        ([tenants, plans]) => {

          this.tenants =
            tenants;

          this.plans =
            plans;


          this.calculateDashboard();

        }
      );

  }


  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  private calculateDashboard(): void {


    // TOTAL TENANTS

    this.totalTenants =
      this.tenants.length;


    // ACTIVE TENANTS

    this.activeTenants =
      this.tenants.filter(
        tenant =>
          tenant.isActive &&
          tenant.subscriptionStatus ===
            'active'
      ).length;


    // ACTIVE SUBSCRIPTION PLANS

    this.totalPlans =
      this.plans.filter(
        plan =>
          plan.isActive
      ).length;


    // MONTHLY REVENUE

    this.monthlyRevenue =
      this.calculateMonthlyRevenue();


    // RECENT TENANTS

    this.recentTenants =
      [...this.tenants]

        .sort(
          (a, b) => {

            const dateA =
              new Date(
                a.createdAt ??
                a.subscriptionStartDate
              ).getTime();


            const dateB =
              new Date(
                b.createdAt ??
                b.subscriptionStartDate
              ).getTime();


            return dateB - dateA;

          }
        )

        .slice(
          0,
          5
        );


    // SUBSCRIPTION OVERVIEW

    this.calculatePlanOverview();

  }


  // =====================================================
  // MONTHLY REVENUE
  // =====================================================

  private calculateMonthlyRevenue(): number {

    let total = 0;


    const activeTenants =
      this.tenants.filter(
        tenant =>
          tenant.isActive &&
          tenant.subscriptionStatus ===
            'active'
      );


    for (
      const tenant of activeTenants
    ) {

      const plan =
        this.getPlan(
          tenant.subscriptionPlanId
        );


      if (!plan) {

        continue;

      }


      // MONTHLY PLAN

      if (
        plan.billingCycle ===
          'monthly'
      ) {

        total +=
          plan.priceMonthly ??
          0;

      }


      // YEARLY PLAN
      // Convert annual price to estimated monthly revenue.

      else if (
        plan.billingCycle ===
          'yearly'
      ) {

        total +=
          (
            plan.priceYearly ??
            0
          ) / 12;

      }


      // LIFETIME
      // Current DB does not have price_lifetime,
      // therefore lifetime revenue is not included
      // in monthly recurring revenue.

    }


    return Math.round(
      total
    );

  }


  // =====================================================
  // PLAN OVERVIEW
  // =====================================================

  private calculatePlanOverview(): void {

    if (
      this.tenants.length === 0
    ) {

      this.planOverview = [];

      return;

    }


    this.planOverview =
      this.plans

        .map(
          plan => {

            const tenantCount =
              this.tenants.filter(
                tenant =>
                  tenant.subscriptionPlanId ===
                    plan.subscriptionPlanId
              ).length;


            const percentage =

              this.totalTenants === 0

                ? 0

                : Math.round(
                    (
                      tenantCount /
                      this.totalTenants
                    ) * 100
                  );


            return {

              plan,

              tenantCount,

              percentage

            };

          }
        )

        .filter(
          item =>
            item.tenantCount > 0
        )

        .sort(
          (a, b) =>
            b.tenantCount -
            a.tenantCount
        );

  }


  // =====================================================
  // PLAN HELPERS
  // =====================================================

  getPlan(
    planId: number
  ): SubscriptionPlan | undefined {

    return this.plans.find(
      plan =>
        plan.subscriptionPlanId ===
          planId
    );

  }


  getPlanName(
    planId: number
  ): string {

    return (
      this.getPlan(
        planId
      )?.planName ??
      'Unknown Plan'
    );

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
        value =>
          value.toUpperCase()
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
  // NAVIGATION
  // =====================================================

  openTenants(): void {

    this.router.navigate([
      '/platform/tenants'
    ]);

  }


  openActiveTenants(): void {

    this.router.navigate([
      '/platform/tenants'
    ]);

  }


  openSubscriptionPlans(): void {

    this.router.navigate([
      '/platform/subscription-plans'
    ]);

  }


  openTenant(
    tenant: Tenant
  ): void {

    this.router.navigate([
      '/platform/tenants',
      tenant.tenantId
    ]);

  }


  openSubscriptions(): void {

    this.router.navigate([
      '/platform/subscriptions'
    ]);

  }

}