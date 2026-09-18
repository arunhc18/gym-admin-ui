import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Staff {
  staffId: number;
  staffCode: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  role: 'Trainer' | 'Manager' | 'Receptionist' | 'Accountant' | 'Support';

  specialization?: string;

  location: string;

  joinedDate: string;

  status: 'Active' | 'Inactive' | 'On Leave';

  salary?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private readonly initialStaff: Staff[] = [

    {
      staffId: 1,
      staffCode: 'STF-00101',

      firstName: 'Rajesh',
      lastName: 'Kumar',

      email: 'rajesh@example.com',
      phone: '9876543210',

      role: 'Trainer',
      specialization: 'Strength & Conditioning',

      location: 'Main Branch',

      joinedDate: '2024-01-15',

      status: 'Active'
    },

    {
      staffId: 2,
      staffCode: 'STF-00102',

      firstName: 'Priya',
      lastName: 'Sharma',

      email: 'priya@example.com',
      phone: '9876543211',

      role: 'Manager',

      location: 'Main Branch',

      joinedDate: '2023-06-10',

      status: 'Active'
    },

    {
      staffId: 3,
      staffCode: 'STF-00103',

      firstName: 'Vikram',
      lastName: 'Reddy',

      email: 'vikram@example.com',
      phone: '9876543212',

      role: 'Trainer',
      specialization: 'CrossFit',

      location: 'Indiranagar',

      joinedDate: '2024-03-20',

      status: 'Active'
    },

    {
      staffId: 4,
      staffCode: 'STF-00104',

      firstName: 'Sneha',
      lastName: 'Patel',

      email: 'sneha@example.com',
      phone: '9876543213',

      role: 'Receptionist',

      location: 'HSR Layout',

      joinedDate: '2025-01-05',

      status: 'Active'
    },

    {
      staffId: 5,
      staffCode: 'STF-00105',

      firstName: 'Arun',
      lastName: 'Nair',

      email: 'arun.staff@example.com',
      phone: '9876543214',

      role: 'Trainer',
      specialization: 'Yoga & Mobility',

      location: 'South Branch',

      joinedDate: '2024-08-12',

      status: 'On Leave'
    },

    {
      staffId: 6,
      staffCode: 'STF-00106',

      firstName: 'Meena',
      lastName: 'Rao',

      email: 'meena@example.com',
      phone: '9876543215',

      role: 'Accountant',

      location: 'Main Branch',

      joinedDate: '2022-11-18',

      status: 'Active'
    },

    {
      staffId: 7,
      staffCode: 'STF-00107',

      firstName: 'Kiran',
      lastName: 'Gowda',

      email: 'kiran@example.com',
      phone: '9876543216',

      role: 'Support',

      location: 'North Branch',

      joinedDate: '2025-02-01',

      status: 'Inactive'
    }

  ];

  private readonly staffSubject =
    new BehaviorSubject<Staff[]>([
      ...this.initialStaff
    ]);

  readonly staff$ =
    this.staffSubject.asObservable();

  getStaff(): Observable<Staff[]> {
    return this.staff$;
  }

  getStaffSnapshot(): Staff[] {
    return this.staffSubject.value;
  }

  getStaffById(
    staffId: number
  ): Staff | undefined {

    return this.staffSubject.value.find(
      staff => staff.staffId === staffId
    );
  }

  addStaff(
    staffData: Omit<Staff, 'staffId' | 'staffCode'>
  ): Staff {

    const staff = this.staffSubject.value;

    const nextId =
      staff.length > 0
        ? Math.max(
            ...staff.map(item => item.staffId)
          ) + 1
        : 1;

    const newStaff: Staff = {

      staffId: nextId,

      staffCode:
        `STF-${(100 + nextId)
          .toString()
          .padStart(5, '0')}`,

      ...staffData
    };

    this.staffSubject.next([
      ...staff,
      newStaff
    ]);

    return newStaff;
  }

  updateStaff(
    staffId: number,
    updatedData: Partial<Staff>
  ): boolean {

    const staff =
      this.staffSubject.value;

    const index =
      staff.findIndex(
        item =>
          item.staffId === staffId
      );

    if (index === -1) {
      return false;
    }

    const updatedStaff = [...staff];

    updatedStaff[index] = {
      ...updatedStaff[index],
      ...updatedData,

      staffId:
        updatedStaff[index].staffId,

      staffCode:
        updatedStaff[index].staffCode
    };

    this.staffSubject.next(
      updatedStaff
    );

    return true;
  }

  deleteStaff(
    staffId: number
  ): boolean {

    const staff =
      this.staffSubject.value;

    const exists =
      staff.some(
        item =>
          item.staffId === staffId
      );

    if (!exists) {
      return false;
    }

    this.staffSubject.next(
      staff.filter(
        item =>
          item.staffId !== staffId
      )
    );

    return true;
  }

  getTotalStaffCount(): number {
    return this.staffSubject.value.length;
  }

  getActiveStaffCount(): number {
    return this.staffSubject.value.filter(
      staff =>
        staff.status === 'Active'
    ).length;
  }

  getTrainersCount(): number {
    return this.staffSubject.value.filter(
      staff =>
        staff.role === 'Trainer'
    ).length;
  }

  getOnLeaveCount(): number {
    return this.staffSubject.value.filter(
      staff =>
        staff.status === 'On Leave'
    ).length;
  }

  resetStaff(): void {
    this.staffSubject.next([
      ...this.initialStaff
    ]);
  }
}