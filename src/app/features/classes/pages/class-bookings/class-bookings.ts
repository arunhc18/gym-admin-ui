import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Member } from '../../../members/services/member.service';
import { ClassBooking, ClassWaitlistEntry, GymClass } from '../../models/class.model';
import { ClassesService } from '../../services/classes.service';
import { LocationService } from '../../../../shared/services/location.service';
import { TrainerService } from '../../../../shared/services/trainer.service';

@Component({
  selector: 'app-class-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-bookings.html',
  styleUrl: './class-bookings.scss'
})
export class ClassBookingsComponent implements OnInit {
  readonly tenantId = 1;

  classes: GymClass[] = [];
  members: Member[] = [];
  selectedClassId: number | null = null;
  activeTab: 'bookings' | 'waitlist' = 'bookings';

  showMemberModal = false;
  memberSelectionPurpose: 'booking' | 'waitlist' = 'booking';
  memberSearchText = '';
  showCancellationModal = false;
  pendingBookingId: number | null = null;
  cancellationReason = '';
  toastMessage = '';

  constructor(
    public readonly classService: ClassesService,
    private readonly locationService: LocationService,
    private readonly trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    this.members = this.classService.getMembersForTenant();
    this.classService.getClasses().subscribe(items => {
      this.classes = items.filter(item => item.tenant_id === this.tenantId);
      if (!this.classes.some(item => item.class_id === this.selectedClassId)) {
        this.selectedClassId = this.classes[0]?.class_id ?? null;
      }
    });
  }

  get selectedClass(): GymClass | null {
    return this.classes.find(item => item.class_id === this.selectedClassId) ?? null;
  }

  get selectedClassBookings(): ClassBooking[] {
    return this.selectedClass
      ? this.classService.getBookingsByClass(this.selectedClass.class_id)
      : [];
  }

  get selectedClassWaitlist(): ClassWaitlistEntry[] {
    return this.selectedClass
      ? this.classService.getWaitlistByClass(this.selectedClass.class_id)
      : [];
  }

  get filteredMembers(): Member[] {
    const query = this.memberSearchText.trim().toLowerCase();
    return this.members.filter(member => {
      const name = `${member.firstName} ${member.lastName}`.toLowerCase();
      return !query || name.includes(query) || member.phone.toLowerCase().includes(query);
    });
  }

  get availableSlots(): number {
    return this.selectedClass
      ? this.classService.calculateAvailableSlots(this.selectedClass)
      : 0;
  }

  selectClass(classId: number): void {
    this.selectedClassId = classId;
    this.activeTab = 'bookings';
    this.toastMessage = '';
  }

  classOptionLabel(classItem: GymClass): string {
    return `${this.classService.getClassTypeName(classItem.class_type_id)} · ${this.formatDate(classItem.class_date)} · ${classItem.start_time}-${classItem.end_time}`;
  }

  openCreateBooking(): void {
    this.openMemberPicker('booking');
  }

  openAddToWaitlist(): void {
    this.openMemberPicker('waitlist');
  }

  private openMemberPicker(purpose: 'booking' | 'waitlist'): void {
    const classItem = this.selectedClass;
    if (!classItem || classItem.status === 'cancelled') {
      this.toastMessage = 'Bookings and waitlist changes are unavailable for a cancelled class.';
      return;
    }
    if (purpose === 'booking' && this.classService.isClassFull(classItem)) {
      this.toastMessage = 'This class is full. Select the Waitlist tab to add a member.';
      return;
    }
    if (purpose === 'waitlist' && !this.classService.isClassFull(classItem)) {
      this.toastMessage = 'Members can be waitlisted when the class is full.';
      return;
    }

    this.toastMessage = '';
    this.memberSelectionPurpose = purpose;
    this.memberSearchText = '';
    this.showMemberModal = true;
  }

  closeMemberModal(): void {
    this.showMemberModal = false;
    this.memberSearchText = '';
  }

