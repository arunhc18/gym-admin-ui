import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import {
  SubscriptionPlan
} from '../../../subscription-plans/models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../../../subscription-plans/services/subscription-plan';

import {
  Tenant
} from '../../models/tenant.model';

import {
  TenantService
} from '../../services/tenant';


@Component({
  selector: 'app-tenant-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './tenant-list.html',

  styleUrl: './tenant-list.scss'
})
export class TenantListComponent
  implements OnInit {


  tenants: Tenant[] = [];

  filteredTenants: Tenant[] = [];

  plans: SubscriptionPlan[] = [];


  searchText = '';

  selectedStatus = '';

  selectedPlan = '';


  constructor(

    private readonly tenantService:
      TenantService,

    private readonly planService:
      SubscriptionPlanService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {

    this.planService
      .getPlans()
      .subscribe(
        plans => {

          this.plans = plans;

        }
      );


    this.tenantService
      .getTenants()
      .subscribe(
        tenants => {

          this.tenants = tenants;

          this.applyFilters();

        }
      );

  }


  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredTenants =
      this.tenants.filter(
        tenant => {


          const matchesSearch =

            !search ||

            tenant.tenantName
              .toLowerCase()
              .includes(search) ||

            tenant.subdomain
              .toLowerCase()
              .includes(search);


          const matchesStatus =

            !this.selectedStatus ||

            tenant.subscriptionStatus ===
              this.selectedStatus;


          const matchesPlan =

            !this.selectedPlan ||

            tenant.subscriptionPlanId ===
              Number(
                this.selectedPlan
              );


          return (

            matchesSearch &&

            matchesStatus &&

            matchesPlan

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.selectedPlan = '';

    this.applyFilters();

  }


  getPlanName(
    planId: number
  ): string {

    return (
      this.plans.find(
        plan =>
          plan.subscriptionPlanId ===
          planId
      )?.planName ??
      '-'
    );

  }


  createTenant(): void {

    this.router.navigate([
      '/platform/tenants/new'
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


  editTenant(
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


  toggleActive(
    event: Event,
    tenant: Tenant
  ): void {

    event.stopPropagation();


    this.tenantService
      .setTenantActiveStatus(
        tenant.tenantId,
        !tenant.isActive
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


  getStatusLabel(
    status: string
  ): string {

    switch (status) {

      case 'past_due':

        return 'Past Due';

      default:

        return status
          .replace('_', ' ')
          .replace(
            /\b\w/g,
            value =>
              value.toUpperCase()
          );

    }

  }


  goToDashboard(): void {

    this.router.navigate([
      '/platform/dashboard'
    ]);

  }

}