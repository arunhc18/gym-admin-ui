import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  SubscriptionPlan,
  SubscriptionPlanRequest
} from '../models/subscription-plan.model';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {


  // =====================================================
  // TEMPORARY FRONTEND DATA
  // Later this will be replaced by API calls.
  // =====================================================

  private readonly plansSubject =
    new BehaviorSubject<SubscriptionPlan[]>([

      {
        subscriptionPlanId: 1,

        planCode: 'GYMADMIN',

        planName: 'GymAdmin Plan',

        description:
          'Single SaaS subscription plan for all GymAdmin tenants.',

        maxLocations: 10,

        maxMembers: 5000,

        maxStaffUsers: 50,

        priceMonthly: 999,

        priceQuarterly: 2699,

        priceHalfYearly: 4999,

        priceAnnual: 8999,

        isActive: true,

        displayOrder: 1,

        createdAt:
          '2026-09-01T10:00:00+05:30',

        updatedAt:
          '2026-09-01T10:00:00+05:30'
      }

    ]);


  // =====================================================
  // GET ALL
  // =====================================================

  getPlans():
    Observable<SubscriptionPlan[]> {

    return this.plansSubject
      .asObservable();

  }


  // =====================================================
  // GET BY ID
  // =====================================================

  getPlanById(
    id: number
  ): Observable<SubscriptionPlan | undefined> {

    return this.plansSubject.pipe(

      map(
        plans =>
          plans.find(
            plan =>
              plan.subscriptionPlanId === id
          )
      )

    );

  }


  // =====================================================
  // CREATE
  // =====================================================

  createPlan(
    request: SubscriptionPlanRequest
  ): SubscriptionPlan {

    const plans =
      this.plansSubject.value;


    const nextId =

      plans.length === 0

        ? 1

        : Math.max(
            ...plans.map(
              plan =>
                plan.subscriptionPlanId
            )
          ) + 1;


    const now =
      new Date().toISOString();


    const newPlan: SubscriptionPlan = {

      subscriptionPlanId: nextId,

      ...request,

      createdAt: now,

      updatedAt: now

    };


    this.plansSubject.next([

      ...plans,

      newPlan

    ]);


    return newPlan;

  }


  // =====================================================
  // UPDATE
  // =====================================================

  updatePlan(
    id: number,
    request: SubscriptionPlanRequest
  ): SubscriptionPlan | null {

    const plans =
      this.plansSubject.value;


    const index =
      plans.findIndex(
        plan =>
          plan.subscriptionPlanId === id
      );


    if (index === -1) {

      return null;

    }


    const updatedPlan: SubscriptionPlan = {

      ...plans[index],

      ...request,

      subscriptionPlanId: id,

      updatedAt:
        new Date().toISOString()

    };


    const updatedPlans =
      [...plans];


    updatedPlans[index] =
      updatedPlan;


    this.plansSubject.next(
      updatedPlans
    );


    return updatedPlan;

  }


  // =====================================================
  // ACTIVATE / DEACTIVATE
  // =====================================================

  setPlanStatus(
    id: number,
    isActive: boolean
  ): void {

    const updated =
      this.plansSubject.value.map(

        plan =>

          plan.subscriptionPlanId === id

            ? {
                ...plan,

                isActive,

                updatedAt:
                  new Date().toISOString()
              }

            : plan

      );


    this.plansSubject.next(
      updated
    );

  }


  // =====================================================
  // PLAN CODE UNIQUE CHECK
  // =====================================================

  isPlanCodeTaken(
    planCode: string,
    excludePlanId?: number
  ): boolean {

    const normalizedCode =
      planCode
        .trim()
        .toUpperCase();


    return this.plansSubject.value.some(

      plan =>

        plan.planCode
          .toUpperCase() ===
          normalizedCode &&

        plan.subscriptionPlanId !==
          excludePlanId

    );

  }

}