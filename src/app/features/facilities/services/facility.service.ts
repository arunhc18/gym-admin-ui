import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';

import {
  CleaningSchedule,
  EmployeeOption,
  Facility,
  FacilityBooking,
  MaintenanceRequest
} from '../models/facility.model';


@Injectable({
  providedIn: 'root'
})
export class FacilityService {


  private readonly facilitiesSubject =
    new BehaviorSubject<Facility[]>([

      {
        facilityId: 1,
        locationId: 1,
        facilityName: 'Yoga Studio 1',
        facilityType: 'studio',
        capacity: 25,
        hourlyRate: 800,
        amenities:
          JSON.stringify([
            'Air Conditioning',
            'Mirrors',
            'Sound System',
            'Yoga Mats'
          ]),
        isBookable: true,
        isActive: true
      },

      {
        facilityId: 2,
        locationId: 2,
        facilityName: 'Badminton Court',
        facilityType: 'court',
        capacity: 4,
        hourlyRate: 500,
        amenities:
          JSON.stringify([
            'Lighting',
            'Changing Room'
          ]),
        isBookable: true,
        isActive: true
      },

      {
        facilityId: 3,
        locationId: 1,
        facilityName: 'Swimming Pool',
        facilityType: 'pool',
        capacity: 40,
        hourlyRate: 1200,
        amenities:
          JSON.stringify([
            'Shower',
            'Lockers',
            'Changing Room'
          ]),
        isBookable: true,
        isActive: true
      },

      {
        facilityId: 4,
        locationId: 3,
        facilityName: 'Sauna Room',
        facilityType: 'sauna',
        capacity: 8,
        hourlyRate: 600,
        amenities:
          JSON.stringify([
            'Shower',
            'Lockers'
          ]),
        isBookable: false,
        isActive: true
      }

    ]);


  private readonly bookingsSubject =
    new BehaviorSubject<FacilityBooking[]>([

      {
        bookingId: 1,
        facilityId: 1,
        memberId: 1,
        bookingDate: '2026-10-05',
        startTime: '07:00',
        endTime: '08:00',
        purpose: 'Personal Yoga Practice',
        numberOfPeople: 2,
        status: 'confirmed',
        paymentStatus: 'paid',
        amount: 800
      },

      {
        bookingId: 2,
        facilityId: 2,
        memberId: 3,
        bookingDate: '2026-10-05',
        startTime: '18:00',
        endTime: '19:00',
        purpose: 'Badminton',
        numberOfPeople: 4,
        status: 'confirmed',
        paymentStatus: 'pending',
        amount: 500
      }

    ]);


  private readonly cleaningSubject =
    new BehaviorSubject<CleaningSchedule[]>([

      {
        scheduleId: 1,
        locationId: 1,
        areaName: 'Yoga Studio 1',
        cleaningType: 'daily',
        frequency: 'Every Day',
        assignedTo: 101,
        lastCleanedDate:
          '2026-10-04T09:00:00+05:30',
        nextCleaningDate:
          '2026-10-05T09:00:00+05:30',
        isActive: true
      },

      {
        scheduleId: 2,
        locationId: 1,
        areaName: 'Locker Room',
        cleaningType: 'deep_clean',
        frequency: 'Every Wednesday',
        assignedTo: 102,
        lastCleanedDate:
          '2026-10-01T16:00:00+05:30',
        nextCleaningDate:
          '2026-10-08T16:00:00+05:30',
        isActive: true
      }

    ]);


  private readonly maintenanceSubject =
    new BehaviorSubject<MaintenanceRequest[]>([

      {
        requestId: 1,
        tenantId: 1,
        locationId: 1,
        requestType: 'electrical',
        priority: 'urgent',
        areaLocation: 'Yoga Studio 1',
        description:
          'Ceiling light is flickering continuously.',
        reportedBy: 1,
        assignedTo: 101,
        status: 'open',
        reportedDate:
          '2026-10-05T08:30:00+05:30',
        completedDate: null,
        cost: null,
        notes: null
      },

      {
        requestId: 2,
        tenantId: 1,
        locationId: 1,
        requestType: 'plumbing',
        priority: 'high',
        areaLocation: 'Locker Room',
        description:
          'Water leakage near shower area.',
        reportedBy: 1,
        assignedTo: 102,
        status: 'in_progress',
        reportedDate:
          '2026-10-04T10:00:00+05:30',
        completedDate: null,
        cost: null,
        notes:
          'Plumber contacted.'
      }

    ]);


