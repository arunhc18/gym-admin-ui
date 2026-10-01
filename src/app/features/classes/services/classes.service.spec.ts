import { TestBed } from '@angular/core/testing';

import { ClassesService } from './classes.service';

describe('ClassesService', () => {
  let service: ClassesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassesService);
  });

  it('scopes members to tenant locations and prevents booking duplicates', () => {
    const tenantMembers = service.getMembersForTenant();
    const firstMember = tenantMembers.find(member => member.memberId === 1)!;

    expect(tenantMembers.some(member => member.memberId === 6)).toBe(false);
    expect(service.addBooking(4, 6)).toBeUndefined();

    const booking = service.addBooking(4, firstMember.memberId);
    expect(booking?.status).toBe('confirmed');
    expect(service.addBooking(4, firstMember.memberId)).toBeUndefined();
    expect(service.getClassById(4)?.current_bookings).toBe(1);
  });

  it('cancels and reactivates the existing unique booking record', () => {
    const memberId = 1;
    const initial = service.addBooking(4, memberId)!;

    const cancelled = service.cancelBooking(initial.booking_id, 'Schedule changed');
    expect(cancelled?.status).toBe('cancelled');
    expect(cancelled?.cancellation_date).toBeTruthy();
    expect(cancelled?.cancellation_reason).toBe('Schedule changed');
    expect(service.getClassById(4)?.current_bookings).toBe(0);

    const rebooked = service.addBooking(4, memberId);
    expect(rebooked?.booking_id).toBe(initial.booking_id);
    expect(rebooked?.status).toBe('confirmed');
    expect(service.getBookingsByClass(4)).toHaveLength(1);
    expect(service.getClassById(4)?.current_bookings).toBe(1);
  });

  it('prevents duplicate waitlist entries and confirms into an available booking slot', () => {
    const members = service.getMembersForTenant();
    const memberOne = members.find(member => member.memberId === 1)!;
    const memberTwo = members.find(member => member.memberId === 2)!;
    const classItem = service.updateClass(4, { max_capacity: 1 })!;

    const booking = service.addBooking(classItem.class_id, memberOne.memberId)!;
    const waitlist = service.addToWaitlist(classItem.class_id, memberTwo.memberId)!;

    expect(waitlist.position).toBe(1);
    expect(service.addToWaitlist(classItem.class_id, memberTwo.memberId)).toBeUndefined();
    expect(service.addBooking(classItem.class_id, memberTwo.memberId)).toBeUndefined();
    expect(service.promoteWaitlistMember(waitlist.waitlist_id).booking).toBeUndefined();

    service.cancelBooking(booking.booking_id, 'Place released');
    const promoted = service.promoteWaitlistMember(waitlist.waitlist_id);
    expect(promoted.booking?.member_id).toBe(memberTwo.memberId);
    expect(promoted.waitlist?.status).toBe('confirmed');
    expect(service.getClassById(classItem.class_id)?.current_bookings).toBe(1);
  });

  it('reuses expired waitlist rows and keeps history instead of inserting duplicates', () => {
    const members = service.getMembersForTenant();
    const classItem = service.updateClass(4, { max_capacity: 1 })!;
    service.addBooking(classItem.class_id, members[0].memberId);

    const entry = service.addToWaitlist(classItem.class_id, members[1].memberId)!;
    expect(service.expireWaitlistEntry(entry.waitlist_id)?.status).toBe('expired');

    const reactivated = service.addToWaitlist(classItem.class_id, members[1].memberId);
    expect(reactivated?.waitlist_id).toBe(entry.waitlist_id);
    expect(reactivated?.status).toBe('waiting');
    expect(service.getWaitlistByClass(classItem.class_id)).toHaveLength(1);
  });

  it('frees capacity for no-shows and blocks attendance and registrations after class cancellation', () => {
    const members = service.getMembersForTenant();
    const today = service.getTodayDateKey();
    const classItem = service.updateClass(3, {
      class_date: today,
      start_time: '00:00',
      end_time: '00:01',
      max_capacity: 1
    })!;

    const noShowBooking = service.addBooking(classItem.class_id, members[0].memberId)!;
    expect(service.updateBookingStatus(noShowBooking.booking_id, 'no_show')?.status).toBe('no_show');
    expect(service.getClassById(classItem.class_id)?.current_bookings).toBe(0);

    const activeBooking = service.addBooking(classItem.class_id, members[1].memberId)!;
    const waiting = service.addToWaitlist(classItem.class_id, members[2].memberId)!;
    expect(service.cancelClass(classItem.class_id, 'Gym closed')?.status).toBe('cancelled');
    expect(service.addBooking(classItem.class_id, members[3].memberId)).toBeUndefined();
    expect(service.addToWaitlist(classItem.class_id, members[3].memberId)).toBeUndefined();
    expect(service.promoteWaitlistMember(waiting.waitlist_id).booking).toBeUndefined();
    expect(service.updateBookingStatus(activeBooking.booking_id, 'attended')).toBeUndefined();
  });
});