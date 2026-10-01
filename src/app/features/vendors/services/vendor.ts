import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  Vendor,
  VendorRequest
} from '../models/vendor.model';


@Injectable({
  providedIn: 'root'
})
export class VendorService {


  private readonly vendorsSubject =
    new BehaviorSubject<Vendor[]>([

      {
        vendorId: 1,

        tenantId: 1,

        vendorName:
          'FitEquip Solutions',

        vendorCode:
          'VEN-EQP-001',

        contactPerson:
          'Ramesh Kumar',

        phone:
          '9876543210',

        email:
          'sales@fitequip.com',

        address:
          'Peenya Industrial Area, Bengaluru',

        gstNumber:
          '29ABCDE1234F1Z5',

        paymentTerms:
          'Net 30 Days',

        isActive:
          true,

        createdAt:
          '2026-09-01T10:00:00+05:30',

        updatedAt:
          '2026-09-01T10:00:00+05:30'
      },


      {
        vendorId: 2,

        tenantId: 1,

        vendorName:
          'CleanPro Services',

        vendorCode:
          'VEN-CLN-001',

        contactPerson:
          'Manoj Rao',

        phone:
          '9876500011',

        email:
          'accounts@cleanpro.com',

        address:
          'Rajajinagar, Bengaluru',

        gstNumber:
          '29AAACC1234D1Z7',

        paymentTerms:
          'Net 15 Days',

        isActive:
          true,

        createdAt:
          '2026-09-02T10:00:00+05:30',

        updatedAt:
          '2026-09-02T10:00:00+05:30'
      },


      {
        vendorId: 3,

        tenantId: 2,

        vendorName:
          'Iron Fitness Equipment',

        vendorCode:
          'VEN-EQP-001',

        contactPerson:
          'Kiran Patil',

        phone:
          '9988776655',

        email:
          'contact@ironfitness.com',

        address:
          'Yeshwanthpur, Bengaluru',

        gstNumber:
          '29AAEFI4567P1Z8',

        paymentTerms:
          'Net 30 Days',

        isActive:
          true,

        createdAt:
          '2026-09-05T10:00:00+05:30',

        updatedAt:
          '2026-09-05T10:00:00+05:30'
      },


      {
        vendorId: 4,

        tenantId: 3,

        vendorName:
          'GymCare Maintenance',

        vendorCode:
          'VEN-SRV-001',

        contactPerson:
          'Arun Prasad',

        phone:
          '9988112233',

        email:
          'support@gymcare.com',

        address:
          'Indiranagar, Bengaluru',

        gstNumber:
          null,

        paymentTerms:
          'Payment on Completion',

        isActive:
          false,

        createdAt:
          '2026-09-10T10:00:00+05:30',

        updatedAt:
          '2026-09-10T10:00:00+05:30'
      }

    ]);


  readonly vendors$ =
    this.vendorsSubject
      .asObservable();


  getVendors():
    Observable<Vendor[]> {

    return this.vendors$;

  }


  getVendorsByTenant(
    tenantId: number
  ): Observable<Vendor[]> {

    return this.vendors$.pipe(

      map(
        vendors =>
          vendors.filter(
            vendor =>
              vendor.tenantId ===
              tenantId
          )
      )

    );

  }


  createVendor(
    request: VendorRequest
  ): Vendor {

    const vendors =
      this.vendorsSubject.value;


    const nextId =

      vendors.length === 0

        ? 1

        : Math.max(
            ...vendors.map(
              vendor =>
                vendor.vendorId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const newVendor: Vendor = {

      vendorId:
        nextId,

      ...request,

      vendorCode:
        request.vendorCode
          .trim()
          .toUpperCase(),

      createdAt:
        now,

      updatedAt:
        now

    };


    this.vendorsSubject.next([

      ...vendors,

      newVendor

    ]);


    return newVendor;

  }


  updateVendor(
    vendorId: number,
    request: VendorRequest
  ): Vendor | null {

    const vendors =
      this.vendorsSubject.value;


    const index =
      vendors.findIndex(
        vendor =>
          vendor.vendorId ===
          vendorId
      );


    if (index === -1) {

      return null;

    }


    const updatedVendor: Vendor = {

      ...vendors[index],

      ...request,

      vendorId,

      vendorCode:
        request.vendorCode
          .trim()
          .toUpperCase(),

      updatedAt:
        new Date()
          .toISOString()

    };


    const updated =
      [...vendors];


    updated[index] =
      updatedVendor;


    this.vendorsSubject.next(
      updated
    );


    return updatedVendor;

  }


  setVendorActiveStatus(
    vendorId: number,
    isActive: boolean
  ): void {

    const updated =
      this.vendorsSubject.value.map(

        vendor =>

          vendor.vendorId ===
          vendorId

            ? {

                ...vendor,

                isActive,

                updatedAt:
                  new Date()
                    .toISOString()

              }

            : vendor

      );


    this.vendorsSubject.next(
      updated
    );

  }


  isVendorCodeTaken(
    tenantId: number,
    vendorCode: string,
    excludeVendorId?: number
  ): boolean {

    const code =
      vendorCode
        .trim()
        .toLowerCase();


    return this.vendorsSubject
      .value
      .some(
        vendor =>

          vendor.tenantId ===
            tenantId &&

          vendor.vendorCode
            .toLowerCase() ===
            code &&

          vendor.vendorId !==
            excludeVendorId

      );

  }

}