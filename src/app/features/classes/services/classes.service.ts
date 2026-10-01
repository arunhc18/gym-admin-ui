import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  BookingStatus,
  ClassBooking,
  ClassType,
  ClassTypeFormValues,
  ClassWaitlistEntry,
  ClassFormValues,
  GymClass,
  WaitlistStatus
} from '../models/class.model';
import { Member, MemberService } from '../../members/services/member.service';
import { LocationService } from '../../../shared/services/location.service';
import { TrainerService } from '../../../shared/services/trainer.service';

@Injectable({
  providedIn: 'root'
})
export class ClassesService {
  readonly tenantId = 1;

  constructor(
    private readonly memberService: MemberService,
    private readonly locationService: LocationService,
    private readonly trainerService: TrainerService
  ) {
    this.classesSubject.value.forEach(classItem => this.syncOccupiedCount(classItem.class_id));
  }

  private readonly classTypesSubject = new BehaviorSubject<ClassType[]>([
    {
      class_type_id: 1,
      tenant_id: 1,
      class_name: 'Yoga',
      description: 'Mindful movement, flexibility and breathwork.',
      duration_minutes: 60,
      max_capacity: 20,
      image_url: null,
      color_code: '#3dbd9f',
      is_active: true,
      created_at: '2026-09-01T09:00:00.000Z',
      updated_at: '2026-09-01T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_type_id: 2,
      tenant_id: 1,
      class_name: 'Zumba',
      description: 'High-energy dance fitness for all levels.',
      duration_minutes: 45,
      max_capacity: 25,
      image_url: null,
      color_code: '#ff7a59',
      is_active: true,
      created_at: '2026-09-01T09:00:00.000Z',
      updated_at: '2026-09-01T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_type_id: 3,
      tenant_id: 1,
      class_name: 'CrossFit',
      description: 'Strength and conditioning circuit training.',
      duration_minutes: 60,
      max_capacity: 15,
      image_url: null,
      color_code: '#4f8cff',
      is_active: true,
      created_at: '2026-09-01T09:00:00.000Z',
      updated_at: '2026-09-01T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_type_id: 4,
      tenant_id: 1,
      class_name: 'HIIT',
      description: 'Interval-based cardio and strength training.',
      duration_minutes: 50,
      max_capacity: 18,
      image_url: null,
      color_code: '#f59e0b',
      is_active: true,
      created_at: '2026-09-01T09:00:00.000Z',
      updated_at: '2026-09-01T09:00:00.000Z',
      created_by: null,
      updated_by: null
    }
  ]);

  private readonly classesSubject = new BehaviorSubject<GymClass[]>([
    {
      class_id: 1,
      tenant_id: 1,
      location_id: 1,
      class_type_id: 1,
      trainer_id: 1,
      class_date: '2026-10-05',
      start_time: '07:00',
      end_time: '08:00',
      max_capacity: 20,
      current_bookings: 18,
      room_number: 'Studio 1',
      status: 'scheduled',
      is_virtual: false,
      virtual_meeting_url: null,
      cancellation_reason: null,
      created_at: '2026-09-10T09:00:00.000Z',
      updated_at: '2026-09-10T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_id: 2,
      tenant_id: 1,
      location_id: 2,
      class_type_id: 2,
      trainer_id: 2,
      class_date: '2026-10-05',
      start_time: '18:00',
      end_time: '19:00',
      max_capacity: 25,
      current_bookings: 0,
      room_number: 'Studio 2',
      status: 'scheduled',
      is_virtual: false,
      virtual_meeting_url: null,
      cancellation_reason: null,
      created_at: '2026-09-10T09:00:00.000Z',
      updated_at: '2026-09-10T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_id: 3,
      tenant_id: 1,
      location_id: 3,
      class_type_id: 3,
      trainer_id: 3,
      class_date: '2026-10-06',
      start_time: '08:00',
      end_time: '09:00',
      max_capacity: 15,
      current_bookings: 0,
      room_number: 'Functional Area',
      status: 'scheduled',
      is_virtual: false,
      virtual_meeting_url: null,
      cancellation_reason: null,
      created_at: '2026-09-10T09:00:00.000Z',
      updated_at: '2026-09-10T09:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      class_id: 4,
      tenant_id: 1,
      location_id: 1,
      class_type_id: 4,
      trainer_id: null,
      class_date: '2026-10-01',
      start_time: '06:30',
      end_time: '07:20',
      max_capacity: 18,
      current_bookings: 0,
      room_number: 'Studio 3',
      status: 'scheduled',
      is_virtual: false,
      virtual_meeting_url: null,
      cancellation_reason: null,
      created_at: '2026-09-10T09:00:00.000Z',
      updated_at: '2026-09-10T09:00:00.000Z',
      created_by: null,
      updated_by: null
    }
  ]);

