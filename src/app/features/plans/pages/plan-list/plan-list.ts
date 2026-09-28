import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  FormsModule
} from '@angular/forms';

import {
  CreateMembershipPlanRequest,
  MembershipPlan,
  PlanAccessType,
  PlanBillingCycle,
  PlanCategory,
  PlanDurationType
} from '../../models/membership-plan.model';

import {
  MembershipPlanService
} from '../../services/membership-plan.service';


@Component({
  selector:
    'app-plan-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './plan-list.html',

  styleUrl:
    './plan-list.scss'
})
export class PlanListComponent
  implements OnInit {


  readonly tenantId = 1;


  plans:
    MembershipPlan[] = [];


  filteredPlans:
    MembershipPlan[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchText = '';

  selectedPlanCategory = '';

  selectedBilling = '';


  // =====================================================
  // PLAN MODAL
  // =====================================================

  showPlanModal =
    false;


  editingPlanId:
    number | null = null;


  submitted =
    false;


  // =====================================================
  // CONFIRM MODAL
  // =====================================================

  showStatusConfirm =
    false;


  statusPlan:
    MembershipPlan | null = null;


  // =====================================================
  // OPTIONS
  // =====================================================

  durationTypes:
    {
      value:
        PlanDurationType;
      label:
        string;
    }[] = [

      {
        value: 'days',
        label: 'Days'
      },

      {
        value: 'months',
        label: 'Months'
      },

      {
        value: 'years',
        label: 'Years'
      },

      {
        value: 'sessions',
        label: 'Sessions'
      }

    ];


  billingCycles:
    {
      value:
        PlanBillingCycle;
      label:
        string;
    }[] = [

      {
        value: 'monthly',
        label: 'Monthly'
      },

      {
        value: 'quarterly',
        label: 'Quarterly'
      },

      {
        value: 'half_yearly',
        label: 'Half Yearly'
      },

      {
        value: 'yearly',
        label: 'Yearly'
      },

      {
        value: 'one_time',
        label: 'One Time'
      }

    ];


  accessTypes:
    {
      value:
        PlanAccessType;
      label:
        string;
    }[] = [

      {
        value: 'home_location',
        label: 'Home Location'
      },

      {
        value: 'all_locations',
        label: 'All Locations'
      }

    ];


  planCategories:
    {
      value: PlanCategory;
      label: string;
    }[] = [

      {
        value: 'membership',
        label: 'Membership Plans'
      },

      {
        value: 'personal_training',
        label: 'Personal Training Plans'
      }

    ];


  // =====================================================
  // FORM
  // =====================================================

  private readonly fb =
    inject(FormBuilder);


  planForm =
    this.fb.nonNullable.group({

      planName: [
        '',
        [
          Validators.required,
          Validators.maxLength(
            100
          )
        ]
      ],

      planCategory: [
        'membership' as PlanCategory,
        Validators.required
      ],

      planCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(
            50
          ),
          Validators.pattern(
            /^[A-Za-z0-9_-]+$/
          )
        ]
      ],

      description: [
        '',
        Validators.maxLength(
          500
        )
      ],

      durationValue: [
        1,
        [
          Validators.required,
          Validators.min(
            1
          )
        ]
      ],

      durationType: [
        'months' as
          PlanDurationType,
        Validators.required
      ],

      billingCycle: [
        'monthly' as
          PlanBillingCycle,
        Validators.required
      ],

      price: [
        0,
        [
          Validators.required,
          Validators.min(
            0
          )
        ]
      ],

      joiningFee: [
        0,
        Validators.min(
          0
        )
      ],

      discountAmount: [
        0,
        Validators.min(
          0
        )
      ],

      taxPercentage: [
        18,
        [
          Validators.min(
            0
          ),
          Validators.max(
            100
          )
        ]
      ],

      maxFreezeDays: [
        0,
        Validators.min(
          0
        )
      ],

      maxFreezeCount: [
        0,
        Validators.min(
          0
        )
      ],

      accessType: [
        'all_locations' as
          PlanAccessType,
        Validators.required
      ]

    });


  constructor(
    private readonly planService:
      MembershipPlanService

  ) {}


  ngOnInit(): void {


    this.planService
      .getPlans(
        this.tenantId
      )
      .subscribe(
        plans => {

          this.plans =
            plans;

          this.applyFilters();

        }
      );

  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(): void {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredPlans =
      this.plans.filter(
        plan => {


          const matchesSearch =

            !search

            ||

            plan.planName
              .toLowerCase()
              .includes(
                search
              )

            ||

            plan.planCode
              .toLowerCase()
              .includes(
                search
              );


          const matchesCategory =
            !this.selectedPlanCategory
            || plan.planCategory === this.selectedPlanCategory;


          const matchesBilling =

            !this.selectedBilling

            ||

            plan.billingCycle ===
              this.selectedBilling;


          return (

            matchesSearch

            &&

            matchesCategory

            &&

            matchesBilling

          );

        }
      );

  }


  clearFilters(): void {


    this.searchText = '';

    this.selectedPlanCategory = '';

    this.selectedBilling = '';

    this.applyFilters();

  }


  // =====================================================
  // ADD
  // =====================================================

  openAddPlan(): void {


    this.editingPlanId =
      null;


    this.submitted =
      false;


    this.planForm.reset({

      planName: '',

      planCategory: 'membership',

      planCode: '',

      description: '',

      durationValue: 1,

      durationType:
        'months',

      billingCycle:
        'monthly',

      price: 0,

      joiningFee: 0,

      discountAmount: 0,

      taxPercentage: 18,

      maxFreezeDays: 0,

      maxFreezeCount: 0,

      accessType:
        'all_locations'

    });


    this.showPlanModal =
      true;

  }


  // =====================================================
  // EDIT
  // =====================================================

  openEditPlan(
    plan:
      MembershipPlan
  ): void {


    this.editingPlanId =
      plan.membershipPlanId;


    this.submitted =
      false;


    this.planForm.setValue({

      planName:
        plan.planName,

      planCategory:
        plan.planCategory,

      planCode:
        plan.planCode,

      description:
        plan.description
        ?? '',

      durationValue:
        plan.durationValue,

      durationType:
        plan.durationType,

      billingCycle:
        plan.billingCycle,

      price:
        plan.price,

      joiningFee:
        plan.joiningFee,

      discountAmount:
        plan.discountAmount,

      taxPercentage:
        plan.taxPercentage,

      maxFreezeDays:
        plan.maxFreezeDays,

      maxFreezeCount:
        plan.maxFreezeCount,

      accessType:
        plan.accessType

    });


    this.showPlanModal =
      true;

  }


  // =====================================================
  // DUPLICATE
  // =====================================================

  duplicatePlan(
    plan:
      MembershipPlan
  ): void {


    this.editingPlanId =
      null;


    this.submitted =
      false;


    this.planForm.setValue({

      planName:
        `${plan.planName} Copy`,

      planCategory:
        plan.planCategory,

      planCode:
        `${plan.planCode}-COPY`,

      description:
        plan.description
        ?? '',

      durationValue:
        plan.durationValue,

      durationType:
        plan.durationType,

      billingCycle:
        plan.billingCycle,

      price:
        plan.price,

      joiningFee:
        plan.joiningFee,

      discountAmount:
        plan.discountAmount,

      taxPercentage:
        plan.taxPercentage,

      maxFreezeDays:
        plan.maxFreezeDays,

      maxFreezeCount:
        plan.maxFreezeCount,

      accessType:
        plan.accessType

    });


    this.showPlanModal =
      true;

  }


  // =====================================================
  // CLOSE
  // =====================================================

  closePlanModal(): void {


    this.showPlanModal =
      false;

    this.editingPlanId =
      null;

    this.submitted =
      false;

  }


  // =====================================================
  // SAVE
  // =====================================================

  savePlan(): void {


    this.submitted =
      true;


    if (
      this.planForm.invalid
    ) {

      this.planForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.planForm
        .getRawValue();


    const price =
      Number(
        value.price
        ?? 0
      );


    const discount =
      Number(
        value.discountAmount
        ?? 0
      );


    if (
      discount >
      price
    ) {

      alert(
        'Discount cannot exceed base price.'
      );

      return;

    }


    const request:
      CreateMembershipPlanRequest = {

      tenantId:
        this.tenantId,

      planCategory:
        value.planCategory as PlanCategory,

      planName:
        String(
          value.planName
          ?? ''
        ),

      planCode:
        String(
          value.planCode
          ?? ''
        ),

      description:
        value.description
          ?.trim()
          || null,

      durationValue:
        Number(
          value.durationValue
          ?? 1
        ),

      durationType:
        value.durationType as PlanDurationType,

      billingCycle:
        value.billingCycle as PlanBillingCycle,

      price,

      joiningFee:
        Number(
          value.joiningFee
          ?? 0
        ),

      discountAmount:
        discount,

      taxPercentage:
        Number(
          value.taxPercentage
          ?? 0
        ),

      maxFreezeDays:
        Number(
          value.maxFreezeDays
          ?? 0
        ),

      maxFreezeCount:
        Number(
          value.maxFreezeCount
          ?? 0
        ),

      accessType:
        value.accessType as PlanAccessType

    };


    try {


      if (
        this.editingPlanId
      ) {

        this.planService
          .updatePlan({

            membershipPlanId:
              this.editingPlanId,

            ...request

          });

      }
      else {

        this.planService
          .createPlan(
            request
          );

      }


      this.closePlanModal();


    }
    catch (
      error
    ) {

      alert(

        error instanceof Error

          ? error.message

          : 'Unable to save membership plan.'

      );

    }

  }


  // =====================================================
  // STATUS
  // =====================================================

  openStatusConfirm(
    plan:
      MembershipPlan
  ): void {


    this.statusPlan =
      plan;


    this.showStatusConfirm =
      true;

  }


  closeStatusConfirm(): void {


    this.statusPlan =
      null;


    this.showStatusConfirm =
      false;

  }


  confirmStatusChange(): void {


    if (
      !this.statusPlan
    ) {

      return;

    }


    this.planService
      .togglePlanStatus(

        this.statusPlan
          .membershipPlanId,

        this.tenantId

      );


    this.closeStatusConfirm();

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  get totalPlans():
    number {

    return this.plans.length;

  }


  get activePlans():
    number {

    return this.plans
      .filter(
        plan =>
          plan.isActive
      )
      .length;

  }


  get inactivePlans():
    number {

    return this.plans
      .filter(
        plan =>
          !plan.isActive
      )
      .length;

  }


  get totalMembers():
    number {

    return this.plans
      .reduce(
        (
          total,
          plan
        ) =>
          total +
          plan.memberCount,
        0
      );

  }


  // =====================================================
  // CALCULATIONS
  // =====================================================

  get firstPaymentPreview():
    number {


    const price =
      Number(
        this.planForm
          .controls
          .price
          .value
        ?? 0
      );


    const joiningFee =
      Number(
        this.planForm
          .controls
          .joiningFee
          .value
        ?? 0
      );


    const discount =
      Number(
        this.planForm
          .controls
          .discountAmount
          .value
        ?? 0
      );


    const tax =
      Number(
        this.planForm
          .controls
          .taxPercentage
          .value
        ?? 0
      );


    const taxable =
      Math.max(
        0,
        price -
        discount +
        joiningFee
      );


    return (

      taxable +
      (
        taxable *
        tax /
        100
      )

    );

  }


  getBillingLabel(
    value:
      PlanBillingCycle
  ): string {


    return this.billingCycles
      .find(
        item =>
          item.value === value
      )
      ?.label
      ?? value;

  }


  getDurationLabel(
    plan:
      MembershipPlan
  ): string {


    const singularUnits:
      Record<PlanDurationType, string> = {
        days: 'day',
        months: 'month',
        years: 'year',
        sessions: 'session'
      };

    const unit =
      plan.durationValue === 1
        ? singularUnits[plan.durationType]
        : plan.durationType;


    return (
      `${plan.durationValue} ${unit}`
    );

  }


  isInvalid(
    name:
      keyof typeof this.planForm.controls
  ): boolean {


    const control =
      this.planForm
        .controls[name];


    return (

      (
        this.submitted
        ||
        control.touched
      )

      &&

      control.invalid

    );

  }

}