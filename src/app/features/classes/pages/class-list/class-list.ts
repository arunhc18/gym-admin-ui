import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Member } from '../../../members/services/member.service';
import {
  ClassBooking,
  ClassStatus,
  ClassType,
  ClassWaitlistEntry,
  ClassFormValues,
  GymClass,
  WaitlistStatus
} from '../../models/class.model';
import { ClassesService } from '../../services/classes.service';

import { LocationOption } from '../../../../shared/models/location.model';
import { LocationService } from '../../../../shared/services/location.service';
import { Trainer } from '../../../../shared/models/trainer.model';
import { TrainerService } from '../../../../shared/services/trainer.service';

function validateVirtualUrl(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;

  if (!parent) {
    return null;
  }

  const isVirtual = parent.get('is_virtual')?.value === true;
  const value = control.value as string | null;

  if (!isVirtual) {
    return null;
  }

  if (!value || !value.trim()) {
    return { requiredVirtualUrl: true };
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? null
      : { invalidVirtualUrl: true };
  } catch {
    return { invalidVirtualUrl: true };
  }
}

function validateEndTime(control: AbstractControl): ValidationErrors | null {
  const startTime = control.parent?.get('start_time')?.value as string | null;
  const endTime = control.value as string | null;

  if (!startTime || !endTime) {
    return null;
  }

  return endTime > startTime ? null : { endTimeBeforeStart: true };
}

function validatePositiveInteger(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') {
    return null;
  }

  return Number.isInteger(Number(value)) && Number(value) > 0
    ? null
    : { positiveInteger: true };
}

@Component({
  selector: 'app-class-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [DatePipe],
  templateUrl: './class-list.html',
  styleUrl: './class-list.scss'
})
export class ClassListComponent implements OnInit {
  readonly tenantId = 1;
  viewMode: 'list' | 'week' | 'calendar' = 'list';
  calendarWeekStart = this.getWeekStartDate(new Date());

  classTypes: ClassType[] = [];
  classes: GymClass[] = [];
  bookings: ClassBooking[] = [];
  waitlistEntries: ClassWaitlistEntry[] = [];
  locations: LocationOption[] = [];
  trainers: Trainer[] = [];
  members: Member[] = [];

  searchText = '';
  filterLocation = '';
  filterType = '';
  filterTrainer = '';
  filterStatus = '';
  filterDate = '';

  selectedClassId: number | null = null;
  drawerTab: 'bookings' | 'waitlist' = 'bookings';
  classModalOpen = false;
  editingClassId: number | null = null;
  classSubmitted = false;

  showMemberModal = false;
  memberSearchText = '';
  pendingMemberClassId: number | null = null;
  pendingBookingId: number | null = null;
  memberSelectionPurpose: 'booking' | 'waitlist' = 'booking';

  showConfirmationModal = false;
  confirmationAction: 'cancel-class' | 'cancel-booking' | null = null;
  confirmationReason = '';
  confirmationTitle = '';
  confirmationText = '';

  toastMessage = '';

  classForm = new FormGroup({
    class_type_id: new FormControl<number | null>(null, [Validators.required]),
    location_id: new FormControl<number | null>(null, [Validators.required]),
    trainer_id: new FormControl<number | null>(null),
    class_date: new FormControl<string>('', [Validators.required]),
    start_time: new FormControl<string>('', [Validators.required]),
    end_time: new FormControl<string>('', [Validators.required, validateEndTime]),
    max_capacity: new FormControl<number | null>(null, [
      Validators.required,
      validatePositiveInteger
    ]),
    room_number: new FormControl<string | null>(null, [Validators.maxLength(50)]),
    status: new FormControl<ClassStatus>('scheduled', [Validators.required]),
    is_virtual: new FormControl<boolean>(false),
    virtual_meeting_url: new FormControl<string | null>(null, [validateVirtualUrl]),
    cancellation_reason: new FormControl<string | null>(null)
  });

  constructor(
    public readonly classService: ClassesService,
    private readonly locationService: LocationService,
    private readonly trainerService: TrainerService
  ) {}

