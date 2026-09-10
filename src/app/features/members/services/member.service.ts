import { Injectable } from '@angular/core';

import { Member } from '../models/member.model';
import { MemberListItem } from '../models/member-list-item.model';

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

export const MEMBERSHIP_PLANS = [
  {
    name: 'Monthly',
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
  }
] as const;

export const MEMBERSHIP_PLAN_AMOUNTS: Record<string, number> = {
  Monthly: 1500,
  Quarterly: 4000,
  'Gold Annual': 12000,
  'Premium Annual': 18000
};

export const PAYMENT_MODES: PaymentMode[] = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
  'Other'
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'Paid',
  'Partial',
  'Pending'
];

export interface MemberRecord extends Member {
  planName: string;
  location: string;
  joinDate: string;
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

export type CreateMember = Omit<
  MemberRecord,
  'memberId' |
  'status' |
  'planName' |
  'location' |
  'joinDate' |
  'expiryDate'
> &
  Partial<
    Pick<
      MemberRecord,
      'status' |
      'planName' |
      'location' |
      'joinDate' |
      'expiryDate' |
      'planDurationMonths' |
      'paymentMode' |
      'paymentStatus' |
      'membershipAmount' |
      'amountPaid' |
      'balanceAmount'
    >
  >;

export type UpdateMember = Partial<Omit<MemberRecord, 'memberId'>>;

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  private members: MemberRecord[] = [
    {
      memberId: 1,
      memberCode: 'MEM-00124',
      firstName: 'Arun',
      lastName: 'Kumar',
      phone: '9876543210',
      email: 'arun@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Gold Annual',
      location: 'Main Branch',
      joinDate: '2026-01-12',
      expiryDate: '2027-01-11'
    },
    {
      memberId: 2,
      memberCode: 'MEM-00125',
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '9876500001',
      email: 'rahul@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Expiring',
      planName: 'Monthly',
      location: 'Main Branch',
      joinDate: '2026-08-01',
      expiryDate: '2026-09-30'
    },
    {
      memberId: 3,
      memberCode: 'MEM-00126',
      firstName: 'Sneha',
      lastName: 'Patil',
      phone: '9900011223',
      email: 'sneha@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Expired',
      planName: 'Premium Annual',
      location: 'Indiranagar',
      joinDate: '2025-09-01',
      expiryDate: '2026-08-31'
    },
    {
      memberId: 4,
      memberCode: 'MEM-00127',
      firstName: 'Kiran',
      lastName: 'Rao',
      phone: '9988776655',
      email: 'kiran@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Quarterly',
      location: 'HSR Layout',
      joinDate: '2026-07-15',
      expiryDate: '2026-10-15'
    },
    {
      memberId: 5,
      memberCode: 'MEM-00128',
      firstName: 'Priya',
      lastName: 'Shetty',
      phone: '9911223344',
      email: 'priya@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Gold Annual',
      location: 'Indiranagar',
      joinDate: '2026-02-15',
      expiryDate: '2027-02-14'
    },
    {
      memberId: 6,
      memberCode: 'MEM-00129',
      firstName: 'Manoj',
      lastName: 'Gowda',
      phone: '9845012345',
      email: 'manoj@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Expiring',
      planName: 'Monthly',
      location: 'Main Branch',
      joinDate: '2026-08-10',
      expiryDate: '2026-09-10'
    },
    {
      memberId: 7,
      memberCode: 'MEM-00130',
      firstName: 'Ananya',
      lastName: 'Reddy',
      phone: '9900998877',
      email: 'ananya@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Premium Annual',
      location: 'HSR Layout',
      joinDate: '2026-03-05',
      expiryDate: '2027-03-04'
    },
    {
      memberId: 8,
      memberCode: 'MEM-00131',
      firstName: 'Vijay',
      lastName: 'Kumar',
      phone: '9988007766',
      email: 'vijay@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Expired',
      planName: 'Quarterly',
      location: 'Indiranagar',
      joinDate: '2026-04-10',
      expiryDate: '2026-07-10'
    },
    {
      memberId: 9,
      memberCode: 'MEM-00132',
      firstName: 'Megha',
      lastName: 'Nair',
      phone: '9887766554',
      email: 'megha@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Gold Annual',
      location: 'Main Branch',
      joinDate: '2026-06-20',
      expiryDate: '2027-06-19'
    },
    {
      memberId: 10,
      memberCode: 'MEM-00133',
      firstName: 'Rakesh',
      lastName: 'Bhat',
      phone: '9876123456',
      email: 'rakesh@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Inactive',
      planName: 'Monthly',
      location: 'HSR Layout',
      joinDate: '2026-08-25',
      expiryDate: '2026-09-25'
    },
    {
      memberId: 11,
      memberCode: 'MEM-00134',
      firstName: 'Divya',
      lastName: 'Krishna',
      phone: '9898989898',
      email: 'divya@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Active',
      planName: 'Gold Annual',
      location: 'Main Branch',
      joinDate: '2026-05-12',
      expiryDate: '2027-05-11'
    },
    {
      memberId: 12,
      memberCode: 'MEM-00135',
      firstName: 'Suresh',
      lastName: 'Naik',
      phone: '9812345678',
      email: 'suresh@example.com',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      alternatePhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',
      medicalConditions: '',
      referralSource: '',
      referredByMemberId: '',
      status: 'Expired',
      planName: 'Quarterly',
      location: 'Indiranagar',
      joinDate: '2026-06-01',
      expiryDate: '2026-09-01'
    }
  ];