  private readonly bookingsSubject = new BehaviorSubject<ClassBooking[]>([
    {
      booking_id: 1,
      class_id: 1,
      member_id: 1,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:00:00.000Z',
      updated_at: '2026-10-01T07:00:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 2,
      class_id: 1,
      member_id: 2,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:05:00.000Z',
      updated_at: '2026-10-01T07:05:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 3,
      class_id: 1,
      member_id: 3,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:10:00.000Z',
      updated_at: '2026-10-01T07:10:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 4,
      class_id: 1,
      member_id: 4,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:12:00.000Z',
      updated_at: '2026-10-01T07:12:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 5,
      class_id: 1,
      member_id: 5,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:15:00.000Z',
      updated_at: '2026-10-01T07:15:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 6,
      class_id: 1,
      member_id: 6,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:18:00.000Z',
      updated_at: '2026-10-01T07:18:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 7,
      class_id: 1,
      member_id: 7,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:20:00.000Z',
      updated_at: '2026-10-01T07:20:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 8,
      class_id: 1,
      member_id: 8,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:22:00.000Z',
      updated_at: '2026-10-01T07:22:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 9,
      class_id: 1,
      member_id: 9,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:25:00.000Z',
      updated_at: '2026-10-01T07:25:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 10,
      class_id: 1,
      member_id: 10,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:28:00.000Z',
      updated_at: '2026-10-01T07:28:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 11,
      class_id: 1,
      member_id: 11,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:31:00.000Z',
      updated_at: '2026-10-01T07:31:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 12,
      class_id: 1,
      member_id: 12,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:33:00.000Z',
      updated_at: '2026-10-01T07:33:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 13,
      class_id: 1,
      member_id: 13,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:35:00.000Z',
      updated_at: '2026-10-01T07:35:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 14,
      class_id: 1,
      member_id: 14,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:38:00.000Z',
      updated_at: '2026-10-01T07:38:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 15,
      class_id: 1,
      member_id: 15,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:41:00.000Z',
      updated_at: '2026-10-01T07:41:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 16,
      class_id: 1,
      member_id: 16,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:43:00.000Z',
      updated_at: '2026-10-01T07:43:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 17,
      class_id: 1,
      member_id: 17,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:44:00.000Z',
      updated_at: '2026-10-01T07:44:00.000Z',
      created_by: null,
      updated_by: null
    },
    {
      booking_id: 18,
      class_id: 1,
      member_id: 18,
      booking_date: '2026-10-01',
      status: 'confirmed',
      cancellation_date: null,
      cancellation_reason: null,
      created_at: '2026-10-01T07:45:00.000Z',
      updated_at: '2026-10-01T07:45:00.000Z',
      created_by: null,
      updated_by: null
    }
  ]);

  private readonly waitlistSubject = new BehaviorSubject<ClassWaitlistEntry[]>([
    {
      waitlist_id: 1,
      class_id: 2,
      member_id: 9,
      position: 1,
      added_date: '2026-10-01',
      status: 'waiting',
      created_at: '2026-10-01T08:00:00.000Z',
      created_by: null,
      updated_at: '2026-10-01T08:00:00.000Z',
      updated_by: null
    },
    {
      waitlist_id: 2,
      class_id: 2,
      member_id: 10,
      position: 2,
      added_date: '2026-10-01',
      status: 'waiting',
      created_at: '2026-10-01T08:05:00.000Z',
      created_by: null,
      updated_at: '2026-10-01T08:05:00.000Z',
      updated_by: null
    }
  ]);