  ngOnInit(): void {
    this.locations = this.locationService.getLocations(this.tenantId);
    const tenantLocationNames = new Set(this.locations.map(item => item.locationName.toLowerCase()));
    this.trainers = this.trainerService.getTrainers().filter(
      trainer => tenantLocationNames.has((trainer.location ?? '').toLowerCase())
    );
    this.members = this.classService.getMembersForTenant();

    this.classService.getClassTypes().subscribe(items => {
      this.classTypes = items.filter(item => item.tenant_id === this.tenantId);
    });

    this.classService.getClasses().subscribe(items => {
      this.classes = items.filter(item => item.tenant_id === this.tenantId);
    });

    this.classService.getBookings().subscribe(items => {
      this.bookings = items.filter(item =>
        this.classes.some(classItem => classItem.class_id === item.class_id) &&
        this.members.some(member => member.memberId === item.member_id)
      );
    });

    this.classService.getWaitlist().subscribe(items => {
      this.waitlistEntries = items.filter(item =>
        this.classes.some(classItem => classItem.class_id === item.class_id) &&
        this.members.some(member => member.memberId === item.member_id)
      );
    });

    this.classForm.get('is_virtual')?.valueChanges.subscribe(() => {
      this.syncVirtualUrlValidators();
    });

    this.classForm.get('start_time')?.valueChanges.subscribe(() => {
      this.classForm.get('end_time')?.updateValueAndValidity({ emitEvent: false });
    });

    this.resetClassForm();
  }

  get filteredClasses(): GymClass[] {
    const query = this.searchText.trim().toLowerCase();

    return this.classes.filter(item => {
      const className = this.classService.getClassTypeName(item.class_type_id).toLowerCase();
      const trainerName = this.trainerService.getTrainerLabel(item.trainer_id).toLowerCase();
      const roomName = (item.room_number ?? '').toLowerCase();
      const locName = this.getLocationName(item.location_id).toLowerCase();
      const matchesText =
        !query ||
        [className, trainerName, roomName, locName].some(value => value.includes(query));

      const matchesLocation = !this.filterLocation || item.location_id.toString() === this.filterLocation;
      const matchesType = !this.filterType || item.class_type_id.toString() === this.filterType;
      const matchesTrainer = !this.filterTrainer || item.trainer_id?.toString() === this.filterTrainer;
      const matchesStatus = !this.filterStatus ||
        (this.filterStatus === 'full'
          ? item.status !== 'cancelled' && this.classService.isClassFull(item)
          : item.status === this.filterStatus);
      const matchesDate = !this.filterDate || item.class_date === this.filterDate;

      return matchesText && matchesLocation && matchesType && matchesTrainer && matchesStatus && matchesDate;
    });
  }

  get weekDates(): Array<{ key: string; label: string; classes: GymClass[] }> {
    const today = this.filterDate || this.classService.getTodayDateKey();
    const start = this.classService.getWeekStart(today);

    return this.buildWeekDays(start);
  }

  get calendarWeekDates(): Array<{ key: string; label: string; classes: GymClass[] }> {
    return this.buildWeekDays(this.getWeekStartDate(this.calendarWeekStart));
  }

  get selectedClass(): GymClass | null {
    if (this.selectedClassId === null) {
      return null;
    }

    return this.classes.find(item => item.class_id === this.selectedClassId) ?? null;
  }

  get selectedClassBookings(): ClassBooking[] {
    if (!this.selectedClass) {
      return [];
    }

    return this.classService.getBookingsByClass(this.selectedClass.class_id);
  }

  get selectedClassWaitlist(): ClassWaitlistEntry[] {
    if (!this.selectedClass) {
      return [];
    }

    return this.classService.getWaitlistByClass(this.selectedClass.class_id);
  }

  get filteredMembers(): Member[] {
    const query = this.memberSearchText.trim().toLowerCase();

    return this.members.filter(item => {
      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const phone = (item.phone ?? '').toLowerCase();
      const matchesSearch = !query || fullName.includes(query) || phone.includes(query);
      return matchesSearch;
    });
  }

