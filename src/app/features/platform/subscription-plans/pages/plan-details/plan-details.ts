import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  SubscriptionPlan
} from '../../models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../../services/subscription-plan';


@Component({
  selector: 'app-plan-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './plan-details.html',

  styleUrl:
    './plan-details.scss'
})
export class PlanDetailsComponent
  implements OnInit {


  plan?: SubscriptionPlan;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly planService:
      SubscriptionPlanService

  ) {}


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !id ||
      Number.isNaN(id)
    ) {

      this.goBack();

      return;

    }


    this.planService
      .getPlanById(id)
      .subscribe(
        plan => {

          if (!plan) {

            this.goBack();

            return;

          }


          this.plan = plan;

        }
      );

  }


  editPlan(): void {

    if (!this.plan) {

      return;

    }


    this.router.navigate([
      '/platform/subscription-plans',
      this.plan.subscriptionPlanId,
      'edit'
    ]);

  }


  toggleStatus(): void {

    if (!this.plan) {

      return;

    }


    this.planService
      .setPlanStatus(
        this.plan.subscriptionPlanId,
        !this.plan.isActive
      );

  }


  goBack(): void {

    this.router.navigate([
      '/platform/subscription-plans'
    ]);

  }

}