  readonly classTypes$ = this.classTypesSubject.asObservable();
  readonly classes$ = this.classesSubject.asObservable();
  readonly bookings$ = this.bookingsSubject.asObservable();
  readonly waitlist$ = this.waitlistSubject.asObservable();

  getClassTypes(): Observable<ClassType[]> {
    return this.classTypes$;
  }

  getClasses(): Observable<GymClass[]> {
    return this.classes$;
  }

  getBookings(): Observable<ClassBooking[]> {
    return this.bookings$;
  }

  getWaitlist(): Observable<ClassWaitlistEntry[]> {
    return this.waitlist$;
  }

  getClassById(classId: number): GymClass | undefined {
    return this.classesSubject.value.find(
      item => item.class_id === classId && item.tenant_id === this.tenantId
    );
  }

  getClassTypeById(classTypeId: number): ClassType | undefined {
    return this.classTypesSubject.value.find(
      item => item.class_type_id === classTypeId && item.tenant_id === this.tenantId
    );
  }

  getMembersForTenant(): Member[] {
    return this.memberService.getMembersSnapshot().filter(member =>
      this.memberBelongsToTenant(member)
    );
  }

  addClass(input: ClassFormValues): GymClass | undefined {
    const classType = input.class_type_id === null
      ? undefined
      : this.getClassTypeById(input.class_type_id);
    const location = input.location_id === null
      ? undefined
      : this.locationService.getLocations(this.tenantId)
        .find(item => item.locationId === input.location_id);

    if (
      !classType?.is_active ||
      !location ||
      !this.validClassDate(input.class_date) ||
      !this.validClassTimes(input.start_time, input.end_time) ||
      !Number.isInteger(input.max_capacity) ||
      input.max_capacity === null ||
      input.max_capacity < 1 ||
      (input.trainer_id !== null && !this.trainerBelongsToTenant(input.trainer_id)) ||
      (input.room_number !== null && input.room_number.length > 50) ||
      (input.is_virtual && !this.validHttpUrl(input.virtual_meeting_url))
    ) {
      return undefined;
    }

    const current = this.classesSubject.value;
    const now = new Date().toISOString();

    const nextId = current.length > 0 ? Math.max(...current.map(item => item.class_id)) + 1 : 1;

    const created: GymClass = {
      class_id: nextId,
      tenant_id: this.tenantId,
      location_id: location.locationId,
      class_type_id: classType.class_type_id,
      trainer_id: input.trainer_id ?? null,
      class_date: input.class_date,
      start_time: input.start_time,
      end_time: input.end_time,
      max_capacity: input.max_capacity,
      current_bookings: 0,
      room_number: input.room_number ?? null,
      status: input.status ?? 'scheduled',
      is_virtual: Boolean(input.is_virtual),
      virtual_meeting_url: input.virtual_meeting_url ?? null,
      cancellation_reason: input.cancellation_reason ?? null,
      created_at: now,
      updated_at: now,
      created_by: null,
      updated_by: null
    };

    this.classesSubject.next([...current, created]);
    return { ...created };
  }