  get totalBookings(): number {
    return this.bookings.filter(item => item.status === 'confirmed' || item.status === 'attended').length;
  }

  get todayClasses(): number {
    const todayKey = this.classService.getTodayDateKey();
    return this.classes.filter(item => item.class_date === todayKey).length;
  }

  get scheduledClasses(): number {
    return this.classes.filter(item => item.status === 'scheduled' || item.status === 'ongoing').length;
  }

  get waitlistedMembers(): number {
    return this.waitlistEntries.filter(item => item.status === 'waiting').length;
  }

  get selectableClassTypes(): ClassType[] {
    const selectedTypeId = this.classForm.get('class_type_id')?.value;
    return this.classTypes.filter(
      item => item.is_active || item.class_type_id === selectedTypeId
    );
  }

  getLocationName(locationId: number): string {
    return this.locationService.getLocationById(locationId)?.locationName ?? 'Unknown';
  }

  getTrainerName(trainerId: number | null): string {
    return this.trainerService.getTrainerLabel(trainerId);
  }

  getClassName(classId: number): string {
    const classEntry = this.classes.find(item => item.class_id === classId);
    return classEntry ? this.classService.getClassTypeName(classEntry.class_type_id) : 'Class';
  }

  getClassTypeLabel(classTypeId: number): string {
    const classType = this.classTypes.find(item => item.class_type_id === classTypeId);
    return `${this.classService.getClassTypeName(classTypeId)}${classType && !classType.is_active ? ' (Inactive)' : ''}`;
  }

  getCapacityBadgeText(classItem: GymClass): string {
    if (classItem.status !== 'cancelled' && this.classService.isClassFull(classItem)) {
      return 'Full';
    }

    return `${classItem.current_bookings} / ${classItem.max_capacity}`;
  }

  getClassStatusLabel(classItem: GymClass): string {
    if (classItem.status !== 'cancelled' && this.classService.isClassFull(classItem)) {
      return 'Full';
    }

    return classItem.status;
  }

  openCreateClass(): void {
    this.toastMessage = '';
    this.editingClassId = null;
    this.classSubmitted = false;
    this.resetClassForm();
    this.classModalOpen = true;
  }

  openEditClass(classItem: GymClass): void {
    this.toastMessage = '';
    this.selectedClassId = null;
    this.editingClassId = classItem.class_id;
    this.classSubmitted = false;
    this.classForm.patchValue({
      class_type_id: classItem.class_type_id,
      location_id: classItem.location_id,
      trainer_id: classItem.trainer_id,
      class_date: classItem.class_date,
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      max_capacity: classItem.max_capacity,
      room_number: classItem.room_number,
      status: classItem.status,
      is_virtual: classItem.is_virtual,
      virtual_meeting_url: classItem.virtual_meeting_url,
      cancellation_reason: classItem.cancellation_reason
    });
    this.syncVirtualUrlValidators();
    this.classModalOpen = true;
  }

  closeClassModal(): void {
    this.classModalOpen = false;
    this.classSubmitted = false;
    this.resetClassForm();
  }

  saveClass(): void {
    this.classSubmitted = true;

    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    const values = this.classForm.getRawValue() as ClassFormValues;

    const result = this.editingClassId !== null
      ? this.classService.updateClass(this.editingClassId, values)
      : this.classService.addClass(values);

    if (!result) {
      this.toastMessage = 'Class could not be saved. Check the selected type, location, trainer, capacity, and time range.';
      return;
    }

    if (this.editingClassId !== null) {
      this.toastMessage = 'Class updated successfully.';
    } else {
      this.toastMessage = 'Class created successfully.';
    }

    this.closeClassModal();
  }

  openClassDetails(classId: number): void {
    this.selectedClassId = classId;
    this.drawerTab = 'bookings';
  }

  editClassSession(classItem: GymClass): void {
    this.openEditClass(classItem);
  }

