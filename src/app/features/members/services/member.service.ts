import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


// =====================================================
// MEMBER MODEL USED BY THE SERVICE
// =====================================================

export interface Member {

  memberId: number;

  memberCode: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  alternatePhone?: string;

  planName: string;

  locationName: string;

  joinedDate: string;

  expiryDate?: string;

  status:
    | 'Active'
    | 'Expiring'
    | 'Expired'
    | 'Inactive'
    | 'Suspended';

  photoUrl?: string;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class MemberService {


  // ===================================================
  // INITIAL MEMBER DATA
  // ===================================================

  private initialMembers: Member[] = [

    // MEMBER 1
    {
      memberId: 1,
      memberCode: 'MEM-00124',

      firstName: 'Arun',
      lastName: 'Kumar',

      email: 'arun@example.com',
      phone: '9876543210',
      alternatePhone: '9988776655',

      planName: 'Gold Annual',
      locationName: 'Main Branch',

      joinedDate: '2026-01-12',
      expiryDate: '2027-01-11',

      status: 'Active'
    },


    // MEMBER 2
    {
      memberId: 2,
      memberCode: 'MEM-00125',

      firstName: 'Rahul',
      lastName: 'Sharma',

      email: 'rahul@example.com',
      phone: '9876500001',
      alternatePhone: '9988776611',

      planName: 'Monthly',
      locationName: 'Main Branch',

      joinedDate: '2026-08-01',
      expiryDate: '2026-09-30',

      status: 'Expiring'
    },


    // MEMBER 3
    {
      memberId: 3,
      memberCode: 'MEM-00126',

      firstName: 'Sneha',
      lastName: 'Patel',

      email: 'sneha@example.com',
      phone: '9900011223',
      alternatePhone: '9988776622',

      planName: 'Premium Annual',
      locationName: 'Indiranagar',

      joinedDate: '2025-09-01',
      expiryDate: '2026-08-31',

      status: 'Expired'
    },


    // MEMBER 4
    {
      memberId: 4,
      memberCode: 'MEM-00127',

      firstName: 'Kiran',
      lastName: 'Rao',

      email: 'kiran@example.com',
      phone: '9988776655',
      alternatePhone: '9988776633',

      planName: 'Quarterly',
      locationName: 'HSR Layout',

      joinedDate: '2026-07-15',
      expiryDate: '2026-10-15',

      status: 'Active'
    },


    // MEMBER 5
    {
      memberId: 5,
      memberCode: 'MEM-00128',

      firstName: 'Priya',
      lastName: 'Shetty',

      email: 'priya@example.com',
      phone: '9911223344',
      alternatePhone: '9988776644',

      planName: 'Gold Annual',
      locationName: 'Indiranagar',

      joinedDate: '2026-02-15',
      expiryDate: '2027-02-14',

      status: 'Active'
    },


    // MEMBER 6
    {
      memberId: 6,
      memberCode: 'MEM-00129',

      firstName: 'Vijay',
      lastName: 'Kumar',

      email: 'vijay@example.com',
      phone: '9876500005',
      alternatePhone: '9988776650',

      planName: 'Silver Monthly',
      locationName: 'North Branch',

      joinedDate: '2026-01-25',
      expiryDate: '2026-12-25',

      status: 'Active'
    },


    // MEMBER 7
    {
      memberId: 7,
      memberCode: 'MEM-00130',

      firstName: 'Anjali',
      lastName: 'Nair',

      email: 'anjali@example.com',
      phone: '9876500006',
      alternatePhone: '9988776660',

      planName: 'Platinum Annual',
      locationName: 'Main Branch',

      joinedDate: '2026-05-17',
      expiryDate: '2027-05-16',

      status: 'Active'
    },


    // MEMBER 8
    {
      memberId: 8,
      memberCode: 'MEM-00131',

      firstName: 'Rakesh',
      lastName: 'Gowda',

      email: 'rakesh@example.com',
      phone: '9876500007',
      alternatePhone: '9988776670',

      planName: 'Gold Annual',
      locationName: 'South Branch',

      joinedDate: '2025-11-21',
      expiryDate: '2026-10-10',

      status: 'Expiring'
    },


    // MEMBER 9
    {
      memberId: 9,
      memberCode: 'MEM-00132',

      firstName: 'Divya',
      lastName: 'Reddy',

      email: 'divya@example.com',
      phone: '9876500008',
      alternatePhone: '9988776680',

      planName: 'Silver Monthly',
      locationName: 'North Branch',

      joinedDate: '2026-06-04',
      expiryDate: '2026-11-03',

      status: 'Expiring'
    },


    // MEMBER 10
    {
      memberId: 10,
      memberCode: 'MEM-00133',

      firstName: 'Manoj',
      lastName: 'Singh',

      email: 'manoj@example.com',
      phone: '9876500009',
      alternatePhone: '9988776690',

      planName: 'Gold Annual',
      locationName: 'Main Branch',

      joinedDate: '2025-10-10',
      expiryDate: '2026-08-10',

      status: 'Expired'
    },


    // MEMBER 11
    {
      memberId: 11,
      memberCode: 'MEM-00134',

      firstName: 'Pooja',
      lastName: 'Mehta',

      email: 'pooja@example.com',
      phone: '9876500010',
      alternatePhone: '9988776700',

      planName: 'Platinum Annual',
      locationName: 'South Branch',

      joinedDate: '2026-07-13',
      expiryDate: '2027-07-12',

      status: 'Active'
    },


    // MEMBER 12
    {
      memberId: 12,
      memberCode: 'MEM-00135',

      firstName: 'Suresh',
      lastName: 'Naik',

      email: 'suresh@example.com',
      phone: '9876500011',
      alternatePhone: '9988776710',

      planName: 'Silver Monthly',
      locationName: 'North Branch',

      joinedDate: '2025-08-01',
      expiryDate: '2026-08-01',

      status: 'Expired'
    }

  ];


  // ===================================================
  // BEHAVIOR SUBJECT
  // ===================================================

  private membersSubject =
    new BehaviorSubject<Member[]>(
      [...this.initialMembers]
    );


  // Public observable
  members$ =
    this.membersSubject.asObservable();


  constructor() {}


  // ===================================================
  // GET ALL MEMBERS
  // ===================================================

  getMembers(): Observable<Member[]> {

    return this.members$;
  }


  // ===================================================
  // GET CURRENT MEMBERS DIRECTLY
  // Useful for dashboard counts
  // ===================================================

  getMembersSnapshot(): Member[] {

    return this.membersSubject.value;
  }


  // ===================================================
  // GET MEMBER BY ID
  // ===================================================

  getMemberById(
    memberId: number
  ): Member | undefined {

    return this.membersSubject.value.find(
      member =>
        member.memberId === memberId
    );
  }


  // ===================================================
  // ADD MEMBER
  // ===================================================

  addMember(
    memberData: Omit<
      Member,
      'memberId' | 'memberCode'
    >
  ): Member {

    const members =
      this.membersSubject.value;


    // Generate new member ID
    const nextId =
      members.length > 0
        ? Math.max(
            ...members.map(
              member =>
                member.memberId
            )
          ) + 1
        : 1;


    // Generate member code
    const nextCodeNumber =
      123 + nextId;


    const newMember: Member = {

      memberId: nextId,

      memberCode:
        `MEM-${nextCodeNumber
          .toString()
          .padStart(5, '0')}`,

      ...memberData
    };


    this.membersSubject.next([
      ...members,
      newMember
    ]);


    return newMember;
  }


  // ===================================================
  // UPDATE MEMBER
  // ===================================================

  updateMember(
    memberId: number,
    updatedData: Partial<Member>
  ): boolean {

    const members =
      this.membersSubject.value;


    const index =
      members.findIndex(
        member =>
          member.memberId === memberId
      );


    if (index === -1) {

      return false;
    }


    const updatedMembers =
      [...members];


    updatedMembers[index] = {

      ...updatedMembers[index],

      ...updatedData,

      // Prevent accidental ID change
      memberId:
        updatedMembers[index]
          .memberId,

      memberCode:
        updatedMembers[index]
          .memberCode
    };


    this.membersSubject.next(
      updatedMembers
    );


    return true;
  }


  // ===================================================
  // DELETE MEMBER
  // ===================================================

  deleteMember(
    memberId: number
  ): boolean {

    const members =
      this.membersSubject.value;


    const memberExists =
      members.some(
        member =>
          member.memberId === memberId
      );


    if (!memberExists) {

      return false;
    }


    const updatedMembers =
      members.filter(
        member =>
          member.memberId !== memberId
      );


    this.membersSubject.next(
      updatedMembers
    );


    return true;
  }


  // ===================================================
  // TOTAL MEMBERS COUNT
  // ===================================================

  getTotalMembersCount(): number {

    return this.membersSubject
      .value
      .length;
  }


  // ===================================================
  // ACTIVE MEMBERS COUNT
  // ===================================================

  getActiveMembersCount(): number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'active'
      )
      .length;
  }


  // ===================================================
  // EXPIRING MEMBERS COUNT
  // ===================================================

  getExpiringMembersCount(): number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'expiring'
      )
      .length;
  }


  // ===================================================
  // EXPIRED MEMBERS COUNT
  // ===================================================

  getExpiredMembersCount(): number {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'expired'
      )
      .length;
  }


  // ===================================================
  // GET ACTIVE MEMBERS
  // ===================================================

  getActiveMembers(): Member[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'active'
      );
  }


  // ===================================================
  // GET EXPIRING MEMBERS
  // ===================================================

  getExpiringMembers(): Member[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'expiring'
      );
  }


  // ===================================================
  // GET EXPIRED MEMBERS
  // ===================================================

  getExpiredMembers(): Member[] {

    return this.membersSubject
      .value
      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'expired'
      );
  }


  // ===================================================
  // RESET MOCK DATA
  // ===================================================

  resetMembers(): void {

    this.membersSubject.next(
      [...this.initialMembers]
    );
  }

}