  updateClass(classId: number, input: Partial<ClassFormValues>): GymClass | undefined {
    const existing = this.getClassById(classId);
    if (!existing) {
      return undefined;
    }

    const current = this.classesSubject.value;
    const index = current.findIndex(item => item.class_id === classId);

    const nextTypeId = input.class_type_id ?? existing.class_type_id;
    const nextType = this.getClassTypeById(nextTypeId);
    const nextLocationId = input.location_id ?? existing.location_id;
    const nextStartTime = input.start_time ?? existing.start_time;
    const nextEndTime = input.end_time ?? existing.end_time;
    const nextClassDate = input.class_date ?? existing.class_date;
    const nextCapacity = input.max_capacity ?? existing.max_capacity;
    const activeBookings = this.occupiedBookingCount(classId);

    if (
      index === -1 ||
      !nextType ||
      (!nextType.is_active && nextTypeId !== existing.class_type_id) ||
      !this.locationService.getLocations(this.tenantId).some(item => item.locationId === nextLocationId) ||
      !this.validClassDate(nextClassDate) ||
      !this.validClassTimes(nextStartTime, nextEndTime) ||
      !Number.isInteger(nextCapacity) ||
      nextCapacity < activeBookings ||
      (input.room_number !== undefined && input.room_number !== null && input.room_number.length > 50) ||
      ((input.is_virtual ?? existing.is_virtual) &&
        !this.validHttpUrl(input.virtual_meeting_url !== undefined ? input.virtual_meeting_url : existing.virtual_meeting_url)) ||
      (input.trainer_id !== undefined &&
        input.trainer_id !== null &&
        input.trainer_id !== existing.trainer_id &&
        !this.trainerBelongsToTenant(input.trainer_id))
    ) {
      return undefined;
    }

    const updated: GymClass = {
      ...existing,
      ...input,
      location_id: input.location_id ?? existing.location_id,
      class_type_id: input.class_type_id ?? existing.class_type_id,
      trainer_id: input.trainer_id !== undefined ? input.trainer_id : existing.trainer_id,
      class_date: input.class_date ?? existing.class_date,
      start_time: input.start_time ?? existing.start_time,
      end_time: input.end_time ?? existing.end_time,
      max_capacity: input.max_capacity ?? existing.max_capacity,
      room_number: input.room_number !== undefined ? input.room_number : existing.room_number,
      status: input.status ?? existing.status,
      is_virtual: input.is_virtual ?? existing.is_virtual,
      virtual_meeting_url: input.virtual_meeting_url !== undefined ? input.virtual_meeting_url : existing.virtual_meeting_url,
      cancellation_reason: input.cancellation_reason !== undefined ? input.cancellation_reason : existing.cancellation_reason,
      updated_at: new Date().toISOString(),
      updated_by: null
    };

    const next = [...current];
    next[index] = updated;
    this.classesSubject.next(next);

    return { ...updated };
  }

  cancelClass(classId: number, reason: string): GymClass | undefined {
    const classEntry = this.getClassById(classId);

    if (!classEntry || classEntry.status === 'cancelled') {
      return undefined;
    }

    const updated = this.updateClass(classId, {
      status: 'cancelled',
      cancellation_reason: reason
    });

    return updated;
  }

  addClassType(input: ClassTypeFormValues): ClassType | undefined {
    if (!this.validClassTypeInput(input)) {
      return undefined;
    }

    const current = this.classTypesSubject.value;
    const now = new Date().toISOString();
    const nextId = current.length > 0 ? Math.max(...current.map(item => item.class_type_id)) + 1 : 1;

    const created: ClassType = {
      class_type_id: nextId,
      tenant_id: this.tenantId,
      class_name: input.class_name.trim(),
      description: input.description?.trim() || null,
      duration_minutes: input.duration_minutes as number,
      max_capacity: input.max_capacity ?? null,
      image_url: input.image_url?.trim() || null,
      color_code: input.color_code?.trim() || null,
      is_active: input.is_active,
      created_at: now,
      updated_at: now,
      created_by: null,
      updated_by: null
    };

    this.classTypesSubject.next([...current, created]);
    return { ...created };
  }

  updateClassType(classTypeId: number, input: Partial<ClassTypeFormValues>): ClassType | undefined {
    const current = this.classTypesSubject.value;
    const index = current.findIndex(item => item.class_type_id === classTypeId);

    if (index === -1) {
      return undefined;
    }

    const existing = current[index];
    const updated: ClassType = {
      ...existing,
      class_name: input.class_name?.trim() ?? existing.class_name,
      description: input.description !== undefined ? input.description?.trim() ?? null : existing.description,
      duration_minutes: input.duration_minutes ?? existing.duration_minutes,
      max_capacity: input.max_capacity !== undefined ? input.max_capacity : existing.max_capacity,
      image_url: input.image_url !== undefined ? input.image_url?.trim() || null : existing.image_url,
      color_code: input.color_code !== undefined ? input.color_code?.trim() || null : existing.color_code,
      is_active: input.is_active ?? existing.is_active,
      updated_at: new Date().toISOString(),
      updated_by: null
    };

    if (existing.tenant_id !== this.tenantId || !this.validClassTypeInput(updated)) {
      return undefined;
    }

    const next = [...current];
    next[index] = updated;
    this.classTypesSubject.next(next);

    return { ...updated };
  }