  cancelSingleClass(classItem: GymClass): void {
    if (classItem.status === 'cancelled') {
      return;
    }

    this.selectedClassId = classItem.class_id;
    this.confirmationAction = 'cancel-class';
    this.confirmationTitle = 'Cancel class';
    this.confirmationText = 'This action will cancel the class and block new bookings.';
    this.confirmationReason = classItem.cancellation_reason ?? '';
    this.showConfirmationModal = true;
  }

  closeClassDetails(): void {
    this.selectedClassId = null;
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterLocation = '';
    this.filterType = '';
    this.filterTrainer = '';
    this.filterStatus = '';
    this.filterDate = '';
  }

  previousCalendarWeek(): void {
    const next = new Date(this.calendarWeekStart);
    next.setDate(next.getDate() - 7);
    this.calendarWeekStart = next;
  }

  nextCalendarWeek(): void {
    const next = new Date(this.calendarWeekStart);
    next.setDate(next.getDate() + 7);
    this.calendarWeekStart = next;
  }

  formatWeekRange(date: Date): string {
    const start = this.getWeekStartDate(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${this.formatShortDate(start)} - ${this.formatShortDate(end)}`;
  }

  openAddMemberToClass(classId: number, purpose: 'booking' | 'waitlist' = 'booking'): void {
    const classItem = this.classService.getClassById(classId);
    if (!classItem || classItem.status === 'cancelled') {
      this.toastMessage = 'Bookings and waitlist changes are unavailable for a cancelled class.';
      return;
    }

    if (purpose === 'booking' && this.classService.isClassFull(classItem)) {
      this.toastMessage = 'This class is full. Use the Waitlist tab to add a member.';
      return;
    }

    if (purpose === 'waitlist' && !this.classService.isClassFull(classItem)) {
      this.toastMessage = 'Members can be waitlisted when the class is full.';
      return;
    }

    this.toastMessage = '';
    this.pendingMemberClassId = classId;
    this.memberSelectionPurpose = purpose;
    this.showMemberModal = true;
    this.memberSearchText = '';
  }

  closeMemberModal(): void {
    this.showMemberModal = false;
    this.pendingMemberClassId = null;
    this.memberSearchText = '';
  }

  isMemberSelectable(memberId: number): boolean {
    const classId = this.pendingMemberClassId;
    const classItem = classId === null ? undefined : this.classService.getClassById(classId);
    return Boolean(
      classItem &&
      classItem.status !== 'cancelled' &&
      !this.classService.getMemberBookingsForClass(classItem.class_id, memberId) &&
      !this.classService.getMemberWaitlistForClass(classItem.class_id, memberId)
    );
  }

  addMemberToSelectedClass(memberId: number): void {
    const classId = this.pendingMemberClassId;
    if (classId === null || !this.isMemberSelectable(memberId)) {
      this.toastMessage = 'This member already has an active booking or waitlist entry for this class.';
      return;
    }

    const classItem = this.classService.getClassById(classId);
    if (!classItem || classItem.status === 'cancelled') {
      return;
    }

    if (this.memberSelectionPurpose === 'waitlist') {
      const entry = this.classService.addToWaitlist(classId, memberId);
      this.toastMessage = entry ? 'Member added to the waitlist.' : 'Unable to add this member to the waitlist.';
      this.closeMemberModal();
      return;
    }

    const booking = this.classService.addBooking(classId, memberId);
    this.toastMessage = booking ? 'Booking added successfully.' : 'Unable to add this booking.';
    this.closeMemberModal();
  }

  cancelClassBooking(bookingId: number): void {
    const booking = this.bookings.find(item => item.booking_id === bookingId);
    if (!booking || booking.status !== 'confirmed') {
      return;
    }

    this.confirmationAction = 'cancel-booking';
    this.confirmationTitle = 'Cancel booking';
    this.confirmationText = 'Enter a reason to cancel this confirmed booking.';
    this.confirmationReason = booking.cancellation_reason ?? '';
    this.pendingBookingId = bookingId;
    this.showConfirmationModal = true;
  }

  cancelSelectedClass(): void {
    if (!this.selectedClass || this.selectedClass.status === 'cancelled') {
      return;
    }

    this.confirmationAction = 'cancel-class';
    this.confirmationTitle = 'Cancel class';
    this.confirmationText = 'This action will cancel the class and block new bookings.';
    this.confirmationReason = this.selectedClass.cancellation_reason ?? '';
    this.showConfirmationModal = true;
  }

  confirmCancellation(): void {
    if (this.confirmationAction === 'cancel-class') {
      if (!this.selectedClass) {
        return;
      }
      const updated = this.classService.cancelClass(
        this.selectedClass.class_id,
        this.confirmationReason.trim() || 'Cancelled by admin'
      );
      this.toastMessage = updated ? 'Class cancelled.' : 'Unable to cancel this class.';
    }

    if (this.confirmationAction === 'cancel-booking') {
      if (this.pendingBookingId === null || !this.confirmationReason.trim()) {
        return;
      }
      const updated = this.classService.cancelBooking(this.pendingBookingId, this.confirmationReason);
      this.toastMessage = updated ? 'Booking cancelled.' : 'Unable to cancel this booking.';
    }

    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationAction = null;
    this.confirmationTitle = '';
    this.confirmationText = '';
    this.confirmationReason = '';
    this.pendingMemberClassId = null;
    this.pendingBookingId = null;
  }

  get cancellationReasonRequired(): boolean {
    return this.confirmationAction === 'cancel-booking';
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
      : status === 'no_show'
        ? 'No Show is available after the class end time for a confirmed booking.'
        : 'Attendance is available after the class start time for a confirmed booking.';
  }

  promoteWaitlistEntry(waitlistId: number): void {
    const result = this.classService.promoteWaitlistMember(waitlistId);
    this.toastMessage = result.booking
      ? 'Waitlist member confirmed and booked.'
      : 'No place is available or this entry cannot be confirmed.';
  }

  expireWaitlistEntry(waitlistId: number): void {
    const updated = this.classService.expireWaitlistEntry(waitlistId);
    this.toastMessage = updated ? 'Waitlist entry marked expired.' : 'Unable to expire this entry.';
  }

  getMemberName(memberId: number): string {
    const member = this.members.find(item => item.memberId === memberId);
    return member ? `${member.firstName} ${member.lastName}`.trim() : 'Member';
  }

  getMemberPhone(memberId: number): string {
    return this.members.find(item => item.memberId === memberId)?.phone ?? '—';
  }

  clearToast(): void {
    this.toastMessage = '';
  }

  formatDate(dateValue: string): string {
    const date = dateValue.includes('T') ? new Date(dateValue) : new Date(`${dateValue}T00:00:00`);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatBookingDate(dateValue: string): string {
    return new Date(dateValue).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTimeRange(start: string, end: string): string {
    return `${start} - ${end}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'ongoing':
        return 'status-ongoing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'confirmed':
        return 'status-confirmed';
      case 'attended':
        return 'status-attended';
      case 'no_show':
        return 'status-no-show';
      case 'waiting':
        return 'status-waiting';
      default:
        return 'status-default';
    }
  }

  syncVirtualUrlValidators(): void {
    const control = this.classForm.get('virtual_meeting_url');
    if (!control) {
      return;
    }

    if (this.classForm.get('is_virtual')?.value) {
      control.setValidators([Validators.required, validateVirtualUrl]);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity();
  }

  private resetClassForm(): void {
    this.classForm.reset({
      class_type_id: null,
      location_id: null,
      trainer_id: null,
      class_date: '',
      start_time: '',
      end_time: '',
      max_capacity: null,
      room_number: null,
      status: 'scheduled',
      is_virtual: false,
      virtual_meeting_url: null,
      cancellation_reason: null
    });

    this.syncVirtualUrlValidators();
  }

  private buildWeekDays(start: Date): Array<{ key: string; label: string; classes: GymClass[] }> {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = this.toDateKey(date);

      return {
        key,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        classes: this.classes.filter(item => item.class_date === key)
      };
    });
  }

  private getWeekStartDate(date: Date): Date {
    const next = new Date(date);
    const day = next.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    next.setDate(next.getDate() + diff);
    next.setHours(0, 0, 0, 0);
    return next;
  }

  private formatShortDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
