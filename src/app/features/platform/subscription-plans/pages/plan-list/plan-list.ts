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

            matchesStatus

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.applyFilters();

  }


  createPlan(): void {

    const activePlan =
      this.plans.find(
        plan =>
          plan.isActive
      );

    if (activePlan) {

      this.router.navigate([
        '/platform/subscription-plans',
        activePlan.subscriptionPlanId,
        'edit'
      ]);

      return;

    }

    this.router.navigate([
      '/platform/subscription-plans/new'
    ]);

  }


  getCurrentPlan(): SubscriptionPlan | undefined {

    return this.plans[0];

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