  toggleClassTypeStatus(classTypeId: number): ClassType | undefined {
    const current = this.classTypesSubject.value;
    const index = current.findIndex(item => item.class_type_id === classTypeId);

    if (index === -1 || current[index].tenant_id !== this.tenantId) {
      return undefined;
    }

    const next = [...current];
    const updated = {
      ...next[index],
      is_active: !next[index].is_active,
      updated_at: new Date().toISOString(),
      updated_by: null
    };

    next[index] = updated;
    this.classTypesSubject.next(next);
    return { ...updated };
  }

  getBookingsByClass(classId: number): ClassBooking[] {
    if (!this.getClassById(classId)) {
      return [];
    }

    return this.bookingsSubject.value
      .filter(item => item.class_id === classId && this.memberBelongsToTenantId(item.member_id))
      .sort((a, b) => a.booking_date.localeCompare(b.booking_date));
  }

  getWaitlistByClass(classId: number): ClassWaitlistEntry[] {
    if (!this.getClassById(classId)) {
      return [];
    }

    return this.waitlistSubject.value
      .filter(item => item.class_id === classId && this.memberBelongsToTenantId(item.member_id))
      .sort((a, b) => a.position - b.position);
  }

  getMemberBookingsForClass(classId: number, memberId: number): ClassBooking | undefined {
    if (!this.getClassById(classId) || !this.memberBelongsToTenantId(memberId)) {
      return undefined;
    }

    return this.bookingsSubject.value.find(
      item =>
        item.class_id === classId &&
        item.member_id === memberId &&
        (item.status === 'confirmed' || item.status === 'attended')
    );
  }

  getMemberWaitlistForClass(classId: number, memberId: number): ClassWaitlistEntry | undefined {
    if (!this.getClassById(classId) || !this.memberBelongsToTenantId(memberId)) {
      return undefined;
    }

    return this.waitlistSubject.value.find(
      item =>
        item.class_id === classId &&
        item.member_id === memberId &&
        (item.status === 'waiting' || item.status === 'confirmed')
    );
  }

  isClassFull(gymClass: GymClass): boolean {
    return this.occupiedBookingCount(gymClass.class_id) >= gymClass.max_capacity;
  }

  calculateAvailableSlots(gymClass: GymClass): number {
    return Math.max(gymClass.max_capacity - this.occupiedBookingCount(gymClass.class_id), 0);
  }

  addBooking(classId: number, memberId: number): ClassBooking | undefined {
    return this.createOrReactivateBooking(classId, memberId);
  }

  addToWaitlist(classId: number, memberId: number): ClassWaitlistEntry | undefined {
    const classEntry = this.getClassById(classId);

    if (
      !classEntry ||
      classEntry.status === 'cancelled' ||
      !this.isClassFull(classEntry) ||
      !this.memberBelongsToTenantId(memberId) ||
      this.getMemberBookingsForClass(classId, memberId)
    ) {
      return undefined;
    }

    if (this.getMemberWaitlistForClass(classId, memberId)) {
      return undefined;
    }

    const rows = this.waitlistSubject.value;
    const now = new Date().toISOString();
    const nextPosition = rows
      .filter(item => item.class_id === classId)
      .reduce((position, item) => Math.max(position, item.position), 0) + 1;
    const expiredEntry = rows.find(
      item => item.class_id === classId && item.member_id === memberId && item.status === 'expired'
    );
    const waitlistEntry: ClassWaitlistEntry = expiredEntry
      ? { ...expiredEntry, position: nextPosition, added_date: now, status: 'waiting', updated_at: now, updated_by: null }
      : {
          waitlist_id: rows.length > 0 ? Math.max(...rows.map(item => item.waitlist_id)) + 1 : 1,
          class_id: classId,
          member_id: memberId,
          position: nextPosition,
          added_date: now,
          status: 'waiting',
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null
        };

    this.waitlistSubject.next(expiredEntry
      ? rows.map(item => item.waitlist_id === expiredEntry.waitlist_id ? waitlistEntry : item)
      : [...rows, waitlistEntry]);
    return { ...waitlistEntry };
  }

