import { CommonModule } from '@angular/common';

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
  selector: 'app-tenant-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './tenant-details.html',

  styleUrl:
    './tenant-details.scss'
})
export class TenantDetailsComponent
  implements OnInit {


  tenant?: Tenant;

  plan?: SubscriptionPlan;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly tenantService:
      TenantService,

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


    if (!id) {

      this.goBack();

      return;

    }


    this.tenantService
      .getTenantById(id)
      .subscribe(
        tenant => {

          if (!tenant) {

            this.goBack();

            return;

          }


          this.tenant = tenant;


          this.planService
            .getPlanById(
              tenant.subscriptionPlanId
            )
            .subscribe(
              plan => {

                this.plan = plan;

              }
            );

        }
      );

  }


  editTenant(): void {

    if (!this.tenant) {
      return;
    }


    this.router.navigate([
      '/platform/tenants',
      this.tenant.tenantId,
      'edit'
    ]);

  }


  toggleActive(): void {

    if (!this.tenant) {
      return;
    }


    this.tenantService
      .setTenantActiveStatus(
        this.tenant.tenantId,
        !this.tenant.isActive
      );

  }


  getEffectiveLocations(): number | string {

    return (
      this.tenant?.maxLocations ??
      this.plan?.maxLocations ??
      '-'
    );

  }


  getEffectiveMembers(): number | string {

    return (
      this.tenant?.maxMembers ??
      this.plan?.maxMembers ??
      '-'
    );

  }


  goBack(): void {

    this.router.navigate([
      '/platform/tenants'
    ]);

  }

}