import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  map,
  Observable
} from 'rxjs';

import {
  CreateMembershipPlanRequest,
  MembershipPlan,
  UpdateMembershipPlanRequest
} from '../models/membership-plan.model';


@Injectable({
  providedIn: 'root'
})
export class MembershipPlanService {


  private readonly plansSubject =
    new BehaviorSubject<
      MembershipPlan[]
    >([

      {
        membershipPlanId: 1,
        tenantId: 1,
        planCategory: 'membership',
        planCode: 'GOLD',
        planName: 'Gold Membership',
        description:
          'Monthly gym membership with complete gym access.',
        durationValue: 1,
        durationType: 'months',
        billingCycle: 'monthly',
        price: 1500,
        joiningFee: 500,
        discountAmount: 0,
        taxPercentage: 18,
        maxFreezeDays: 7,
        maxFreezeCount: 1,
        accessType: 'all_locations',
        memberCount: 84,
        isActive: true
      },

      {
        membershipPlanId: 2,
        tenantId: 1,
        planCategory: 'membership',
        planCode: 'PREMIUM',
        planName: 'Premium Membership',
        description:
          'Three month premium membership.',
        durationValue: 3,
        durationType: 'months',
        billingCycle: 'quarterly',
        price: 4000,
        joiningFee: 0,
        discountAmount: 250,
        taxPercentage: 18,
        maxFreezeDays: 15,
        maxFreezeCount: 2,
        accessType: 'all_locations',
        memberCount: 52,
        isActive: true
      },

      {
        membershipPlanId: 3,
        tenantId: 1,
        planCategory: 'membership',
        planCode: 'ANNUAL-PRO',
        planName: 'Annual Pro',
        description:
          'Annual membership for regular gym users.',
        durationValue: 1,
        durationType: 'years',
        billingCycle: 'yearly',
        price: 14000,
        joiningFee: 500,
        discountAmount: 1000,
        taxPercentage: 18,
        maxFreezeDays: 30,
        maxFreezeCount: 3,
        accessType: 'all_locations',
        memberCount: 37,
        isActive: true
      },

      {
        membershipPlanId: 4,
        tenantId: 1,
        planCategory: 'membership',
        planCode: 'STUDENT',
        planName: 'Student Plan',
        description:
          'Affordable monthly plan for students.',
        durationValue: 1,
        durationType: 'months',
        billingCycle: 'monthly',
        price: 900,
        joiningFee: 0,
        discountAmount: 0,
        taxPercentage: 18,
        maxFreezeDays: 5,
        maxFreezeCount: 1,
        accessType: 'home_location',
        memberCount: 23,
        isActive: false
      },

      {
        membershipPlanId: 10,
        tenantId: 1,
        planCategory: 'personal_training',
        planCode: 'PT-1',
        planName: 'Personal Training - 1 Session',
        description: 'One personal training session.',
        durationValue: 1,
        durationType: 'sessions',
        billingCycle: 'one_time',
        price: 700,
        joiningFee: 0,
        discountAmount: 0,
        taxPercentage: 18,
        maxFreezeDays: 0,
        maxFreezeCount: 0,
        accessType: 'home_location',
        memberCount: 0,
        isActive: true
      },

      {
        membershipPlanId: 11,
        tenantId: 1,
        planCategory: 'personal_training',
        planCode: 'PT-10',
        planName: 'Personal Training - 10 Sessions',
        description: 'Ten personal training sessions.',
        durationValue: 10,
        durationType: 'sessions',
        billingCycle: 'one_time',
        price: 6000,
        joiningFee: 0,
        discountAmount: 0,
        taxPercentage: 18,
        maxFreezeDays: 0,
        maxFreezeCount: 0,
        accessType: 'home_location',
        memberCount: 0,
        isActive: true
      },

      {
        membershipPlanId: 12,
        tenantId: 1,
        planCategory: 'personal_training',
        planCode: 'PT-20',
        planName: 'Personal Training - 20 Sessions',
        description: 'Twenty personal training sessions.',
        durationValue: 20,
        durationType: 'sessions',
        billingCycle: 'one_time',
        price: 11000,
        joiningFee: 0,
        discountAmount: 0,
        taxPercentage: 18,
        maxFreezeDays: 0,
        maxFreezeCount: 0,
        accessType: 'home_location',
        memberCount: 0,
        isActive: true
      }

    ]);


  // =====================================================
  // ALL PLANS
  // =====================================================

  getPlans(
    tenantId: number
  ): Observable<MembershipPlan[]> {


    return this.plansSubject
      .pipe(

        map(
          plans =>

            plans
              .filter(
                plan =>
                  plan.tenantId ===
                  tenantId
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.planName
                    .localeCompare(
                      b.planName
                    )
              )

        )

      );

  }


