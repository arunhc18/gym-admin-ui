import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  MemberRecord,
  MemberService
} from '../../../members/services/member.service';

import {
  LocationOption
} from '../../../../shared/models/location.model';

import {
  LocationService
} from '../../../../shared/services/location.service';

import {
  CleaningSchedule,
  EmployeeOption,
  Facility,
  FacilityBooking,
  FacilityType,
  MaintenanceRequest
} from '../../models/facility.model';

import {
  FacilityService
} from '../../services/facility.service';


type FacilityPage =
  | 'facilities'
  | 'bookings'
  | 'cleaning'
  | 'maintenance';


type DeletionConfirmation = {
  kind: 'facility' | 'booking' | 'cleaning' | 'maintenance';
  id: number;
  label: string;
};


const trimmedFacilityNameValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const name = String(control.value ?? '').trim();

  if (!name) {
    return { required: true };
  }

  if (name.length < 2) {
    return { minlength: true };
  }

  return name.length > 200
    ? { maxlength: true }
    : null;
};


const optionalPositiveIntegerValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (control.value === null || control.value === '') {
    return null;
  }

  const value = Number(control.value);
  return Number.isInteger(value) && value >= 1
    ? null
    : { positiveInteger: true };
};


const optionalNonNegativeNumberValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (control.value === null || control.value === '') {
    return null;
  }

  const value = Number(control.value);
  return Number.isFinite(value) && value >= 0
    ? null
    : { nonNegative: true };
};


const requiredTrimmedTextValidator = (
  maxLength: number
): ValidatorFn => control => {
  const text = String(control.value ?? '').trim();

  if (!text) {
    return { required: true };
  }

  if (text.length < 2) {
    return { minlength: true };
  }

  return text.length > maxLength
    ? { maxlength: true }
    : null;
};


const bookingTimeRangeValidator: ValidatorFn = control => {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;

  return startTime && endTime && startTime >= endTime
    ? { invalidTimeRange: true }
    : null;
};


const cleaningDateOrderValidator: ValidatorFn = control => {
  const lastCleanedDate = control.get('lastCleanedDate')?.value;
  const nextCleaningDate = control.get('nextCleaningDate')?.value;

  return lastCleanedDate && nextCleaningDate && lastCleanedDate >= nextCleaningDate
    ? { invalidCleaningDateOrder: true }
    : null;
};


