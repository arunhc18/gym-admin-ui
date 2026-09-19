import {
  CommonModule
} from '@angular/common';

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
  decimalPlacesValidator,
  noWhitespaceValidator,
  pricingValidator,
  trimmedMinLengthValidator,
  wholeNumberValidator,
  containsLetterValidator,
  containsLetterOrNumberValidator,
  allowedValueValidator
} from '../../../../../shared/validators/platform-form.validators';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  SubscriptionPlanRequest
} from '../../models/subscription-plan.model';

import {
  SubscriptionPlanService
} from '../../services/subscription-plan';


@Component({
  selector: 'app-plan-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl: './plan-form.html',

  styleUrl: './plan-form.scss'
})
export class PlanFormComponent
  implements OnInit {


  isEditMode = false;

  planId?: number;

  isSubmitting = false;

  submitted = false;


  readonly planForm;


  constructor(

    private readonly fb:
      FormBuilder,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly planService:
      SubscriptionPlanService

  ) {


    this.planForm =
      this.fb.group({

        planCode: [
          '',
          [
            Validators.required,
            trimmedMinLengthValidator(2),
            containsLetterOrNumberValidator,
            Validators.maxLength(50),
            Validators.pattern(
              /^[A-Za-z0-9_-]+$/
            )
          ]
        ],

        planName: [
          '',
          [
            Validators.required,
            noWhitespaceValidator,
            trimmedMinLengthValidator(2),
            Validators.maxLength(100),
            containsLetterValidator
          ]
        ],

        description: [
          '',
          [
            Validators.maxLength(500)
          ]
        ],

        maxLocations: [
          1,
          [
            Validators.required,
            wholeNumberValidator,
            Validators.min(1),
            Validators.max(1000)
          ]
        ],

        maxMembers: [
          100,
          [
            Validators.required,
            wholeNumberValidator,
            Validators.min(1),
            Validators.max(1000000)
          ]
        ],

        maxStaffUsers: [
          '',
          [
            wholeNumberValidator,
            Validators.min(1),
            Validators.max(1000000)
          ]
        ],

        priceMonthly: [
          '',
          [
            Validators.min(0),
            decimalPlacesValidator(2)
          ]
        ],

        priceYearly: [
          '',
          [
            Validators.min(0),
            decimalPlacesValidator(2)
          ]
        ],

        billingCycle: [
          'monthly',
          [
            Validators.required
            ,
            allowedValueValidator(['monthly', 'yearly', 'lifetime'])
          ]
        ],

        displayOrder: [
          0,
          [
            Validators.min(0)
            ,
            wholeNumberValidator,
            Validators.max(1000000)
          ]
        ],

        isActive: [true]

      }, {
        validators: pricingValidator(
          'billingCycle',
          'priceMonthly',
          'priceYearly'
        )

      });

  }


  ngOnInit(): void {

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

      this.planId = id;


      this.planService
        .getPlanById(id)
        .subscribe(
          plan => {

            if (!plan) {

              this.router.navigate([
                '/platform/subscription-plans'
              ]);

              return;

            }


            this.planForm.patchValue({

              planCode:
                plan.planCode,

              planName:
                plan.planName,

              description:
                plan.description ?? '',

              maxLocations:
                plan.maxLocations,

              maxMembers:
                plan.maxMembers,

              maxStaffUsers:
                plan.maxStaffUsers === null || plan.maxStaffUsers === undefined
                  ? ''
                  : String(plan.maxStaffUsers),

              priceMonthly:
                plan.priceMonthly === null || plan.priceMonthly === undefined
                  ? ''
                  : String(plan.priceMonthly),

              priceYearly:
                plan.priceYearly === null || plan.priceYearly === undefined
                  ? ''
                  : String(plan.priceYearly),

              billingCycle:
                plan.billingCycle,

              displayOrder:
                plan.displayOrder,

              isActive:
                plan.isActive

            });

          }
        );

    }

  }


  onSubmit(): void {

    this.submitted = true;

    const currentValue = this.planForm.getRawValue();
    this.planForm.patchValue({
      planCode: String(currentValue.planCode ?? '').trim().toUpperCase(),
      planName: String(currentValue.planName ?? '').trim(),
      description: String(currentValue.description ?? '').trim()
    }, { emitEvent: false });
    this.planForm.updateValueAndValidity();

    if (
      this.planForm.invalid
    ) {

      this.planForm
        .markAllAsTouched();

      return;

    }


    const formValue =
      this.planForm.getRawValue();


    const planCode =
      String(formValue.planCode ?? '')
        .trim()
        .toUpperCase();


    if (
      this.planService
        .isPlanCodeTaken(
          planCode,
          this.planId
        )
    ) {

      this.addError('planCode', 'duplicate');
      this.planForm.controls['planCode'].markAsTouched();

      return;

    }


    this.isSubmitting = true;


    const request:
      SubscriptionPlanRequest = {

      planCode,

      planName:
        String(formValue.planName ?? '').trim(),

      description:
        String(formValue.description ?? '').trim(),

      maxLocations:
        Number(
          formValue.maxLocations
        ),

      maxMembers:
        Number(
          formValue.maxMembers
        ),

      maxStaffUsers:
        this.optionalNumber(formValue.maxStaffUsers),

      priceMonthly:
        this.optionalNumber(formValue.priceMonthly),

      priceYearly:
        this.optionalNumber(formValue.priceYearly),

      billingCycle:
        formValue.billingCycle as
          'monthly' |
          'yearly' |
          'lifetime',

      displayOrder:
        Number(
          formValue.displayOrder
        ),

      isActive:
        formValue.isActive ?? true

    };


    if (
      this.isEditMode &&
      this.planId
    ) {

      this.planService
        .updatePlan(
          this.planId,
          request
        );


      this.router.navigate([
        '/platform/subscription-plans',
        this.planId
      ]);

    }
    else {

      const created =
        this.planService
          .createPlan(
            request
          );


      this.router.navigate([
        '/platform/subscription-plans',
        created.subscriptionPlanId
      ]);

    }

  }


  hasError(
    controlName: keyof typeof this.planForm.controls,
    errorName: string
  ): boolean {

    const control =
      this.planForm.controls[
        controlName
      ];


    return (

      this.shouldShow(control) &&

      control.hasError(
        errorName
      )

    );

  }

  isInvalid(controlName: keyof typeof this.planForm.controls): boolean {
    const control = this.planForm.controls[controlName];
    return this.shouldShow(control) && control.invalid;
  }

  formHasError(errorName: string): boolean {
    return this.submitted && this.planForm.hasError(errorName);
  }

  onPlanCodeInput(): void {
    const control = this.planForm.controls['planCode'];
    const normalized = String(control.value ?? '').toUpperCase();
    if (normalized !== control.value) {
      control.setValue(normalized, { emitEvent: false });
    }
  }

  private addError(
    controlName: keyof typeof this.planForm.controls,
    errorName: string
  ): void {
    const control = this.planForm.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), [errorName]: true });
  }

  private shouldShow(control: { touched: boolean; dirty: boolean }): boolean {
    return this.submitted || control.touched || control.dirty;
  }

  private optionalNumber(value: number | string | null | undefined): number | null {
    return value === null || value === undefined || value === ''
      ? null
      : Number(value);
  }

}