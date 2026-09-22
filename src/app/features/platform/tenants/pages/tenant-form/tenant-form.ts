import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  allowedValueValidator,
  containsLetterValidator,
  dateRangeValidator,
  noWhitespaceValidator,
  subdomainValidator,
  tenantLimitValidator,
  trimmedMinLengthValidator,
  validDateValidator,
  wholeNumberValidator
} from '../../../../../shared/validators/platform-form.validators';

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
  SubscriptionStatus,
  TenantRequest
} from '../../models/tenant.model';

import {
  TenantService
} from '../../services/tenant';


@Component({
  selector: 'app-tenant-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './tenant-form.html',

  styleUrl:
    './tenant-form.scss'
})
export class TenantFormComponent
  implements OnInit {


  plans: SubscriptionPlan[] = [];

  private allPlans: SubscriptionPlan[] = [];

  selectedPlan?: SubscriptionPlan;

  tenantId?: number;

  isEditMode = false;

  isSubmitting = false;

  submitted = false;


  readonly tenantForm;


  constructor(

    private readonly fb:
      FormBuilder,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly tenantService:
      TenantService,

    private readonly planService:
      SubscriptionPlanService

  ) {


    this.tenantForm =
      this.fb.group({

        tenantName: [
          '',
          [
            Validators.required,
            noWhitespaceValidator,
            trimmedMinLengthValidator(2),
            containsLetterValidator,
            Validators.maxLength(200)
          ]
        ],

        subdomain: [
          '',
          [
            Validators.required,
            trimmedMinLengthValidator(2),
            Validators.maxLength(100),
            subdomainValidator
          ]
        ],

        subscriptionPlanId: [
          null as number | null,
          [
            Validators.required
          ]
        ],

        subscriptionBillingCycle: [
          'monthly',
          [
            Validators.required,
            allowedValueValidator(['monthly', 'quarterly', 'half_yearly', 'annual'])
          ]
        ],

        subscriptionStatus: [
          'active',
          [
            Validators.required
            ,
            validDateValidator
          ]
        ],

        subscriptionStartDate: [
          this.getToday(),
          [
            Validators.required
          ]
        ],

        subscriptionEndDate: [
          '',
          [validDateValidator]
        ],

        inheritPlanLimits: [
          true
        ],

        maxLocations: [
          null as number | null,
          [
            Validators.min(1)
            ,
            wholeNumberValidator,
            Validators.max(1000)
          ]
        ],

        maxMembers: [
          null as number | null,
          [
            Validators.min(1)
            ,
            wholeNumberValidator,
            Validators.max(1000000)
          ]
        ],

        isActive: [true]

      }, {
        validators: [
          dateRangeValidator(
            'subscriptionStartDate',
            'subscriptionEndDate'
          ),
          tenantLimitValidator(
            'inheritPlanLimits',
            'maxLocations',
            'maxMembers'
          )
        ]

      });

    this.updateOverrideControls(true);

  }


  ngOnInit(): void {

    this.planService
      .getPlans()
      .subscribe(
        plans => {

          this.allPlans = plans;
          this.refreshAvailablePlans();

          if (!this.tenantForm.controls['subscriptionPlanId'].value && this.plans.length > 0) {
            const defaultPlan = this.plans.find(plan => plan.isActive) ?? this.plans[0];
            this.tenantForm.controls['subscriptionPlanId'].setValue(defaultPlan.subscriptionPlanId, { emitEvent: false });
          }

          this.updateSelectedPlan();

        }
      );


    this.tenantForm
      .controls
      .subscriptionPlanId
      .valueChanges
      .subscribe(
        () => {

          this.updateSelectedPlan();

        }
      );

    this.tenantForm.controls['subscriptionStartDate'].valueChanges.subscribe(() => {
      this.updateSubscriptionEndDate();
    });

    this.tenantForm.controls['subscriptionBillingCycle'].valueChanges.subscribe(() => {
      this.updateSubscriptionEndDate();
    });

    this.tenantForm.controls['inheritPlanLimits'].valueChanges.subscribe(
      inherit => this.updateOverrideControls(inherit ?? true)
    );


    const id =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      id &&
      !Number.isNaN(id)
    ) {

      this.isEditMode = true;

      this.tenantId = id;


      this.tenantService
        .getTenantById(id)
        .subscribe(
          tenant => {

            if (!tenant) {

              this.goBack();

              return;

            }


            const inheritsLimits =

              tenant.maxLocations ===
                null ||

              tenant.maxLocations ===
                undefined;


            this.tenantForm.patchValue({

              tenantName:
                tenant.tenantName,

              subdomain:
                tenant.subdomain,

              subscriptionPlanId:
                tenant.subscriptionPlanId,

              subscriptionBillingCycle:
                tenant.subscriptionBillingCycle,

              subscriptionStatus:
                tenant.subscriptionStatus,

              subscriptionStartDate:
                tenant.subscriptionStartDate,

              subscriptionEndDate:
                tenant.subscriptionEndDate ??
                '',

              inheritPlanLimits:
                inheritsLimits,

              maxLocations:
                tenant.maxLocations ??
                null,

              maxMembers:
                tenant.maxMembers ??
                null,

              isActive:
                tenant.isActive

            });


            this.refreshAvailablePlans();
            this.updateSelectedPlan();

          }
        );

    }

  }


  onSubdomainInput(): void {

    const control =
      this.tenantForm
        .controls
        .subdomain;


    const value =
      control.value ?? '';


    const normalized =
      value
        .toLowerCase()
          .toLowerCase();


    if (
      normalized !== value
    ) {

      control.setValue(
        normalized,
        {
          emitEvent: false
        }
      );

    }

  }


  updateSelectedPlan(): void {

    const planId =
      Number(
        this.tenantForm
          .controls
          .subscriptionPlanId
          .value
      );


    this.selectedPlan =
      this.plans.find(
        plan =>
          plan.subscriptionPlanId ===
          planId
      );

  }

  private refreshAvailablePlans(): void {
    const selectedPlanId = this.tenantForm.controls['subscriptionPlanId'].value;
    this.plans = this.allPlans.filter(
      plan => plan.isActive || plan.subscriptionPlanId === selectedPlanId
    );
  }


  onSubmit(): void {

    this.submitted = true;

    const currentValue = this.tenantForm.getRawValue();
    this.tenantForm.patchValue({
      tenantName: String(currentValue.tenantName ?? '').trim(),
      subdomain: String(currentValue.subdomain ?? '').trim().toLowerCase()
    }, { emitEvent: false });
    this.tenantForm.updateValueAndValidity();

    if (
      this.tenantForm.invalid
    ) {

      this.tenantForm
        .markAllAsTouched();

      return;

    }


    const formValue =
      this.tenantForm.getRawValue();


    const subdomain =
      (
        formValue.subdomain ??
        ''
      )
        .trim()
        .toLowerCase();


    if (
      this.tenantService
        .isSubdomainTaken(
          subdomain,
          this.tenantId
        )
    ) {

      this.addError('subdomain', 'duplicate');
      this.tenantForm.controls['subdomain'].markAsTouched();

      return;

    }

    if (!this.selectedPlan) {
      this.addError('subscriptionPlanId', 'inactivePlan');
      this.tenantForm.controls['subscriptionPlanId'].markAsTouched();
      return;
    }


    const inheritLimits =
      formValue.inheritPlanLimits ??
      true;

    const selectedPlan = this.allPlans.find(
      plan => plan.subscriptionPlanId === Number(formValue.subscriptionPlanId)
    ) ?? this.plans[0];

    const computedEndDate = this.calculateSubscriptionEndDate(
      String(formValue.subscriptionStartDate ?? ''),
      (formValue.subscriptionBillingCycle ?? 'monthly') as any
    );

    const request:
      TenantRequest = {

      tenantName:
        String(formValue.tenantName ?? '').trim(),

      subdomain,

      subscriptionPlanId:
        Number(
          formValue.subscriptionPlanId ?? selectedPlan?.subscriptionPlanId ?? 1
        ),

      subscriptionBillingCycle:
        (formValue.subscriptionBillingCycle ?? 'monthly') as any,

      subscriptionStatus:
        formValue.subscriptionStatus as
          SubscriptionStatus,

      subscriptionStartDate:
        String(formValue.subscriptionStartDate ?? ''),

      subscriptionEndDate:
        formValue.subscriptionEndDate || computedEndDate,

      maxLocations:

        inheritLimits

          ? null

          : Number(
              formValue.maxLocations
            ),

      maxMembers:

        inheritLimits

          ? null

          : Number(
              formValue.maxMembers
            ),

      isActive:
        formValue.isActive ??
        true

    };


    this.isSubmitting = true;


    if (
      this.isEditMode &&
      this.tenantId
    ) {

      this.tenantService
        .updateTenant(
          this.tenantId,
          request
        );


      this.router.navigate([
        '/platform/tenants',
        this.tenantId
      ]);

      return;

    }


    const created =
      this.tenantService
        .createTenant(
          request
        );


    this.router.navigate([
      '/platform/tenants',
      created.tenantId
    ]);

  }


  hasError(
    controlName:
      keyof typeof this.tenantForm.controls,
    errorName: string
  ): boolean {

    const control =
      this.tenantForm.controls[
        controlName
      ];


    return (

      this.shouldShow(control) &&

      control.hasError(
        errorName
      )

    );

  }

  isInvalid(controlName: keyof typeof this.tenantForm.controls): boolean {
    const control = this.tenantForm.controls[controlName];
    return this.shouldShow(control) && control.invalid;
  }

  formHasError(errorName: string): boolean {
    return this.submitted && this.tenantForm.hasError(errorName);
  }

  dateRangeError(): boolean {
    const endDate = this.tenantForm.controls['subscriptionEndDate'];
    return this.tenantForm.hasError('beforeStartDate') && this.shouldShow(endDate);
  }

  private addError(
    controlName: keyof typeof this.tenantForm.controls,
    errorName: string
  ): void {
    const control = this.tenantForm.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), [errorName]: true });
  }

  private shouldShow(control: { touched: boolean; dirty: boolean }): boolean {
    return this.submitted || control.touched || control.dirty;
  }

  private updateOverrideControls(inherit: boolean): void {
    const locations = this.tenantForm.controls['maxLocations'];
    const members = this.tenantForm.controls['maxMembers'];

    if (inherit) {
      locations.reset(null, { emitEvent: false });
      members.reset(null, { emitEvent: false });
      locations.disable({ emitEvent: false });
      members.disable({ emitEvent: false });
      return;
    }

    locations.enable({ emitEvent: false });
    members.enable({ emitEvent: false });
    locations.setValidators([
      Validators.required,
      wholeNumberValidator,
      Validators.min(1),
      Validators.max(1000)
    ]);
    members.setValidators([
      Validators.required,
      wholeNumberValidator,
      Validators.min(1),
      Validators.max(1000000)
    ]);
    locations.updateValueAndValidity({ emitEvent: false });
    members.updateValueAndValidity({ emitEvent: false });
  }

  private updateSubscriptionEndDate(): void {
    const startDate = this.tenantForm.controls['subscriptionStartDate'].value;
    const billingCycle = this.tenantForm.controls['subscriptionBillingCycle'].value as
      | 'monthly'
      | 'quarterly'
      | 'half_yearly'
      | 'annual'
      | null;

    if (!startDate || !billingCycle) {
      return;
    }

    const calculated = this.calculateSubscriptionEndDate(startDate, billingCycle);
    const currentEnd = this.tenantForm.controls['subscriptionEndDate'].value;

    if (!currentEnd || currentEnd === '' || currentEnd < calculated) {
      this.tenantForm.controls['subscriptionEndDate'].setValue(calculated, { emitEvent: false });
    }
  }

  private calculateSubscriptionEndDate(
    startDate: string,
    billingCycle: 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
  ): string {
    const [year, month, day] = startDate.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    const monthOffset =
      billingCycle === 'monthly'
        ? 1
        : billingCycle === 'quarterly'
          ? 3
          : billingCycle === 'half_yearly'
            ? 6
            : 12;

    const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, baseDate.getDate());
    const formatted = [
      nextDate.getFullYear(),
      String(nextDate.getMonth() + 1).padStart(2, '0'),
      String(nextDate.getDate()).padStart(2, '0')
    ].join('-');

    return formatted;
  }


  goBack(): void {

    this.router.navigate([
      '/platform/tenants'
    ]);

  }


  private getToday(): string {

    const today =
      new Date();


    return [

      today.getFullYear(),

      String(
        today.getMonth() + 1
      ).padStart(
        2,
        '0'
      ),

      String(
        today.getDate()
      ).padStart(
        2,
        '0'
      )

    ].join('-');

  }

}