  getMembers(): MemberListItem[] {
    return this.members.map(member => this.toListItem(member));
  }

  getMemberById(id: number): MemberRecord | undefined {
    return this.members.find(
      member => member.memberId === id
    );
  }

  createMember(member: CreateMember): MemberRecord {
    const newId =
      this.members.length > 0
        ? Math.max(
            ...this.members.map(
              item => item.memberId
            )
          ) + 1
        : 1;

    const today =
      new Date()
        .toISOString()
        .split('T')[0];

    const newMember: MemberRecord = {
      ...member,
      memberId: newId,
      status: member.status ?? 'Active',
      planName: member.planName ?? 'Monthly',
      location: member.location ?? 'Main Branch',
      joinDate: member.joinDate ?? today,
      expiryDate: member.expiryDate ?? today
    };

    this.members.push(newMember);

    return newMember;
  }

  updateMember(
    id: number,
    member: UpdateMember
  ): MemberRecord | undefined {
    const index =
      this.members.findIndex(
        item => item.memberId === id
      );

    if (index === -1) {
      return undefined;
    }

    this.members[index] = {
      ...this.members[index],
      ...member,
      memberId: id
    };

    return this.members[index];
  }

  deactivateMember(
    id: number
  ): MemberRecord | undefined {
    return this.updateMember(id, {
      status: 'Inactive'
    });
  }

  getPlanDuration(
    planName: string
  ): number {
    const plan =
      MEMBERSHIP_PLANS.find(
        item => item.name === planName
      );

    return plan?.durationMonths ?? 0;
  }

  getMembershipAmount(
    planName: string
  ): number | undefined {
    return MEMBERSHIP_PLAN_AMOUNTS[planName];
  }

  getMembershipPlan(planName: string) {
  return MEMBERSHIP_PLANS.find(
    plan => plan.name === planName
  );
}


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
    ] = startDate
      .split('-')
      .map(Number);

    const targetMonth =
      new Date(
        year,
        month - 1 + durationMonths,
        1
      );

    const lastDay =
      new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0
      ).getDate();

    const clampedDay =
      Math.min(
        day,
        lastDay
      );

    const expiry =
      new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        clampedDay
      );

    expiry.setDate(
      expiry.getDate() - 1
    );

    return [
      expiry.getFullYear(),
      String(
        expiry.getMonth() + 1
      ).padStart(2, '0'),
      String(
        expiry.getDate()
      ).padStart(2, '0')
    ].join('-');
  }

  calculateBalance(
    amount: number,
    amountPaid: number
  ): number {
    return Math.max(
      0,
      amount - amountPaid
    );
  }

  private toListItem(
    member: MemberRecord
  ): MemberListItem {
    return {
      memberId: member.memberId,
      memberCode: member.memberCode,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email,
      planName: member.planName,
      location: member.location,
      joinDate: member.joinDate,
      expiryDate: member.expiryDate,
      status: member.status
    };
  }
}