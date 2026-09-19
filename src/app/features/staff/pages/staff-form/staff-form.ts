import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Staff, StaffService } from '../../services/staff.service';

type NewStaff = Omit<Staff, 'staffId' | 'staffCode'>;

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.scss'
})
export class StaffFormComponent implements OnInit {

  readonly staffForm;

  readonly roles: Staff['role'][] = [
    'Trainer',
    'Manager',
    'Receptionist',
    'Accountant',
    'Support'
  ];

  readonly statuses: Staff['status'][] = [
    'Active',
    'On Leave',
    'Inactive'
  ];

  editingStaffId: number | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly staffService: StaffService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.staffForm = this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60)
        ]
      ],

      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60)
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(PHONE_PATTERN),
          this.phoneLengthValidator
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      // IMPORTANT:
      // Empty in Add mode so user must select it.
      role: [
        '',
        Validators.required
      ],

      specialization: [
        ''
      ],

      // IMPORTANT:
      // Empty in Add mode so user must enter it.
      location: [
        '',
        Validators.required
      ],

      // IMPORTANT:
      // Empty in Add mode so user must select it.
      joinedDate: [
        '',
        Validators.required
      ],

      // IMPORTANT:
      // Empty in Add mode so user must select it.
      status: [
        '',
        Validators.required
      ],

      salary: [
        null as number | null
      ]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    // Add Staff mode
    if (!idParam) {
      return;
    }

    // Edit Staff mode
    const staffId = Number(idParam);

    if (Number.isNaN(staffId)) {
      return;
    }

    const existing = this.staffService.getStaffById(staffId);

    if (!existing) {
      return;
    }

    this.editingStaffId = staffId;

    this.staffForm.patchValue({
      firstName: existing.firstName,
      lastName: existing.lastName,
      phone: existing.phone,
      email: existing.email,
      role: existing.role,
      specialization: existing.specialization ?? '',
      location: existing.location,
      joinedDate: existing.joinedDate,
      status: existing.status,
      salary: existing.salary ?? null
    });
  }

  get isEditMode(): boolean {
    return this.editingStaffId !== null;
  }

  get canSave(): boolean {
    return this.staffForm.valid;
  }

  saveStaff(): void {
    if (!this.canSave) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const value = this.staffForm.getRawValue();

    const staffData: NewStaff = {
      firstName: value.firstName?.trim() ?? '',
      lastName: value.lastName?.trim() ?? '',
      phone: value.phone?.trim() ?? '',
      email: value.email?.trim() ?? '',
      role: value.role as Staff['role'],
      specialization: value.specialization?.trim() || undefined,
      location: value.location?.trim() ?? '',
      joinedDate: value.joinedDate ?? '',
      status: value.status as Staff['status'],
      salary: this.parseSalary(value.salary)
    };

    if (
      this.isEditMode &&
      this.editingStaffId !== null
    ) {
      this.staffService.updateStaff(
        this.editingStaffId,
        staffData
      );
    } else {
      this.staffService.addStaff(staffData);
    }

    this.router.navigate(['/staff']);
  }

  hasError(controlName: string): boolean {
    const control =
      this.staffForm.controls[
        controlName as keyof typeof this.staffForm.controls
      ];

    return control.touched && control.invalid;
  }

  private phoneLengthValidator(
    control: { value: unknown }
  ): { phoneLength: true } | null {
    if (!control.value) {
      return null;
    }

    const digits =
      String(control.value)
        .replace(/\D/g, '')
        .length;

    return digits >= 10 && digits <= 15
      ? null
      : { phoneLength: true };
  }

  private parseSalary(
    value: number | null
  ): number | undefined {
    if (
      value === null ||
      value === undefined
    ) {
      return undefined;
    }

    const trimmed =
      String(value).trim();

    if (trimmed === '') {
      return undefined;
    }

    const parsed = Number(trimmed);

    return Number.isNaN(parsed)
      ? undefined
      : parsed;
  }
}