  cancelBooking(bookingId: number, reason?: string): ClassBooking | undefined {
    const rows = this.bookingsSubject.value;
    const index = rows.findIndex(item => item.booking_id === bookingId);

    if (
      index === -1 ||
      rows[index].status !== 'confirmed' ||
      !this.getClassById(rows[index].class_id) ||
      !this.memberBelongsToTenantId(rows[index].member_id)
    ) {
      return undefined;
    }

    const current = rows[index];
    const now = new Date().toISOString();
    const next: ClassBooking = {
      ...current,
      status: 'cancelled',
      cancellation_date: now,
      cancellation_reason: reason?.trim() || current.cancellation_reason || 'Cancelled by admin',
      updated_at: now,
      updated_by: null
    };

    const updatedBookings = [...rows];
    updatedBookings[index] = next;
    this.bookingsSubject.next(updatedBookings);
    this.syncOccupiedCount(current.class_id);

    return { ...next };
  }

  updateBookingStatus(bookingId: number, status: 'attended' | 'no_show'): ClassBooking | undefined {
    const rows = this.bookingsSubject.value;
    const index = rows.findIndex(item => item.booking_id === bookingId);

    if (
      index === -1 ||
      rows[index].status !== 'confirmed' ||
      !this.memberBelongsToTenantId(rows[index].member_id)
    ) {
      return undefined;
    }

    const current = rows[index];
    const classEntry = this.getClassById(current.class_id);
    if (!classEntry || classEntry.status === 'cancelled' || !this.canUpdateAttendance(classEntry, status)) {
      return undefined;
    }

    const updated: ClassBooking = {
      ...current,
      status,
      updated_at: new Date().toISOString(),
      updated_by: null
    };

    const updatedBookings = [...rows];
    updatedBookings[index] = updated;
    this.bookingsSubject.next(updatedBookings);
    this.syncOccupiedCount(current.class_id);
    return { ...updated };
  }

  addToWaitlistIfFull(classId: number, memberId: number): ClassWaitlistEntry | undefined {
    const classEntry = this.getClassById(classId);

    if (!classEntry || !this.isClassFull(classEntry)) {
      return undefined;
    }

    return this.addToWaitlist(classId, memberId);
  }

  promoteWaitlistMember(waitlistId: number): { booking: ClassBooking | undefined; waitlist: ClassWaitlistEntry | undefined } {
    const waitlistRows = this.waitlistSubject.value;
    const index = waitlistRows.findIndex(
      item => item.waitlist_id === waitlistId && item.status === 'waiting'
    );

    if (index === -1) {
      return { booking: undefined, waitlist: undefined };
    }

    const entry = waitlistRows[index];
    const classEntry = this.getClassById(entry.class_id);

    if (
      !classEntry ||
      classEntry.status === 'cancelled' ||
      !this.memberBelongsToTenantId(entry.member_id)
    ) {
      return { booking: undefined, waitlist: undefined };
    }

    if (this.calculateAvailableSlots(classEntry) > 0) {
      const booking = this.createOrReactivateBooking(
        entry.class_id,
        entry.member_id,
        entry.waitlist_id
      );
      if (!booking) {
        return { booking: undefined, waitlist: { ...entry } };
      }

      const updatedWaitlist = [...waitlistRows];
      updatedWaitlist[index] = {
        ...updatedWaitlist[index],
        status: 'confirmed',
        updated_at: new Date().toISOString(),
        updated_by: null
      };
      this.waitlistSubject.next(updatedWaitlist);
      return { booking, waitlist: { ...updatedWaitlist[index] } };
    }

    return { booking: undefined, waitlist: { ...entry } };
  }

