import { Component } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

interface MemberData {
  [key: string]: string;
}

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './member-details.html',
  styleUrl: './member-details.scss'
})
export class MemberDetailsComponent {

  memberId!: number;

  memberForm: FormGroup;
  savedMember: MemberData;
  isEditMode = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute
  ) {

    this.memberForm = this.fb.group({

      memberCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9_-]+$/)
        ]
      ],

      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      dateOfBirth: [
        '',
        [this.validateDateOfBirth]
      ],

      gender: [
        '',
        [Validators.maxLength(20)]
      ],

      bloodGroup: [
        '',
        [Validators.maxLength(10)]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+?[0-9\s()-]{10,20}$/)
        ]
      ],

      alternatePhone: [
        '',
        [
          Validators.pattern(/^\+?[0-9\s()-]{10,20}$/)
        ]
      ],

      email: [
        '',
        [
          Validators.email,
          Validators.maxLength(100)
        ]
      ],

      addressLine1: [
        '',
        [Validators.maxLength(255)]
      ],

      addressLine2: [
        '',
        [Validators.maxLength(255)]
      ],

      city: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      state: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      country: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      postalCode: [
        '',
        [
          Validators.pattern(/^[0-9A-Za-z\s-]{3,20}$/)
        ]
      ],

      emergencyContactName: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],

      emergencyContactPhone: [
        '',
        [
          Validators.pattern(/^\+?[0-9\s()-]{10,20}$/)
        ]
      ],

      idProofType: [
        '',
        [Validators.maxLength(50)]
      ],

      idProofNumber: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[A-Za-z0-9\s./-]+$/)
        ]
      ],

      idProofUrl: [''],

      medicalConditions: [
        '',
        [Validators.maxLength(1000)]
      ],

      referralSource: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9\s'-]+$/)
        ]
      ],

      referredByMemberId: [
        '',
        [Validators.pattern(/^[0-9]+$/)]
      ],

      status: [
        'active',
        [
          Validators.required,
          Validators.pattern(/^(active|inactive|suspended|expired)$/)
        ]
      ]
    });

    this.savedMember = {

      memberCode: 'MEM-0001',

      firstName: 'John',

      lastName: 'Doe',

      dateOfBirth: '1992-06-15',

      gender: 'male',

      bloodGroup: 'O+',

      phone: '+1 555 010 2040',

      alternatePhone: '',

      email: 'john.doe@example.com',

      addressLine1: '24 Market Street',

      addressLine2: 'Downtown',

      city: 'Austin',

      state: 'Texas',

      country: 'United States',

      postalCode: '78701',

      emergencyContactName: 'Jane Doe',

      emergencyContactPhone: '+1 555 010 2041',

      idProofType: 'driving-license',

      idProofNumber: 'DL-4528910',

      idProofUrl: 'drivers-license.pdf',

      medicalConditions: 'No known conditions',

      referralSource: 'member-referral',

      referredByMemberId: '7',

      status: 'active'
    };

    this.memberForm.reset(this.savedMember);
    this.memberForm.markAsPristine();
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('Member ID was not provided in the route.');
      return;
    }

    this.memberId = Number(id);

    if (Number.isNaN(this.memberId)) {
      console.error('Invalid member ID:', id);
      return;
    }

    console.log('Member ID received:', this.memberId);

    this.loadMember(this.memberId);

    if (this.route.snapshot.queryParamMap.get('mode') === 'edit') {
      this.startEditing();
    }
  }

  private loadMember(id: number): void {

    console.log('Loading member:', id);

    /*
     * Temporary implementation.
     *
     * Later we will replace this with:
     *
     * this.memberService.getMemberById(id)
     *
     * and populate savedMember from the API response.
     */
  }

  get isSaveDisabled(): boolean {
    return this.memberForm.invalid || !this.memberForm.dirty;
  }

  get memberName(): string {
    return `${this.savedMember['firstName']} ${this.savedMember['lastName']}`;
  }

  get memberInitials(): string {
    return `${this.savedMember['firstName'][0]}${this.savedMember['lastName'][0]}`;
  }

  get memberSince(): string {
    return 'January 2026';
  }

  startEditing(): void {

    this.memberForm.reset(this.savedMember);

    this.memberForm.markAsPristine();

    this.isEditMode = true;
  }

  displayValue(controlName: string): string {

    const value = this.savedMember[controlName];

    if (!value) {
      return 'Not provided';
    }

    return value;
  }

  optionLabel(controlName: string): string {

    const labels: Record<string, Record<string, string>> = {

      gender: {
        male: 'Male',
        female: 'Female',
        other: 'Other'
      },

      bloodGroup: {
        'A+': 'A+',
        'A-': 'A-',
        'B+': 'B+',
        'B-': 'B-',
        'AB+': 'AB+',
        'AB-': 'AB-',
        'O+': 'O+',
        'O-': 'O-'
      },

      idProofType: {
        aadhaar: 'Aadhaar',
        pan: 'PAN',
        passport: 'Passport',
        'driving-license': 'Driving License',
        'voter-id': 'Voter ID'
      },

      referralSource: {
        'walk-in': 'Walk-in',
        website: 'Website',
        'social-media': 'Social Media',
        'member-referral': 'Member Referral',
        advertisement: 'Advertisement',
        other: 'Other'
      }
    };

    return labels[controlName]?.[this.savedMember[controlName]]
      ?? this.displayValue(controlName);
  }

  formatDate(value: string): string {

    if (!value) {
      return 'Not provided';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }

  hasError(controlName: string, errorName: string): boolean {

    const control = this.memberForm.controls[controlName];

    return control.touched && control.hasError(errorName);
  }

  saveMember(): void {

    if (this.memberForm.invalid) {

      this.memberForm.markAllAsTouched();

      this.memberForm.updateValueAndValidity();

      return;
    }

    this.savedMember = {
      ...this.memberForm.getRawValue()
    };

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  cancel(): void {

    this.memberForm.reset(this.savedMember);

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  private validateDateOfBirth(
    control: { value: string }
  ): ValidationErrors | null {

    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);

    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);

    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {

      return {
        futureDate: true
      };
    }

    return null;
  }
}
