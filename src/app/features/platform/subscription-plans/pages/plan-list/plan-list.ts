import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  SubscriptionPlan
} from '../../models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../../services/subscription-plan';


@Component({
  selector: 'app-plan-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './plan-list.html',

  styleUrl: './plan-list.scss'
})
export class PlanListComponent
  implements OnInit {


  plans: SubscriptionPlan[] = [];

  filteredPlans:
    SubscriptionPlan[] = [];


  searchText = '';

  selectedBillingCycle = '';

  selectedStatus = '';


  constructor(

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

          this.plans = [
            ...plans
          ].sort(
            (a, b) =>
              a.displayOrder -
              b.displayOrder
          );


          this.applyFilters();

        }
      );

  }


  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredPlans =
      this.plans.filter(
        plan => {


          const matchesSearch =

            !search ||

            plan.planName
              .toLowerCase()
              .includes(search) ||

            plan.planCode
              .toLowerCase()
              .includes(search);


          const matchesBilling =

            !this.selectedBillingCycle ||

            plan.billingCycle ===
              this.selectedBillingCycle;


          const matchesStatus =

            !this.selectedStatus ||

            (
              this.selectedStatus ===
                'active'
                ? plan.isActive
                : !plan.isActive
            );


          return (

            matchesSearch &&

            matchesBilling &&

            matchesStatus

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedBillingCycle = '';

    this.selectedStatus = '';

    this.applyFilters();

  }


  createPlan(): void {

    this.router.navigate([
      '/platform/subscription-plans/new'
    ]);

  }


  openPlan(
    plan: SubscriptionPlan
  ): void {

    this.router.navigate([
      '/platform/subscription-plans',
      plan.subscriptionPlanId
    ]);

  }


  editPlan(
    event: Event,
    plan: SubscriptionPlan
  ): void {

    event.stopPropagation();


    this.router.navigate([
      '/platform/subscription-plans',
      plan.subscriptionPlanId,
      'edit'
    ]);

  }


  toggleStatus(
    event: Event,
    plan: SubscriptionPlan
  ): void {

    event.stopPropagation();


    this.planService
      .setPlanStatus(
        plan.subscriptionPlanId,
        !plan.isActive
      );

  }


  goToDashboard(): void {

    this.router.navigate([
      '/platform/dashboard'
    ]);

  }

}