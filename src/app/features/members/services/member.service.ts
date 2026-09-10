import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import {
  Member as BaseMember
} from '../models/member.model';


/* =========================================================
   PAYMENT TYPES
========================================================= */

export type PaymentMode =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Bank Transfer'
  | 'Other';


export type PaymentStatus =
  | 'Paid'
  | 'Partial'
  | 'Pending';


/* =========================================================
   MEMBERSHIP PLANS
========================================================= */

export const MEMBERSHIP_PLANS = [

  {
    name: 'Monthly',
    durationMonths: 1
  },

  {
    name: 'Silver Monthly',
    durationMonths: 1
  },

  {
    name: 'Quarterly',
    durationMonths: 3
  },

  {
    name: 'Gold Annual',
    durationMonths: 12
  },

  {
    name: 'Premium Annual',
    durationMonths: 12
  },

  {
    name: 'Platinum Annual',
    durationMonths: 12
  }

] as const;


/* =========================================================
   MEMBERSHIP AMOUNTS
========================================================= */

export const MEMBERSHIP_PLAN_AMOUNTS:
  Record<string, number> = {

    Monthly: 1500,

    'Silver Monthly': 1500,

    Quarterly: 4000,

    'Gold Annual': 12000,

    'Premium Annual': 18000,

    'Platinum Annual': 24000
  };


/* =========================================================
   PAYMENT OPTIONS
========================================================= */

export const PAYMENT_MODES:
  PaymentMode[] = [

    'Cash',

    'UPI',

    'Card',

    'Bank Transfer',

    'Other'
  ];


export const PAYMENT_STATUSES:
  PaymentStatus[] = [

    'Paid',

    'Partial',

    'Pending'
  ];


/* =========================================================
   MEMBER RECORD

   Supports both naming styles:

   Developer 1:
   locationName
   joinedDate

   Developer 2:
   location
   joinDate
========================================================= */

export interface MemberRecord
  extends BaseMember {

  planName: string;

  location: string;

  locationName: string;

  joinDate: string;

  joinedDate: string;

  expiryDate: string;

  planDurationMonths?: number;

  paymentMode?: PaymentMode;

  paymentStatus?: PaymentStatus;

  membershipAmount?: number;

  amountPaid?: number;

  balanceAmount?: number;

  idProofUrl?: string;

  medicalConditions?: string;

  referralSource?: string;

  referredByMemberId?: string;
}


/*
 * Dashboard and Member List currently import:
 *
 * Member
 *
 * directly from member.service.ts.
 */
export type Member =
  MemberRecord;


/* =========================================================
   CREATE MEMBER
========================================================= */

export type CreateMember =

  Omit<
    MemberRecord,

    | 'memberId'
    | 'status'
    | 'planName'
    | 'location'
    | 'locationName'
    | 'joinDate'
    | 'joinedDate'
    | 'expiryDate'
  >

  &

  Partial<
    Pick<
      MemberRecord,

      | 'status'
      | 'planName'
      | 'location'
      | 'locationName'
      | 'joinDate'
      | 'joinedDate'
      | 'expiryDate'
      | 'planDurationMonths'
      | 'paymentMode'
      | 'paymentStatus'
      | 'membershipAmount'
      | 'amountPaid'
      | 'balanceAmount'
    >
  >;


/* =========================================================
   UPDATE MEMBER
========================================================= */