  /*
   * IMPORTANT:
   * These are employee_id values, not StaffService.staffId.
   *
   * Replace with the real employees API when backend
   * integration is available.
   */
  private readonly employees:
    EmployeeOption[] = [

      {
        employeeId: 101,
        employeeName: 'Kiran Gowda',
        locationId: 1
      },

      {
        employeeId: 102,
        employeeName: 'Ravi Kumar',
        locationId: 1
      },

      {
        employeeId: 103,
        employeeName: 'Meena Rao',
        locationId: 2
      }

    ];


  readonly facilities$ =
    this.facilitiesSubject.asObservable();

  readonly bookings$ =
    this.bookingsSubject.asObservable();

  readonly cleaningSchedules$ =
    this.cleaningSubject.asObservable();

  readonly maintenanceRequests$ =
    this.maintenanceSubject.asObservable();


  getEmployees():
    EmployeeOption[] {

    return this.employees.map(
      employee => ({
        ...employee
      })
    );

  }


  addFacility(
    facility:
      Omit<Facility, 'facilityId'>
  ): Facility {

    const current =
      this.facilitiesSubject.value;


    const newFacility:
      Facility = {

      ...facility,

      facilityId:
        this.nextId(
          current.map(
            item =>
              item.facilityId
          )
        ),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    this.facilitiesSubject.next([
      ...current,
      newFacility
    ]);


    return newFacility;

  }


  updateFacility(
    facilityId: number,
    changes: Partial<Facility>
  ): void {

    this.facilitiesSubject.next(

      this.facilitiesSubject.value.map(
        facility =>

          facility.facilityId ===
            facilityId

            ? {
                ...facility,
                ...changes,
                facilityId,
                updatedAt:
                  new Date().toISOString()
              }

            : facility

      )

    );

  }


  deleteFacility(facilityId: number): void {

    this.facilitiesSubject.next(
      this.facilitiesSubject.value.filter(
        facility => facility.facilityId !== facilityId
      )
    );

  }


  addBooking(
    booking:
      Omit<FacilityBooking, 'bookingId'>
  ): FacilityBooking {

    const facility =
      this.facilitiesSubject.value.find(
        item =>
          item.facilityId ===
          booking.facilityId
      );


    if (!facility) {

      throw new Error(
        'Facility was not found.'
      );

    }


    if (
      !facility.isActive ||
      !facility.isBookable
    ) {

      throw new Error(
        'This facility is not currently bookable.'
      );

    }


    if (
      booking.startTime >=
      booking.endTime
    ) {

      throw new Error(
        'End time must be later than start time.'
      );

    }


    if (
      booking.numberOfPeople &&
      facility.capacity &&
      booking.numberOfPeople >
        facility.capacity
    ) {

      throw new Error(
        'Number of people exceeds facility capacity.'
      );

    }


    const conflict =
      this.bookingsSubject.value.some(
        existing =>

          existing.facilityId ===
            booking.facilityId &&

          existing.bookingDate ===
            booking.bookingDate &&

          existing.status ===
            'confirmed' &&

          booking.startTime <
            existing.endTime &&

          booking.endTime >
            existing.startTime
      );


    if (conflict) {

      throw new Error(
        'The facility is already booked for this time.'
      );

    }


    const current =
      this.bookingsSubject.value;


    const created:
      FacilityBooking = {

      ...booking,

      bookingId:
        this.nextId(
          current.map(
            item =>
              item.bookingId
          )
        ),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    this.bookingsSubject.next([
      created,
      ...current
    ]);


    return created;

  }


  setBookingStatus(
    bookingId: number,
    status:
      FacilityBooking['status']
  ): void {

    const now =
      new Date().toISOString();


    this.bookingsSubject.next(

      this.bookingsSubject.value.map(
        booking =>

          booking.bookingId ===
            bookingId

            ? {
                ...booking,

                status,

                cancellationDate:
                  status === 'cancelled'
                    ? now
                    : booking.cancellationDate,

                updatedAt:
                  now
              }

            : booking

      )

    );

  }


  updateBooking(
    bookingId: number,
    changes: Partial<FacilityBooking>
  ): void {

    const existing = this.bookingsSubject.value.find(
      booking => booking.bookingId === bookingId
    );

    if (!existing) {
      throw new Error('Booking was not found.');
    }

    const updated = { ...existing, ...changes, bookingId };
    const facility = this.facilitiesSubject.value.find(
      item => item.facilityId === updated.facilityId
    );

    if (!facility) {
      throw new Error('Facility was not found.');
    }

    if (updated.startTime >= updated.endTime) {
      throw new Error('End time must be later than start time.');
    }

    if (
      updated.numberOfPeople !== null &&
      updated.numberOfPeople !== undefined &&
      (!Number.isInteger(updated.numberOfPeople) || updated.numberOfPeople < 1)
    ) {
      throw new Error('Number of people must be a whole number greater than zero.');
    }

    if (
      updated.numberOfPeople !== null &&
      updated.numberOfPeople !== undefined &&
      facility.capacity !== null &&
      facility.capacity !== undefined &&
      updated.numberOfPeople > facility.capacity
    ) {
      throw new Error('Number of people exceeds facility capacity.');
    }

    if (updated.status === 'confirmed') {
      if (!facility.isActive || !facility.isBookable) {
        throw new Error('This facility is not currently bookable.');
      }

      const conflict = this.bookingsSubject.value.some(
        booking =>
          booking.bookingId !== bookingId &&
          booking.facilityId === updated.facilityId &&
          booking.bookingDate === updated.bookingDate &&
          booking.status === 'confirmed' &&
          updated.startTime < booking.endTime &&
          updated.endTime > booking.startTime
      );

      if (conflict) {
        throw new Error('The facility is already booked for this time.');
      }
    }

    this.bookingsSubject.next(
      this.bookingsSubject.value.map(
        booking => booking.bookingId === bookingId
          ? { ...updated, updatedAt: new Date().toISOString() }
          : booking
      )
    );

  }


  deleteBooking(bookingId: number): void {

    this.bookingsSubject.next(
      this.bookingsSubject.value.filter(
        booking => booking.bookingId !== bookingId
      )
    );

  }


  addCleaningSchedule(
    schedule:
      Omit<CleaningSchedule, 'scheduleId'>
  ): CleaningSchedule {

    const current =
      this.cleaningSubject.value;


    const created:
      CleaningSchedule = {

      ...schedule,

      scheduleId:
        this.nextId(
          current.map(
            item =>
              item.scheduleId
          )
        ),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    this.cleaningSubject.next([
      created,
      ...current
    ]);


    return created;

  }


  updateCleaningSchedule(
    scheduleId: number,
    changes:
      Partial<CleaningSchedule>
  ): void {

    this.cleaningSubject.next(

      this.cleaningSubject.value.map(
        schedule =>

          schedule.scheduleId ===
            scheduleId

            ? {
                ...schedule,
                ...changes,
                scheduleId,
                updatedAt:
                  new Date().toISOString()
              }

            : schedule

      )

    );

  }


  deleteCleaningSchedule(scheduleId: number): void {

    this.cleaningSubject.next(
      this.cleaningSubject.value.filter(
        schedule => schedule.scheduleId !== scheduleId
      )
    );

  }


  addMaintenanceRequest(
    request:
      Omit<MaintenanceRequest, 'requestId'>
  ): MaintenanceRequest {

    const current =
      this.maintenanceSubject.value;


    const created:
      MaintenanceRequest = {

      ...request,

      requestId:
        this.nextId(
          current.map(
            item =>
              item.requestId
          )
        ),

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };


    this.maintenanceSubject.next([
      created,
      ...current
    ]);


    return created;

  }


  updateMaintenanceRequest(
    requestId: number,
    changes: Partial<MaintenanceRequest>
  ): void {

    this.maintenanceSubject.next(
      this.maintenanceSubject.value.map(
        request => request.requestId === requestId
          ? {
              ...request,
              ...changes,
              requestId,
              updatedAt: new Date().toISOString()
            }
          : request
      )
    );

  }


  deleteMaintenanceRequest(requestId: number): void {

    this.maintenanceSubject.next(
      this.maintenanceSubject.value.filter(
        request => request.requestId !== requestId
      )
    );

  }


  updateMaintenanceStatus(
    requestId: number,
    status:
      MaintenanceRequest['status']
  ): void {

    const now =
      new Date().toISOString();


    this.maintenanceSubject.next(

      this.maintenanceSubject.value.map(
        request =>

          request.requestId ===
            requestId

            ? {
                ...request,

                status,

                completedDate:
                  status === 'completed'
                    ? now
                    : null,

                updatedAt:
                  now
              }

            : request

      )

    );

  }


  private nextId(
    ids: number[]
  ): number {

    return ids.length === 0

      ? 1

      : Math.max(
          ...ids
        ) + 1;

  }

}