import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  Tenant,
  TenantRequest
} from '../models/tenant.model';


@Injectable({
  providedIn: 'root'
})
export class TenantService {


  private readonly tenantsSubject =
    new BehaviorSubject<Tenant[]>([

      {
        tenantId: 1,

        tenantName: 'PowerFit Gym',

        subdomain: 'powerfit',

        subscriptionPlanId: 2,

        subscriptionStatus: 'active',

        subscriptionStartDate:
          '2026-09-01',

        subscriptionEndDate:
          '2027-09-01',

        maxLocations: null,

        maxMembers: null,

        isActive: true,

        createdAt:
          '2026-09-01T10:00:00+05:30',

        updatedAt:
          '2026-09-01T10:00:00+05:30'
      },


      {
        tenantId: 2,

        tenantName: 'Iron House Fitness',

        subdomain: 'ironhouse',

        subscriptionPlanId: 1,

        subscriptionStatus: 'active',

        subscriptionStartDate:
          '2026-09-05',

        subscriptionEndDate:
          '2027-09-05',

        maxLocations: null,

        maxMembers: null,

        isActive: true,

        createdAt:
          '2026-09-05T10:00:00+05:30',

        updatedAt:
          '2026-09-05T10:00:00+05:30'
      },


      {
        tenantId: 3,

        tenantName: 'FitZone',

        subdomain: 'fitzone',

        subscriptionPlanId: 3,

        subscriptionStatus: 'trial',

        subscriptionStartDate:
          '2026-09-10',

        subscriptionEndDate:
          '2026-10-10',

        maxLocations: 12,

        maxMembers: 2500,

        isActive: true,

        createdAt:
          '2026-09-10T10:00:00+05:30',

        updatedAt:
          '2026-09-10T10:00:00+05:30'
      }

    ]);


  getTenants():
    Observable<Tenant[]> {

    return this.tenantsSubject
      .asObservable();

  }


  getTenantById(
    id: number
  ): Observable<Tenant | undefined> {

    return this.tenantsSubject.pipe(

      map(
        tenants =>
          tenants.find(
            tenant =>
              tenant.tenantId === id
          )
      )

    );

  }


  createTenant(
    request: TenantRequest
  ): Tenant {

    const tenants =
      this.tenantsSubject.value;


    const nextId =

      tenants.length === 0

        ? 1

        : Math.max(
            ...tenants.map(
              tenant =>
                tenant.tenantId
            )
          ) + 1;


    const now =
      new Date().toISOString();


    const newTenant: Tenant = {

      tenantId: nextId,

      ...request,

      createdAt: now,

      updatedAt: now

    };


    this.tenantsSubject.next([

      ...tenants,

      newTenant

    ]);


    return newTenant;

  }


  updateTenant(
    id: number,
    request: TenantRequest
  ): Tenant | null {

    const tenants =
      this.tenantsSubject.value;


    const index =
      tenants.findIndex(
        tenant =>
          tenant.tenantId === id
      );


    if (index === -1) {

      return null;

    }


    const updatedTenant: Tenant = {

      ...tenants[index],

      ...request,

      tenantId: id,

      updatedAt:
        new Date().toISOString()

    };


    const updatedTenants =
      [...tenants];


    updatedTenants[index] =
      updatedTenant;


    this.tenantsSubject.next(
      updatedTenants
    );


    return updatedTenant;

  }


  setTenantActiveStatus(
    id: number,
    isActive: boolean
  ): void {

    const updated =
      this.tenantsSubject.value.map(

        tenant =>

          tenant.tenantId === id

            ? {
                ...tenant,
                isActive,
                updatedAt:
                  new Date().toISOString()
              }

            : tenant

      );


    this.tenantsSubject.next(
      updated
    );

  }


  isSubdomainTaken(
    subdomain: string,
    excludeTenantId?: number
  ): boolean {

    const normalized =
      subdomain
        .trim()
        .toLowerCase();


    return this.tenantsSubject.value.some(

      tenant =>

        tenant.subdomain
          .toLowerCase() ===
          normalized &&

        tenant.tenantId !==
          excludeTenantId

    );

  }

}