  expireWaitlistEntry(waitlistId: number): ClassWaitlistEntry | undefined {
    const rows = this.waitlistSubject.value;
    const entry = rows.find(item => item.waitlist_id === waitlistId && item.status === 'waiting');
    if (!entry || !this.getClassById(entry.class_id) || !this.memberBelongsToTenantId(entry.member_id)) {
      return undefined;
    }

    const updated: ClassWaitlistEntry = {
      ...entry,
      status: 'expired',
      updated_at: new Date().toISOString(),
      updated_by: null
    };
    this.waitlistSubject.next(rows.map(item => item.waitlist_id === waitlistId ? updated : item));
    return { ...updated };
  }

  getPromotionCandidates(classId: number): ClassWaitlistEntry[] {
    if (!this.getClassById(classId)) {
      return [];
    }

    return this.waitlistSubject.value
      .filter(item =>
        item.class_id === classId &&
        item.status === 'waiting' &&
        this.memberBelongsToTenantId(item.member_id)
      )
      .sort((a, b) => a.position - b.position);
  }

  getClassStatusLabel(gymClass: GymClass): string {
    if (gymClass.status !== 'cancelled' && this.isClassFull(gymClass)) {
      return 'Full';
    }

    return gymClass.status;
  }

  getTodayDateKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getWeekStart(dateValue: string): Date {
    const date = new Date(`${dateValue}T00:00:00`);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  }

  formatDateForDisplay(dateValue: string): string {
    const date = new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getActiveClassTypeCount(): number {
    return this.classTypesSubject.value.filter(
      item => item.tenant_id === this.tenantId && item.is_active
    ).length;
  }

  getDefaultClassType(): ClassType | undefined {
    return this.classTypesSubject.value.find(
      item => item.tenant_id === this.tenantId && item.is_active
    );
  }

  getClassesForWeek(dateValue: string): GymClass[] {
    const start = this.getWeekStart(dateValue);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date.toISOString().slice(0, 10);
    });