  // =====================================================
  // ACTIVE PLANS
  //
  // Use later in:
  // - Add Member
  // - Renewals
  // - Invoice
  // =====================================================

  getActivePlans(
    tenantId: number
  ): Observable<MembershipPlan[]> {


    return this.getPlans(
      tenantId
    )
      .pipe(

        map(
          plans =>
            plans.filter(
              plan =>
                plan.isActive
                && plan.planCategory === 'membership'
            )
        )

      );

  }


  // =====================================================
  // GET ONE
  // =====================================================

  getPlanById(
    membershipPlanId: number,
    tenantId: number
  ): MembershipPlan | undefined {


    return this.plansSubject
      .value
      .find(
        plan =>

          plan.membershipPlanId ===
            membershipPlanId

          &&

          plan.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // CREATE
  // =====================================================

  createPlan(
    request:
      CreateMembershipPlanRequest
  ): MembershipPlan {


    this.validateRequest(
      request
    );


    const plans =
      this.plansSubject.value;


    const nextId =

      plans.length === 0

        ? 1

        : Math.max(
            ...plans.map(
              plan =>
                plan.membershipPlanId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const plan:
      MembershipPlan = {

      membershipPlanId:
        nextId,

      ...request,

      planCode:
        request.planCode
          .trim()
          .toUpperCase(),

      planName:
        request.planName
          .trim(),

      description:
        request.description
          ?.trim()
          || null,

      memberCount: 0,

      isActive: true,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.plansSubject.next([

      ...plans,

      plan

    ]);


    return plan;

  }


  // =====================================================
  // UPDATE
  // =====================================================

  updatePlan(
    request:
      UpdateMembershipPlanRequest
  ): MembershipPlan {


    this.validateRequest(
      request,
      request.membershipPlanId
    );


    const plans =
      this.plansSubject.value;


    const index =
      plans.findIndex(
        plan =>

          plan.membershipPlanId ===
            request.membershipPlanId

          &&

          plan.tenantId ===
            request.tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Membership plan not found.'
      );

    }


    const existing =
      plans[index];


    const updated:
      MembershipPlan = {

      ...existing,

      ...request,

      planCode:
        request.planCode
          .trim()
          .toUpperCase(),

      planName:
        request.planName
          .trim(),

      description:
        request.description
          ?.trim()
          || null,

      updatedAt:
        new Date()
          .toISOString()

    };


    const updatedPlans =
      [...plans];


    updatedPlans[index] =
      updated;


    this.plansSubject.next(
      updatedPlans
    );


    return updated;

  }


  // =====================================================
  // TOGGLE ACTIVE
  // =====================================================

  togglePlanStatus(
    membershipPlanId: number,
    tenantId: number
  ): void {


    const plans =
      this.plansSubject.value;


    const index =
      plans.findIndex(
        plan =>

          plan.membershipPlanId ===
            membershipPlanId

          &&

          plan.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Membership plan not found.'
      );

    }


    const updated =
      [...plans];


    updated[index] = {

      ...updated[index],

      isActive:
        !updated[index]
          .isActive,

      updatedAt:
        new Date()
          .toISOString()

    };


    this.plansSubject.next(
      updated
    );

  }


  // =====================================================
  // VALIDATION
  // =====================================================

  private validateRequest(
    request:
      CreateMembershipPlanRequest,

    ignorePlanId?:
      number
  ): void {


    const name =
      request.planName
        .trim();


    const code =
      request.planCode
        .trim()
        .toUpperCase();


    if (
      !name
    ) {

      throw new Error(
        'Plan name is required.'
      );

    }


    if (
      !code
    ) {

      throw new Error(
        'Plan code is required.'
      );

    }


    if (
      !/^[A-Z0-9_-]+$/
        .test(
          code
        )
    ) {

      throw new Error(
        'Plan code can contain only letters, numbers, hyphen and underscore.'
      );

    }


    const duplicate =
      this.plansSubject
        .value
        .some(
          plan =>

            plan.tenantId ===
              request.tenantId

            &&

            plan.membershipPlanId !==
              ignorePlanId

            &&

            plan.planCode
              .toUpperCase() ===
              code
        );


    if (
      duplicate
    ) {

      throw new Error(
        'Plan code already exists.'
      );

    }


    if (
      request.durationValue <= 0
    ) {

      throw new Error(
        'Duration must be greater than zero.'
      );

    }


    if (
      request.price < 0
      ||
      request.joiningFee < 0
      ||
      request.discountAmount < 0
    ) {

      throw new Error(
        'Plan amounts cannot be negative.'
      );

    }


    if (
      request.discountAmount >
      request.price
    ) {

      throw new Error(
        'Discount cannot exceed base price.'
      );

    }


    if (
      request.taxPercentage < 0
      ||
      request.taxPercentage > 100
    ) {

      throw new Error(
        'Tax percentage must be between 0 and 100.'
      );

    }

  }

}