export type UpdateMember =
  Partial<
    Omit<
      MemberRecord,
      'memberId'
    >
  >;


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class MemberService {


  /* =======================================================
     INITIAL MEMBERS
  ======================================================= */

  private readonly initialMembers:
    MemberRecord[] = [


    /* MEMBER 1 */

    {
      memberId: 1,

      memberCode: 'MEM-00124',

      firstName: 'Arun',

      lastName: 'Kumar',

      phone: '9876543210',

      email: 'arun@example.com',

      alternatePhone: '9988776655',

      status: 'Active',

      planName: 'Gold Annual',

      location: 'Main Branch',

      locationName: 'Main Branch',

      joinDate: '2026-01-12',

      joinedDate: '2026-01-12',

      expiryDate: '2027-01-11',

      planDurationMonths: 12,

      paymentMode: 'UPI',

      paymentStatus: 'Paid',

      membershipAmount: 12000,

      amountPaid: 12000,

      balanceAmount: 0
    },


    /* MEMBER 2 */

    {
      memberId: 2,

      memberCode: 'MEM-00125',

      firstName: 'Rahul',

      lastName: 'Sharma',

      phone: '9876500001',

      email: 'rahul@example.com',

      alternatePhone: '',

      status: 'Expiring',

      planName: 'Monthly',

      location: 'Main Branch',

      locationName: 'Main Branch',

      joinDate: '2026-08-01',

      joinedDate: '2026-08-01',

      expiryDate: '2026-09-30',

      planDurationMonths: 1,

      paymentMode: 'Cash',

      paymentStatus: 'Paid',

      membershipAmount: 1500,

      amountPaid: 1500,

      balanceAmount: 0
    },


    /* MEMBER 3 */

    {
      memberId: 3,

      memberCode: 'MEM-00126',

      firstName: 'Sneha',

      lastName: 'Patel',

      phone: '9900011223',

      email: 'sneha@example.com',

      alternatePhone: '',

      status: 'Expired',

      planName: 'Premium Annual',

      location: 'Indiranagar',

      locationName: 'Indiranagar',

      joinDate: '2025-09-01',

      joinedDate: '2025-09-01',

      expiryDate: '2026-08-31',

      planDurationMonths: 12,

      paymentMode: 'Card',

      paymentStatus: 'Paid',

      membershipAmount: 18000,

      amountPaid: 18000,

      balanceAmount: 0
    },


    /* MEMBER 4 */

    {
      memberId: 4,

      memberCode: 'MEM-00127',

      firstName: 'Kiran',

      lastName: 'Rao',

      phone: '9988776655',

      email: 'kiran@example.com',

      alternatePhone: '',

      status: 'Active',

      planName: 'Quarterly',

      location: 'HSR Layout',

      locationName: 'HSR Layout',

      joinDate: '2026-07-15',

      joinedDate: '2026-07-15',

      expiryDate: '2026-10-14',

      planDurationMonths: 3,

      paymentMode: 'UPI',

      paymentStatus: 'Paid',

      membershipAmount: 4000,

      amountPaid: 4000,

      balanceAmount: 0
    },


    /* MEMBER 5 */

    {
      memberId: 5,

      memberCode: 'MEM-00128',

      firstName: 'Priya',

      lastName: 'Shetty',

      phone: '9911223344',

      email: 'priya@example.com',

      alternatePhone: '',

      status: 'Active',

      planName: 'Gold Annual',

      location: 'Indiranagar',

      locationName: 'Indiranagar',

      joinDate: '2026-02-15',

      joinedDate: '2026-02-15',

      expiryDate: '2027-02-14',

      planDurationMonths: 12,

      paymentMode: 'UPI',

      paymentStatus: 'Paid',

      membershipAmount: 12000,

      amountPaid: 12000,

      balanceAmount: 0
    },


    /* MEMBER 6 */

    {
      memberId: 6,

      memberCode: 'MEM-00129',

      firstName: 'Vijay',

      lastName: 'Kumar',

      phone: '9876500005',

      email: 'vijay@example.com',

      alternatePhone: '',

      status: 'Active',

      planName: 'Silver Monthly',

      location: 'North Branch',

      locationName: 'North Branch',

      joinDate: '2026-01-25',

      joinedDate: '2026-01-25',

      expiryDate: '2026-12-25',

      planDurationMonths: 1,

      paymentMode: 'Cash',

      paymentStatus: 'Paid',

      membershipAmount: 1500,

      amountPaid: 1500,

      balanceAmount: 0
    },


    /* MEMBER 7 */

    {
      memberId: 7,

      memberCode: 'MEM-00130',

      firstName: 'Anjali',

      lastName: 'Nair',

      phone: '9876500006',

      email: 'anjali@example.com',

      alternatePhone: '',

      status: 'Active',

      planName: 'Platinum Annual',

      location: 'Main Branch',

      locationName: 'Main Branch',

      joinDate: '2026-05-17',

      joinedDate: '2026-05-17',

      expiryDate: '2027-05-16',

      planDurationMonths: 12,

      paymentMode: 'Card',

      paymentStatus: 'Paid',

      membershipAmount: 24000,

      amountPaid: 24000,

      balanceAmount: 0
    },


    /* MEMBER 8 */

    {
      memberId: 8,

      memberCode: 'MEM-00131',

      firstName: 'Rakesh',

      lastName: 'Gowda',

      phone: '9876500007',

      email: 'rakesh@example.com',

      alternatePhone: '',

      status: 'Expiring',

      planName: 'Gold Annual',

      location: 'South Branch',

      locationName: 'South Branch',

      joinDate: '2025-11-21',

      joinedDate: '2025-11-21',

      expiryDate: '2026-10-10',

      planDurationMonths: 12,

      paymentMode: 'UPI',

      paymentStatus: 'Paid',

      membershipAmount: 12000,

      amountPaid: 12000,

      balanceAmount: 0
    },


    /* MEMBER 9 */

    {
      memberId: 9,

      memberCode: 'MEM-00132',

      firstName: 'Divya',

      lastName: 'Reddy',

      phone: '9876500008',

      email: 'divya@example.com',

      alternatePhone: '',

      status: 'Expiring',

      planName: 'Silver Monthly',

      location: 'North Branch',

      locationName: 'North Branch',

      joinDate: '2026-06-04',

      joinedDate: '2026-06-04',

      expiryDate: '2026-11-03',

      planDurationMonths: 1,

      paymentMode: 'Cash',

      paymentStatus: 'Paid',

      membershipAmount: 1500,

      amountPaid: 1500,

      balanceAmount: 0
    },


    /* MEMBER 10 */

    {
      memberId: 10,

      memberCode: 'MEM-00133',

      firstName: 'Manoj',

      lastName: 'Singh',

      phone: '9876500009',

      email: 'manoj@example.com',

      alternatePhone: '',

      status: 'Expired',

      planName: 'Gold Annual',

      location: 'Main Branch',

      locationName: 'Main Branch',

      joinDate: '2025-10-10',

      joinedDate: '2025-10-10',

      expiryDate: '2026-08-10',

      planDurationMonths: 12,

      paymentMode: 'Bank Transfer',

      paymentStatus: 'Paid',

      membershipAmount: 12000,

      amountPaid: 12000,

      balanceAmount: 0
    },


    /* MEMBER 11 */

    {
      memberId: 11,

      memberCode: 'MEM-00134',

      firstName: 'Pooja',

      lastName: 'Mehta',

      phone: '9876500010',

      email: 'pooja@example.com',

      alternatePhone: '',

      status: 'Active',

      planName: 'Platinum Annual',

      location: 'South Branch',

      locationName: 'South Branch',

      joinDate: '2026-07-13',

      joinedDate: '2026-07-13',

      expiryDate: '2027-07-12',

      planDurationMonths: 12,

      paymentMode: 'UPI',

      paymentStatus: 'Partial',

      membershipAmount: 24000,

      amountPaid: 12000,

      balanceAmount: 12000
    },


    /* MEMBER 12 */

    {
      memberId: 12,

      memberCode: 'MEM-00135',

      firstName: 'Suresh',

      lastName: 'Naik',

      phone: '9876500011',

      email: 'suresh@example.com',

      alternatePhone: '',

      status: 'Expired',

      planName: 'Silver Monthly',

      location: 'North Branch',

      locationName: 'North Branch',

      joinDate: '2025-08-01',

      joinedDate: '2025-08-01',

      expiryDate: '2026-08-01',

      planDurationMonths: 1,

      paymentMode: 'Cash',

      paymentStatus: 'Paid',

      membershipAmount: 1500,

      amountPaid: 1500,

      balanceAmount: 0
    }

  ];


  /* =======================================================
     SHARED MEMBER STATE
  ======================================================= */

  private readonly membersSubject =
    new BehaviorSubject<MemberRecord[]>(

      this.initialMembers.map(
        member => ({
          ...member
        })
      )

    );


  readonly members$:
    Observable<MemberRecord[]> =

    this.membersSubject
      .asObservable();


  constructor() {}


  /* =======================================================
     GET ALL MEMBERS

     Dashboard + Member List use:
     getMembers().subscribe(...)
  ======================================================= */

  getMembers():
    Observable<MemberRecord[]> {

    return this.members$;
  }


  /* =======================================================
     SNAPSHOT
  ======================================================= */

  getMembersSnapshot():
    MemberRecord[] {

    return this.membersSubject.value;
  }


  /* =======================================================
     GET MEMBER BY ID
  ======================================================= */

  getMemberById(
    id: number
  ): MemberRecord | undefined {

    return this.membersSubject
      .value
      .find(
        member =>
          member.memberId === id
      );
  }


  /* =======================================================
     CREATE MEMBER
     Used by Developer 2 Add Member
  ======================================================= */

  createMember(
    member:
      CreateMember
  ): MemberRecord {

    const currentMembers =
      this.membersSubject.value;


    const newId =
      currentMembers.length > 0

        ? Math.max(
            ...currentMembers.map(
              item =>
                item.memberId
            )
          ) + 1

        : 1;


    const today =
      new Date()
        .toISOString()
        .split('T')[0];


    const planName =
      member.planName ??
      'Monthly';


    const locationName =
      member.locationName ??
      member.location ??
      'Main Branch';


    const joinedDate =
      member.joinedDate ??
      member.joinDate ??
      today;


    const duration =
      member.planDurationMonths ??
      this.getPlanDuration(
        planName
      );


    const expiryDate =
      member.expiryDate ||

      this.calculateExpiryDate(
        joinedDate,
        duration
      );


    const membershipAmount =
      member.membershipAmount ??

      this.getMembershipAmount(
        planName
      ) ??

      0;


    const amountPaid =
      member.amountPaid ?? 0;


    const newMember:
      MemberRecord = {

      ...member,

      memberId:
        newId,

      status:
        member.status ??
        'Active',

      planName,

      location:
        locationName,

      locationName,

      joinDate:
        joinedDate,

      joinedDate,

      expiryDate,

      planDurationMonths:
        duration,

      membershipAmount,

      amountPaid,

      balanceAmount:

        member.balanceAmount ??

        this.calculateBalance(
          membershipAmount,
          amountPaid
        )

    };


    this.membersSubject.next([

      ...currentMembers,

      newMember

    ]);


    return newMember;
  }


  /* =======================================================
     ADD MEMBER

     Can also be used by other parts of the app.
  ======================================================= */

  addMember(
    member:
      CreateMember
  ): MemberRecord {

    return this.createMember(
      member
    );
  }


  /* =======================================================
     UPDATE MEMBER
     Must return MemberRecord because member-details.ts
     uses the returned updated member.
  ======================================================= */

  updateMember(
    id: number,
    update:
      UpdateMember
  ): MemberRecord | undefined {

    const members =
      this.membersSubject.value;


    const index =
      members.findIndex(
        member =>
          member.memberId === id
      );


    if (
      index === -1
    ) {

      return undefined;
    }


    const current =
      members[index];


    /*
     * Keep Developer 1 and Developer 2
     * field names synchronized.
     */

    const locationName =

      update.locationName ??

      update.location ??

      current.locationName ??

      current.location;


    const joinedDate =

      update.joinedDate ??

      update.joinDate ??

      current.joinedDate ??

      current.joinDate;


    const updatedMember:
      MemberRecord = {

      ...current,

      ...update,

      memberId:
        id,

      location:
        locationName,

      locationName,

      joinDate:
        joinedDate,

      joinedDate

    };


    const updatedMembers =
      [...members];


    updatedMembers[index] =
      updatedMember;


    this.membersSubject.next(
      updatedMembers
    );


    return updatedMember;
  }


  /* =======================================================
     DEACTIVATE MEMBER
  ======================================================= */

  deactivateMember(
    id: number
  ): MemberRecord | undefined {

    return this.updateMember(
      id,
      {
        status:
          'Inactive'
      }
    );
  }


  /* =======================================================
     DELETE MEMBER
  ======================================================= */

  deleteMember(
    id: number
  ): boolean {

    const members =
      this.membersSubject.value;


    const exists =
      members.some(
        member =>
          member.memberId === id
      );


    if (
      !exists
    ) {

      return false;
    }


    this.membersSubject.next(

      members.filter(
        member =>
          member.memberId !== id
      )

    );


    return true;
  }


  /* =======================================================
     COUNTS
  ======================================================= */

  getTotalMembersCount():
    number {

    return this.membersSubject
      .value
      .length;
  }


  getActiveMembersCount():
    number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Active'
      )
      .length;
  }


  getExpiringMembersCount():
    number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Expiring'
      )
      .length;
  }


  getExpiredMembersCount():
    number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Expired'
      )
      .length;
  }


  /* =======================================================
     FILTERED MEMBER COLLECTIONS
  ======================================================= */

  getActiveMembers():
    MemberRecord[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Active'
      );
  }


  getExpiringMembers():
    MemberRecord[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Expiring'
      );
  }


  getExpiredMembers():
    MemberRecord[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status ===
          'Expired'
      );
  }


  /* =======================================================
     GET PLAN
  ======================================================= */

  getMembershipPlan(
    planName: string
  ) {

    return MEMBERSHIP_PLANS.find(
      plan =>
        plan.name ===
        planName
    );
  }


  /* =======================================================
     PLAN DURATION
  ======================================================= */

  getPlanDuration(
    planName: string
  ): number {

    const plan =
      this.getMembershipPlan(
        planName
      );


    return (
      plan?.durationMonths ??
      0
    );
  }


  /* =======================================================
     MEMBERSHIP AMOUNT
  ======================================================= */

  getMembershipAmount(
    planName: string
  ): number | undefined {

    return (
      MEMBERSHIP_PLAN_AMOUNTS[
        planName
      ]
    );
  }


  /* =======================================================
     CALCULATE EXPIRY DATE
  ======================================================= */

  calculateExpiryDate(
    startDate: string,
    durationMonths: number
  ): string {

    if (
      !startDate ||
      !durationMonths
    ) {

      return '';
    }


    const [
      year,
      month,
      day
    ] =

      startDate
        .split('-')
        .map(Number);


    const targetMonth =
      new Date(

        year,

        month - 1 +
        durationMonths,

        1
      );


    const lastDay =
      new Date(

        targetMonth
          .getFullYear(),

        targetMonth
          .getMonth() + 1,

        0

      ).getDate();


    const clampedDay =
      Math.min(
        day,
        lastDay
      );


    const expiry =
      new Date(

        targetMonth
          .getFullYear(),

        targetMonth
          .getMonth(),

        clampedDay
      );


    /*
     * Membership expires one day
     * before the equivalent renewal date.
     */

    expiry.setDate(
      expiry.getDate() - 1
    );


    return [

      expiry.getFullYear(),

      String(
        expiry.getMonth() + 1
      ).padStart(
        2,
        '0'
      ),

      String(
        expiry.getDate()
      ).padStart(
        2,
        '0'
      )

    ].join('-');
  }


  /* =======================================================
     CALCULATE BALANCE
  ======================================================= */

  calculateBalance(
    amount: number,
    amountPaid: number
  ): number {

    return Math.max(
      0,
      amount - amountPaid
    );
  }


  /* =======================================================
     RESET MOCK DATA
  ======================================================= */

  resetMembers(): void {

    this.membersSubject.next(

      this.initialMembers.map(
        member => ({
          ...member
        })
      )

    );
  }

}