@Component({
  selector:
    'app-facility-management',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './facility-management.html',

  styleUrl:
    './facility-management.scss'
})
export class FacilityManagementComponent
  implements OnInit {


  readonly tenantId =
    1;


  activePage:
    FacilityPage =
    'facilities';


  facilities:
    Facility[] =
    [];

  bookings:
    FacilityBooking[] =
    [];

  cleaningSchedules:
    CleaningSchedule[] =
    [];

  maintenanceRequests:
    MaintenanceRequest[] =
    [];

  locations:
    LocationOption[] =
    [];

  members:
    MemberRecord[] =
    [];

  employees:
    EmployeeOption[] =
    [];


  search =
    '';

  selectedLocation:
    number | null =
    null;

  selectedType =
    '';

  selectedStatus =
    '';


  modal:
    'facility'
    | 'booking'
    | 'cleaning'
    | 'maintenance'
    | null =
    null;

  editingFacilityId: number | null = null;
  editingBookingId: number | null = null;
  editingCleaningScheduleId: number | null = null;
  editingMaintenanceRequestId: number | null = null;

  deleteConfirmation: DeletionConfirmation | null = null;


  errorMessage =
    '';


  facilityForm:
    FormGroup;

  bookingForm:
    FormGroup;

  cleaningForm:
    FormGroup;

  maintenanceForm:
    FormGroup;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly formBuilder:
      FormBuilder,

    private readonly facilityService:
      FacilityService,

    private readonly locationService:
      LocationService,

    private readonly memberService:
      MemberService

  ) {


    this.facilityForm =
      this.formBuilder.group({

        locationId: [
          null,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        facilityName: [
          '',
          trimmedFacilityNameValidator
        ],

        facilityType: [
          null
        ],

        capacity: [
          null,
          optionalPositiveIntegerValidator
        ],

        hourlyRate: [
          null,
          optionalNonNegativeNumberValidator
        ],

        amenities: [
          ''
        ],

        isBookable: [
          true
        ],

        isActive: [
          true
        ]

      });


    this.bookingForm =
      this.formBuilder.group({

        facilityId: [
          null,
          Validators.required
        ],

        memberId: [
          null
        ],

        bookingDate: [
          '',
          Validators.required
        ],

        startTime: [
          '',
          Validators.required
        ],

        endTime: [
          '',
          Validators.required
        ],

        purpose: [
          '',
          Validators.maxLength(255)
        ],

        numberOfPeople: [
          1,
          Validators.min(1)
        ],

        paymentStatus: [
          'pending',
          Validators.required
        ],

        amount: [
          0,
          optionalNonNegativeNumberValidator
        ]

      }, {
        validators: bookingTimeRangeValidator
      });


    this.cleaningForm =
      this.formBuilder.group({

        locationId: [
          null,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        areaName: [
          '',
          requiredTrimmedTextValidator(200)
        ],

        cleaningType: [
          null
        ],

        frequency: [
          ''
        ],

        assignedTo: [
          null
        ],

        lastCleanedDate: [
          null
        ],

        nextCleaningDate: [
          null
        ],

        isActive: [
          true
        ]

      }, {
        validators: cleaningDateOrderValidator
      });


    this.maintenanceForm =
      this.formBuilder.group({

        locationId: [
          null,
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        requestType: [
          null
        ],

        priority: [
          'medium'
        ],

        areaLocation: [
          ''
        ],

        description: [
          '',
          requiredTrimmedTextValidator(2000)
        ],

        assignedTo: [
          null
        ],

        cost: [
          null,
          optionalNonNegativeNumberValidator
        ],

        notes: [
          '',
          Validators.maxLength(1000)
        ]

      });

  }


  ngOnInit(): void {


    this.route.data.subscribe(
      data => {

        this.activePage =
          data['facilityPage'] ??
          'facilities';

        this.clearFilters();

      }
    );


    this.locations =
      this.locationService
        .getLocations(
          this.tenantId
        );


    this.members =
      this.memberService
        .getMembersSnapshot();


    this.employees =
      this.facilityService
        .getEmployees();


    this.facilityService
      .facilities$
      .subscribe(
        value =>
          this.facilities =
            value
      );


    this.facilityService
      .bookings$
      .subscribe(
        value =>
          this.bookings =
            value
      );


    this.facilityService
      .cleaningSchedules$
      .subscribe(
        value =>
          this.cleaningSchedules =
            value
      );


    this.facilityService
      .maintenanceRequests$
      .subscribe(
        value =>
          this.maintenanceRequests =
            value
      );

  }


  get filteredFacilities():
    Facility[] {

    return this.facilities.filter(
      facility => {


        const q =
          this.search
            .trim()
            .toLowerCase();


        return (

          (
            !q ||

            facility.facilityName
              .toLowerCase()
              .includes(q)
          ) &&

          (
            this.selectedLocation ===
              null ||

            facility.locationId ===
              this.selectedLocation
          ) &&

          (
            !this.selectedType ||

            facility.facilityType ===
              this.selectedType
          ) &&

          (
            !this.selectedStatus ||

            (
              this.selectedStatus ===
                'active' &&
              facility.isActive
            ) ||

            (
              this.selectedStatus ===
                'inactive' &&
              !facility.isActive
            )
          )

        );

      }
    );

  }


  get filteredBookings():
    FacilityBooking[] {

    const q =
      this.search
        .trim()
        .toLowerCase();


    return this.bookings.filter(
      booking => {


        const facility =
          this.getFacility(
            booking.facilityId
          );


        const member =
          booking.memberId
            ? this.memberService
                .getMemberById(
                  booking.memberId
                )
            : undefined;


        const searchable =
          [
            facility?.facilityName,
            member?.firstName,
            member?.lastName,
            booking.purpose
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();


        return (

          (
            !q ||
            searchable.includes(q)
          ) &&

          (
            this.selectedLocation ===
              null ||

            facility?.locationId ===
              this.selectedLocation
          ) &&

          (
            !this.selectedStatus ||

            booking.status ===
              this.selectedStatus
          )

        );

      }
    );

  }


  get filteredCleaning():
    CleaningSchedule[] {

    const q =
      this.search
        .trim()
        .toLowerCase();


    return this.cleaningSchedules.filter(
      schedule =>

        (
          !q ||

          schedule.areaName
            .toLowerCase()
            .includes(q)
        ) &&

        (
          this.selectedLocation ===
            null ||

          schedule.locationId ===
            this.selectedLocation
        ) &&

        (
          !this.selectedType ||

          schedule.cleaningType ===
            this.selectedType
        )

    );

  }


  get filteredMaintenance():
    MaintenanceRequest[] {

    const q =
      this.search
        .trim()
        .toLowerCase();


    return this.maintenanceRequests.filter(
      request =>

        (
          !q ||

          request.description
            .toLowerCase()
            .includes(q) ||

          (
            request.areaLocation ??
            ''
          )
            .toLowerCase()
            .includes(q)
        ) &&

        (
          this.selectedLocation ===
            null ||

          request.locationId ===
            this.selectedLocation
        ) &&

        (
          !this.selectedType ||

          request.requestType ===
            this.selectedType
        ) &&

        (
          !this.selectedStatus ||

          request.status ===
            this.selectedStatus
        )

    );

  }


  openFacilityModal(): void {

    this.errorMessage =
      '';

    this.editingFacilityId =
      null;

    this.facilityForm.reset({

      locationId:
        null,

      facilityName:
        '',

      facilityType:
        null,

      capacity:
        null,

      hourlyRate:
        null,

      amenities:
        '',

      isBookable:
        true,

      isActive:
        true

    });


    this.modal =
      'facility';

  }


  editFacility(facility: Facility): void {

    this.errorMessage = '';
    this.editingFacilityId = facility.facilityId;
    this.facilityForm.reset({
      locationId: facility.locationId,
      facilityName: facility.facilityName,
      facilityType: facility.facilityType ?? null,
      capacity: facility.capacity ?? null,
      hourlyRate: facility.hourlyRate ?? null,
      amenities: this.getAmenities(facility).join(', '),
      isBookable: facility.isBookable,
      isActive: facility.isActive
    });

    this.modal = 'facility';

  }


  deleteFacility(facility: Facility): void {

    this.deleteConfirmation = {
      kind: 'facility',
      id: facility.facilityId,
      label: `facility "${facility.facilityName}"`
    };

  }


  hasFacilityError(
    controlName: string,
    errorName: string
  ): boolean {
    const control = this.facilityForm.get(controlName);
    return Boolean(
      control?.touched && control.hasError(errorName)
    );
  }


  hasFormError(
    form: FormGroup,
    controlName: string,
    errorName: string
  ): boolean {
    const control = form.get(controlName);
    return Boolean(
      control?.touched && control.hasError(errorName)
    );
  }


  openBookingModal(): void {

    this.errorMessage =
      '';

    this.editingBookingId = null;

    this.bookingForm.reset({

      facilityId:
        null,

      memberId:
        null,

      bookingDate:
        '',

      startTime:
        '',

      endTime:
        '',

      purpose:
        '',

      numberOfPeople:
        1,

      paymentStatus:
        'pending',

      amount:
        0

    });


    this.modal =
      'booking';

  }


  editBooking(booking: FacilityBooking): void {

    this.errorMessage = '';
    this.editingBookingId = booking.bookingId;
    this.bookingForm.reset({
      facilityId: booking.facilityId,
      memberId: booking.memberId ?? null,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose ?? '',
      numberOfPeople: booking.numberOfPeople ?? null,
      paymentStatus: booking.paymentStatus,
      amount: booking.amount ?? 0
    });

    this.modal = 'booking';

  }


  openCleaningModal(): void {

    this.errorMessage =
      '';

    this.editingCleaningScheduleId = null;

    this.cleaningForm.reset({

      locationId:
        null,

      areaName:
        '',

      cleaningType:
        null,

      frequency:
        '',

      assignedTo:
        null,

      lastCleanedDate:
        null,

      nextCleaningDate:
        null,

      isActive:
        true

    });


    this.modal =
      'cleaning';

  }


  editCleaningSchedule(schedule: CleaningSchedule): void {

    this.errorMessage = '';
    this.editingCleaningScheduleId = schedule.scheduleId;
    this.cleaningForm.reset({
      locationId: schedule.locationId,
      areaName: schedule.areaName,
      cleaningType: schedule.cleaningType ?? null,
      frequency: schedule.frequency ?? '',
      assignedTo: schedule.assignedTo ?? null,
      lastCleanedDate: this.toDateTimeLocal(schedule.lastCleanedDate),
      nextCleaningDate: this.toDateTimeLocal(schedule.nextCleaningDate),
      isActive: schedule.isActive
    });

    this.modal = 'cleaning';

  }


  openMaintenanceModal(): void {

    this.errorMessage =
      '';

    this.editingMaintenanceRequestId = null;

    this.maintenanceForm.reset({

      locationId:
        null,

      requestType:
        null,

      priority:
        'medium',

      areaLocation:
        '',

      description:
        '',

      assignedTo:
        null,

      cost:
        null,

      notes:
        ''

    });


    this.modal =
      'maintenance';

  }


  editMaintenanceRequest(request: MaintenanceRequest): void {

    this.errorMessage = '';
    this.editingMaintenanceRequestId = request.requestId;
    this.maintenanceForm.reset({
      locationId: request.locationId,
      requestType: request.requestType ?? null,
      priority: request.priority,
      areaLocation: request.areaLocation ?? '',
      description: request.description,
      assignedTo: request.assignedTo ?? null,
      cost: request.cost ?? null,
      notes: request.notes ?? ''
    });

    this.modal = 'maintenance';

  }


  deleteBooking(booking: FacilityBooking): void {

    this.deleteConfirmation = {
      kind: 'booking',
      id: booking.bookingId,
      label: `booking #${booking.bookingId}`
    };

  }


  deleteCleaningSchedule(schedule: CleaningSchedule): void {

    this.deleteConfirmation = {
      kind: 'cleaning',
      id: schedule.scheduleId,
      label: `cleaning schedule for "${schedule.areaName}"`
    };

  }


  deleteMaintenanceRequest(request: MaintenanceRequest): void {

    this.deleteConfirmation = {
      kind: 'maintenance',
      id: request.requestId,
      label: `maintenance request #${request.requestId}`
    };

  }


  confirmDelete(): void {

    const confirmation = this.deleteConfirmation;
    if (!confirmation) {
      return;
    }

    switch (confirmation.kind) {
      case 'facility':
        this.facilityService.deleteFacility(confirmation.id);
        break;
      case 'booking':
        this.facilityService.deleteBooking(confirmation.id);
        break;
      case 'cleaning':
        this.facilityService.deleteCleaningSchedule(confirmation.id);
        break;
      case 'maintenance':
        this.facilityService.deleteMaintenanceRequest(confirmation.id);
        break;
    }

    this.deleteConfirmation = null;

  }


  cancelDelete(): void {

    this.deleteConfirmation = null;

  }


  closeModal(): void {

    this.modal =
      null;

    this.editingFacilityId =
      null;

    this.editingBookingId = null;
    this.editingCleaningScheduleId = null;
    this.editingMaintenanceRequestId = null;

    this.errorMessage =
      '';

  }


  saveFacility(): void {

    if (
      this.facilityForm.invalid
    ) {

      this.facilityForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.facilityForm
        .getRawValue();


    const amenities =
      String(
        value.amenities ??
        ''
      )
        .split(',')
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean);


    const facilityData = {

        locationId:
          Number(
            value.locationId
          ),

        facilityName:
          String(
            value.facilityName
          ).trim(),

        facilityType:
          value.facilityType as
            FacilityType | null,

        capacity:
          value.capacity
            ? Number(
                value.capacity
              )
            : null,

        hourlyRate:
          value.hourlyRate !==
            null &&
          value.hourlyRate !==
            ''

            ? Number(
                value.hourlyRate
              )

            : null,

        amenities:
          JSON.stringify(
            amenities
          ),

        isBookable:
          Boolean(
            value.isBookable
          ),

        isActive:
          Boolean(
            value.isActive
          )

      };

    if (this.editingFacilityId !== null) {
      this.facilityService.updateFacility(
        this.editingFacilityId,
        facilityData
      );
    } else {
      this.facilityService.addFacility(facilityData);
    }


    this.closeModal();

  }


  saveBooking(): void {

    if (
      this.bookingForm.invalid
    ) {

      this.bookingForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.bookingForm
        .getRawValue();


    const bookingData = {

          facilityId:
            Number(
              value.facilityId
            ),

          memberId:
            value.memberId
              ? Number(
                  value.memberId
                )
              : null,

          bookingDate:
            value.bookingDate,

          startTime:
            value.startTime,

          endTime:
            value.endTime,

          purpose:
            value.purpose ||
            null,

          paymentStatus:
            value.paymentStatus,

          amount:
            Number(
              value.amount ??
              0
            ),

    };

    try {
      if (this.editingBookingId !== null) {
        this.facilityService.updateBooking(
          this.editingBookingId,
          {
            ...bookingData,
            numberOfPeople: value.numberOfPeople === null || value.numberOfPeople === ''
              ? null
              : Number(value.numberOfPeople)
          }
        );
      } else {
        this.facilityService.addBooking({
          ...bookingData,
          numberOfPeople: value.numberOfPeople === null || value.numberOfPeople === ''
            ? null
            : Number(value.numberOfPeople),
          status: 'confirmed',
          cancellationDate: null
        });
      }

      this.closeModal();
    } catch (error) {

      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to create booking.';

    }

  }


  saveCleaning(): void {

    if (
      this.cleaningForm.invalid
    ) {

      this.cleaningForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.cleaningForm
        .getRawValue();


    const scheduleData = {

        locationId:
          Number(
            value.locationId
          ),

        areaName:
          String(
            value.areaName
          ).trim(),

        cleaningType:
          value.cleaningType,

        frequency:
          value.frequency ||
          null,

        assignedTo:
          value.assignedTo
            ? Number(
                value.assignedTo
              )
            : null,

        lastCleanedDate:
          value.lastCleanedDate ||
          null,

        nextCleaningDate:
          value.nextCleaningDate ||
          null,

        isActive:
          Boolean(
            value.isActive
          )

      };

    if (this.editingCleaningScheduleId !== null) {
      this.facilityService.updateCleaningSchedule(
        this.editingCleaningScheduleId,
        scheduleData
      );
    } else {
      this.facilityService.addCleaningSchedule(scheduleData);
    }


    this.closeModal();

  }


  saveMaintenance(): void {

    if (
      this.maintenanceForm.invalid
    ) {

      this.maintenanceForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.maintenanceForm
        .getRawValue();


    const requestData = {

        locationId:
          Number(
            value.locationId
          ),

        requestType:
          value.requestType,

        priority:
          value.priority,

        areaLocation:
          value.areaLocation ||
          null,

        description: String(value.description).trim(),

        assignedTo:
          value.assignedTo
            ? Number(
                value.assignedTo
              )
            : null,

        cost:
          value.cost !==
            null &&
          value.cost !==
            ''

            ? Number(
                value.cost
              )

            : null,

        notes:
          value.notes ||
          null

      };

    if (this.editingMaintenanceRequestId !== null) {
      this.facilityService.updateMaintenanceRequest(
        this.editingMaintenanceRequestId,
        requestData
      );
    } else {
      const now = new Date().toISOString();
      this.facilityService.addMaintenanceRequest({
        ...requestData,
        tenantId: this.tenantId,
        reportedBy: 1,
        status: 'open',
        reportedDate: now,
        completedDate: null
      });
    }


    this.closeModal();

  }


  getFacility(
    id: number
  ): Facility | undefined {

    return this.facilities.find(
      facility =>
        facility.facilityId === id
    );

  }


  getLocationName(
    id: number
  ): string {

    return (
      this.locationService
        .getLocationById(id)
        ?.locationName ??
      '-'
    );

  }


  getMemberName(
    memberId?:
      number | null
  ): string {

    if (!memberId) {

      return 'Guest / Internal';

    }


    const member =
      this.memberService
        .getMemberById(
          memberId
        );


    return member
      ? `${member.firstName} ${member.lastName}`
      : '-';

  }


  getEmployeeName(
    employeeId?:
      number | null
  ): string {

    if (!employeeId) {
      return '-';
    }


    return (
      this.employees.find(
        employee =>
          employee.employeeId ===
          employeeId
      )?.employeeName ??
      '-'
    );

  }


  getAmenities(
    facility: Facility
  ): string[] {

    try {

      return facility.amenities
        ? JSON.parse(
            facility.amenities
          )
        : [];

    } catch {

      return [];

    }

  }


  private toDateTimeLocal(value?: string | null): string | null {
    return value ? value.slice(0, 16) : null;
  }


  clearFilters(): void {

    this.search =
      '';

    this.selectedLocation =
      null;

    this.selectedType =
      '';

    this.selectedStatus =
      '';

  }


  completeBooking(
    booking: FacilityBooking
  ): void {

    this.facilityService
      .setBookingStatus(
        booking.bookingId,
        'completed'
      );

  }


  cancelBooking(
    booking: FacilityBooking
  ): void {

    this.facilityService
      .setBookingStatus(
        booking.bookingId,
        'cancelled'
      );

  }


  completeMaintenance(
    request: MaintenanceRequest
  ): void {

    this.facilityService
      .updateMaintenanceStatus(
        request.requestId,
        'completed'
      );

  }


  startMaintenance(
    request: MaintenanceRequest
  ): void {

    this.facilityService
      .updateMaintenanceStatus(
        request.requestId,
        'in_progress'
      );

  }

}