  isMemberSelectable(memberId: number): boolean {
    return Boolean(
      this.selectedClass &&
      this.selectedClass.status !== 'cancelled' &&
      !this.classService.getMemberBookingsForClass(this.selectedClass.class_id, memberId) &&
      !this.classService.getMemberWaitlistForClass(this.selectedClass.class_id, memberId)
    );
  }

  createBookingForMember(memberId: number): void {
    const classItem = this.selectedClass;
    if (!classItem || classItem.status === 'cancelled' || !this.isMemberSelectable(memberId)) {
      this.toastMessage = 'This member already has an active booking or waitlist entry for this class.';
      return;
    }

    if (this.memberSelectionPurpose === 'waitlist') {
      const entry = this.classService.addToWaitlist(classItem.class_id, memberId);
      this.toastMessage = entry ? 'Member added to the waitlist.' : 'Unable to add this member to the waitlist.';
    } else {
      const booking = this.classService.addBooking(classItem.class_id, memberId);
      this.toastMessage = booking ? 'Booking created successfully.' : 'Unable to create this booking.';
    }
    this.closeMemberModal();
  }

  canMarkAttendance(booking: ClassBooking, status: 'attended' | 'no_show'): boolean {
    return Boolean(
      this.selectedClass &&
      booking.status === 'confirmed' &&
      this.classService.canUpdateAttendance(this.selectedClass, status)
    );
  }

  updateBookingStatus(bookingId: number, status: 'attended' | 'no_show'): void {
    const updated = this.classService.updateBookingStatus(bookingId, status);
    this.toastMessage = updated
      ? `Booking marked as ${status === 'no_show' ? 'No Show' : status}.`
      : 'This attendance action is not available for the class time or booking status.';
  }

  openCancelBooking(booking: ClassBooking): void {
    if (booking.status !== 'confirmed') {
      return;
    }
    this.pendingBookingId = booking.booking_id;
    this.cancellationReason = '';
    this.toastMessage = '';
    this.showCancellationModal = true;
  }

  confirmCancelBooking(): void {
    if (this.pendingBookingId === null || !this.cancellationReason.trim()) {
      return;
    }
    const cancelled = this.classService.cancelBooking(this.pendingBookingId, this.cancellationReason);
    this.toastMessage = cancelled ? 'Booking cancelled.' : 'Unable to cancel this booking.';
    this.closeCancellationModal();
  }

  closeCancellationModal(): void {
    this.showCancellationModal = false;
    this.pendingBookingId = null;
    this.cancellationReason = '';
  }

  confirmWaitlistEntry(waitlistId: number): void {
    const result = this.classService.promoteWaitlistMember(waitlistId);
    this.toastMessage = result.booking
      ? 'Waitlist member confirmed and booked.'
      : 'No place is available or this entry cannot be confirmed.';
  }

  expireWaitlistEntry(waitlistId: number): void {
    const expired = this.classService.expireWaitlistEntry(waitlistId);
    this.toastMessage = expired ? 'Waitlist entry marked expired.' : 'Unable to expire this entry.';
  }

  memberName(memberId: number): string {
    const member = this.members.find(item => item.memberId === memberId);
    return member ? `${member.firstName} ${member.lastName}`.trim() : 'Member';
  }

  memberPhone(memberId: number): string {
    return this.members.find(item => item.memberId === memberId)?.phone ?? '—';
  }

  locationName(locationId: number): string {
    return this.locationService.getLocationById(locationId)?.locationName ?? 'Unknown';
  }

  trainerName(trainerId: number | null): string {
    return this.trainerService.getTrainerLabel(trainerId);
  }

  formatDate(value: string): string {
    const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'full': return 'status-full';
      case 'confirmed': return 'status-confirmed';
      case 'attended': return 'status-attended';
      case 'no_show': return 'status-no-show';
      case 'waiting': return 'status-waiting';
      default: return 'status-default';
    }
  }

  bookingStatusLabel(status: string): string {
    return this.classService.getBookingStatusLabel(status);
  }

  waitlistStatusLabel(status: ClassWaitlistEntry['status']): string {
    return this.classService.getWaitlistStatusLabel(status);
  }

  clearToast(): void {
    this.toastMessage = '';
  }
}