    return this.classesSubject.value.filter(
      item => item.tenant_id === this.tenantId && days.includes(item.class_date)
    );
  }

  getClassTypeName(classTypeId: number): string {
    return this.getClassTypeById(classTypeId)?.class_name ?? 'Class';
  }

  getBookingStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'attended':
        return 'Attended';
      case 'no_show':
        return 'No Show';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getWaitlistStatusLabel(status: WaitlistStatus): string {
    switch (status) {
      case 'waiting':
        return 'Waiting';
      case 'confirmed':
        return 'Confirmed';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  }

  canUpdateAttendance(gymClass: GymClass, status: 'attended' | 'no_show'): boolean {
    if (gymClass.tenant_id !== this.tenantId || gymClass.status === 'cancelled') {
      return false;
    }

    const now = Date.now();
    const start = new Date(`${gymClass.class_date}T${gymClass.start_time}:00`).getTime();
    const end = new Date(`${gymClass.class_date}T${gymClass.end_time}:00`).getTime();

    return status === 'attended' ? now >= start : now >= end;
  }

  private createOrReactivateBooking(
    classId: number,
    memberId: number,
    allowedWaitlistId?: number
  ): ClassBooking | undefined {
    const classEntry = this.getClassById(classId);
    if (!classEntry || classEntry.status === 'cancelled' || !this.memberBelongsToTenantId(memberId)) {
      return undefined;
    }

    const waitingEntry = this.waitlistSubject.value.find(
      item => item.class_id === classId && item.member_id === memberId && item.status === 'waiting'
    );
    if (waitingEntry && waitingEntry.waitlist_id !== allowedWaitlistId) {
      return undefined;
    }

    const rows = this.bookingsSubject.value;
    const prior = rows.find(item => item.class_id === classId && item.member_id === memberId);
    if (prior?.status === 'confirmed' || prior?.status === 'attended') {
      return undefined;
    }

    if (this.occupiedBookingCount(classId) >= classEntry.max_capacity) {
      return undefined;
    }

    const now = new Date().toISOString();
    const booking: ClassBooking = prior
      ? {
          ...prior,
          booking_date: now,
          status: 'confirmed',
          cancellation_date: null,
          cancellation_reason: null,
          updated_at: now,
          updated_by: null
        }
      : {
          booking_id: rows.length > 0 ? Math.max(...rows.map(item => item.booking_id)) + 1 : 1,
          class_id: classId,
          member_id: memberId,
          booking_date: now,
          status: 'confirmed',
          cancellation_date: null,
          cancellation_reason: null,
          created_at: now,
          created_by: null,
          updated_at: now,
          updated_by: null
        };

    this.bookingsSubject.next(prior
      ? rows.map(item => item.booking_id === prior.booking_id ? booking : item)
      : [...rows, booking]);
    this.syncOccupiedCount(classId);
    return { ...booking };
  }

  private occupiedBookingCount(classId: number): number {
    return this.bookingsSubject.value.filter(
      item =>
        item.class_id === classId &&
        (item.status === 'confirmed' || item.status === 'attended') &&
        this.memberBelongsToTenantId(item.member_id)
    ).length;
  }

  private syncOccupiedCount(classId: number): void {
    const rows = this.classesSubject.value;
    const index = rows.findIndex(item => item.class_id === classId && item.tenant_id === this.tenantId);
    if (index === -1) {
      return;
    }

    const updated = {
      ...rows[index],
      current_bookings: this.occupiedBookingCount(classId),
      updated_at: new Date().toISOString(),
      updated_by: null
    };
    this.classesSubject.next(rows.map((item, itemIndex) => itemIndex === index ? updated : item));
  }

  private memberBelongsToTenantId(memberId: number): boolean {
    const member = this.memberService.getMemberById(memberId);
    return member ? this.memberBelongsToTenant(member) : false;
  }

  private memberBelongsToTenant(member: Member): boolean {
    if (member.tenantId !== undefined && member.tenantId !== this.tenantId) {
      return false;
    }

    const tenantLocations = this.locationService.getLocations(this.tenantId);
    if (member.locationId !== undefined) {
      return tenantLocations.some(item => item.locationId === member.locationId);
    }

    const memberLocation = (member.locationName || member.location || '').trim().toLowerCase();
    return tenantLocations.some(item => item.locationName.trim().toLowerCase() === memberLocation);
  }

  private trainerBelongsToTenant(trainerId: number): boolean {
    const trainer = this.trainerService.getTrainerById(trainerId);
    if (!trainer) {
      return false;
    }

    const trainerLocation = (trainer.location ?? '').trim().toLowerCase();
    return this.locationService.getLocations(this.tenantId).some(
      item => item.locationName.trim().toLowerCase() === trainerLocation
    );
  }

  private validClassTimes(startTime: string, endTime: string): boolean {
    const validTime = (value: string): boolean => {
      const match = /^(\d{2}):(\d{2})$/.exec(value);
      return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
    };

    return validTime(startTime) && validTime(endTime) && endTime > startTime;
  }

  private validClassDate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      new Date(`${value}T00:00:00`).toISOString().slice(0, 10) === value;
  }

  private validHttpUrl(value: string | null): boolean {
    if (!value?.trim()) {
      return false;
    }

    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private validClassTypeInput(input: ClassTypeFormValues | ClassType): boolean {
    const className = input.class_name.trim();
    const duration = Number(input.duration_minutes);
    const capacity = input.max_capacity;
    const color = input.color_code?.trim() ?? '';
    const imageUrl = input.image_url?.trim() ?? '';

    if (
      !className ||
      className.length > 200 ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      (capacity !== null && (!Number.isInteger(Number(capacity)) || Number(capacity) < 1)) ||
      (color !== '' && !/^#[0-9A-Fa-f]{6}$/.test(color))
    ) {
      return false;
    }

    if (imageUrl) {
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return false;
        }
      } catch {
        return false;
      }
    }

    return true;
  }
}
