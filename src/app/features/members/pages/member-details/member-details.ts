
import { Component } from '@angular/core';

import { TitleCasePipe } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  MemberRecord,
  MemberService,
  UpdateMember
} from '../../services/member.service';

interface MemberData {
  [key: string]: string;
}

const NAME_PATTERN = /^[\p{L}\p{M}\s'.-]+$/u;

const PHONE_PATTERN = /^\+?[0-9\s()-]+$/;

const LOCATION_NAME_PATTERN = /^[\p{L}\p{M}\s'.-]+$/u;

const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png'
]);

const MAX_ID_PROOF_FILE_SIZE = 5 * 1024 * 1024;

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    RouterLink
  ],
  templateUrl: './member-details.html',
  styleUrl: './member-details.scss'
})
export class MemberDetailsComponent {

  memberId!: number;

  memberForm: FormGroup;

  savedMember: MemberData = {};

  isEditMode = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly memberService: MemberService
  ) {

    // =======================================================
    // EXISTING FORM + VALIDATIONS
    // =======================================================

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
          Validators.pattern(NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      dateOfBirth: [
        '',
        [
          this.validateDateOfBirth
        ]
      ],

      gender: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern(/^(male|female|other)$/)
        ]
      ],

      bloodGroup: [
        '',
        [
          Validators.maxLength(10),
          Validators.pattern(/^(A|B|AB|O)[+-]$/)
        ]
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(PHONE_PATTERN),
          this.validatePhoneLength
        ]
      ],

      alternatePhone: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern(PHONE_PATTERN),
          this.validatePhoneLength
        ]
      ],

      email: [
        '',
        [
          Validators.email,
          Validators.maxLength(100),
          Validators.pattern(
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
          )
        ]
      ],

      addressLine1: [
        '',
        [
          Validators.maxLength(255),
          this.validateNotWhitespaceOnly
        ]
      ],

      addressLine2: [
        '',
        [
          Validators.maxLength(255),
          this.validateNotWhitespaceOnly
        ]
      ],

      city: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(LOCATION_NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      state: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(LOCATION_NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      country: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(LOCATION_NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      postalCode: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern(
            /^[0-9A-Za-z\s-]{3,20}$/
          ),
          this.validateNotWhitespaceOnly
        ]
      ],

      emergencyContactName: [
        '',
        [
          Validators.maxLength(100),
          Validators.minLength(2),
          Validators.pattern(NAME_PATTERN),
          this.validateNotWhitespaceOnly
        ]
      ],

      emergencyContactPhone: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern(PHONE_PATTERN),
          this.validatePhoneLength
        ]
      ],

      idProofType: [
        '',
        [
          Validators.maxLength(50),
          Validators.pattern(
            /^(aadhaar|pan|passport|driving-license|voter-id)$/
          )
        ]
      ],

      idProofNumber: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[A-Za-z0-9\s./-]+$/
          ),
          this.validateNotWhitespaceOnly
        ]
      ],

      idProofUrl: [
        ''
      ],

      medicalConditions: [
        '',
        [
          Validators.maxLength(1000),
          this.validateNotWhitespaceOnly
        ]
      ],

      referralSource: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^(walk-in|website|social-media|member-referral|advertisement|other)$/
          )
        ]
      ],

      referredByMemberId: [
        '',
        [
          Validators.pattern(
            /^[0-9]+$/
          )
        ]
      ],

      status: [
        'active',
        [
          Validators.required,
          Validators.pattern(
            /^(active|expiring|inactive|suspended|expired)$/
          )
        ]
      ]

    }, {

      validators: [
        this.validateDifferentPhoneNumbers,
        this.validateIdProofDetails,
        control => this.validateReferralDetails(control)
      ]

    });

    // Re-run dependent validation when phone changes.
    this.memberForm.controls['phone']
      .valueChanges
      .subscribe(() => {

        this.memberForm.controls['alternatePhone']
          .updateValueAndValidity({
            emitEvent: false
          });

        this.memberForm.controls['emergencyContactPhone']
          .updateValueAndValidity({
            emitEvent: false
          });
      });
  }

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {

        console.error(
          'Member ID was not provided in the route.'
        );

        this.savedMember = {};

        return;
      }

      const numericId = Number(id);

      if (Number.isNaN(numericId)) {

        console.error(
          'Invalid member ID:',
          id
        );

        this.savedMember = {};

        return;
      }

      this.memberId = numericId;

      this.loadMember(this.memberId);

      // Preserve existing edit-mode query parameter.
      if (
        this.route.snapshot
          .queryParamMap
          .get('mode') === 'edit'
      ) {
        this.startEditing();
      }

    });
  }

  // =========================================================
  // LOAD MEMBER FROM CENTRALIZED SERVICE
  // =========================================================

  private loadMember(id: number): void {

    const selectedMember =
      this.memberService.getMemberById(id);

    if (!selectedMember) {

      console.error(
        'Member not found:',
        id
      );

      this.savedMember = {};

      this.memberForm.reset();

      this.memberForm.markAsPristine();

      this.isEditMode = false;

      return;
    }

    this.savedMember =
      this.toMemberData(selectedMember);

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  // =========================================================
  // CONVERT SERVICE MEMBER TO FORM/DISPLAY DATA
  // =========================================================

  private toMemberData(
    member: MemberRecord
  ): MemberData {

    const data: MemberData = {};

    Object.entries(member).forEach(
      ([key, value]) => {

        if (value !== undefined && value !== null) {

          data[key] = String(value);
        } else {

          data[key] = '';
        }
      }
    );

    // The form uses lowercase status values,
    // while MemberService uses the MemberStatus type
    // with title-case values.
    data['status'] =
      member.status.toLowerCase();

    return data;
  }

  // =========================================================
  // SAVE BUTTON STATE
  // =========================================================

  get isSaveDisabled(): boolean {

    return (
      this.memberForm.invalid ||
      !this.memberForm.dirty
    );
  }

  // =========================================================
  // LATEST DATE ALLOWED FOR 18+ MEMBER
  // =========================================================

  get maxDateOfBirth(): string {

    const today = new Date();

    const latestDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    return this.toDateInputValue(
      latestDate
    );
  }

  // =========================================================
  // MEMBER NAME
  // =========================================================

  get memberName(): string {

    const firstName =
      this.savedMember['firstName'] ?? '';

    const lastName =
      this.savedMember['lastName'] ?? '';

    return `${firstName} ${lastName}`.trim();
  }

  // =========================================================
  // MEMBER INITIALS
  // =========================================================

  get memberInitials(): string {

    const firstName =
      this.savedMember['firstName'] ?? '';

    const lastName =
      this.savedMember['lastName'] ?? '';

    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`
    ).toUpperCase();
  }

  // =========================================================
  // MEMBER SINCE
  // =========================================================

  get memberSince(): string {

    const joinDate =
      this.savedMember['joinDate'];

    if (!joinDate) {
      return 'Not provided';
    }

    const date =
      new Date(`${joinDate}T00:00:00`);

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    ).format(date);
  }

  // =========================================================
  // START EDITING
  // =========================================================

  startEditing(): void {

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = true;
  }

  // =========================================================
  // DISPLAY VALUE
  // =========================================================

  displayValue(
    controlName: string
  ): string {

    const value =
      this.savedMember[controlName];

    if (!value) {
      return 'Not provided';
    }

    return value;
  }

  // =========================================================
  // OPTION LABEL
  // =========================================================

  optionLabel(
    controlName: string
  ): string {

    const labels:
      Record<
        string,
        Record<string, string>
      > = {

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

    return (
      labels[controlName]?.[
        this.savedMember[controlName]
      ]
      ??
      this.displayValue(controlName)
    );
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  formatDate(
    value: string
  ): string {

    if (!value) {
      return 'Not provided';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    ).format(
      new Date(
        `${value}T00:00:00`
      )
    );
  }

  // =========================================================
  // VALIDATION ERROR HELPER
  // =========================================================

  hasError(
    controlName: string,
    errorName: string
  ): boolean {

    const control =
      this.memberForm.controls[controlName];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  // =========================================================
  // SAVE MEMBER THROUGH CENTRALIZED SERVICE
  // =========================================================

  saveMember(): void {

    if (this.memberForm.invalid) {

      this.memberForm.markAllAsTouched();

      this.memberForm.updateValueAndValidity();

      return;
    }

    const rawValues =
      this.memberForm.getRawValue();

    const normalizedValues:
      Record<string, unknown> = {};

    Object.entries(rawValues).forEach(
      ([key, value]) => {

        normalizedValues[key] =
          typeof value === 'string'
            ? value.trim()
            : value;
      }
    );

    /*
     * Convert the form's lowercase status
     * to MemberStatus used by MemberService.
     */
    const normalizedStatus =
      this.toMemberStatus(
        String(
          normalizedValues['status'] ?? 'active'
        )
      );

    const updateData:
      UpdateMember = {

      memberCode:
        this.stringValue(
          normalizedValues['memberCode']
        ),

      firstName:
        this.stringValue(
          normalizedValues['firstName']
        ),

      lastName:
        this.stringValue(
          normalizedValues['lastName']
        ),

      dateOfBirth:
        this.optionalStringValue(
          normalizedValues['dateOfBirth']
        ),

      gender:
        this.optionalStringValue(
          normalizedValues['gender']
        ),

      bloodGroup:
        this.optionalStringValue(
          normalizedValues['bloodGroup']
        ),

      phone:
        this.stringValue(
          normalizedValues['phone']
        ),

      alternatePhone:
        this.optionalStringValue(
          normalizedValues['alternatePhone']
        ),

      email:
        this.optionalStringValue(
          normalizedValues['email']
        ),

      addressLine1:
        this.optionalStringValue(
          normalizedValues['addressLine1']
        ),

      addressLine2:
        this.optionalStringValue(
          normalizedValues['addressLine2']
        ),

      city:
        this.optionalStringValue(
          normalizedValues['city']
        ),

      state:
        this.optionalStringValue(
          normalizedValues['state']
        ),

      country:
        this.optionalStringValue(
          normalizedValues['country']
        ),

      postalCode:
        this.optionalStringValue(
          normalizedValues['postalCode']
        ),

      emergencyContactName:
        this.optionalStringValue(
          normalizedValues['emergencyContactName']
        ),

      emergencyContactPhone:
        this.optionalStringValue(
          normalizedValues['emergencyContactPhone']
        ),

      idProofType:
        this.optionalStringValue(
          normalizedValues['idProofType']
        ),

      idProofNumber:
        this.optionalStringValue(
          normalizedValues['idProofNumber']
        ),

      idProofUrl:
        this.optionalStringValue(
          normalizedValues['idProofUrl']
        ),

      medicalConditions:
        this.optionalStringValue(
          normalizedValues['medicalConditions']
        ),

      referralSource:
        this.optionalStringValue(
          normalizedValues['referralSource']
        ),

      referredByMemberId:
        this.optionalStringValue(
          normalizedValues['referredByMemberId']
        ),

      status: normalizedStatus
    };

    const updatedMember =
      this.memberService.updateMember(
        this.memberId,
        updateData
      );

    if (!updatedMember) {

      console.error(
        'Unable to update member:',
        this.memberId
      );

      return;
    }

    /*
     * Reload the saved member from the service.
     *
     * This is important because the service is now
     * the single source of truth.
     */
    this.savedMember =
      this.toMemberData(updatedMember);

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = false;

    console.log(
      'Updated member through MemberService:',
      updatedMember
    );
  }

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  cancel(): void {

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  // =========================================================
  // ID PROOF FILE VALIDATION
  // =========================================================

  onIdProofFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const control =
      this.memberForm.controls['idProofUrl'];

    const file =
      input.files?.[0];

    control.markAsTouched();

    control.markAsDirty();

    if (!file) {

      control.setValue('');

      control.setErrors(null);

      return;
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {

      control.setValue('');

      control.setErrors({
        invalidFileType: true
      });

      input.value = '';

      return;
    }

    if (
      file.size >
      MAX_ID_PROOF_FILE_SIZE
    ) {

      control.setValue('');

      control.setErrors({
        fileTooLarge: true
      });

      input.value = '';

      return;
    }

    control.setErrors(null);

    control.setValue(file.name);
  }

  // =========================================================
  // GENERAL CUSTOM VALIDATORS
  // =========================================================

  private validateNotWhitespaceOnly(
    control: AbstractControl
  ): ValidationErrors | null {

    const value =
      String(control.value ?? '');

    return (
      value.length > 0 &&
      value.trim().length === 0
    )
      ? {
          whitespaceOnly: true
        }
      : null;
  }

  private validatePhoneLength(
    control: AbstractControl
  ): ValidationErrors | null {

    if (!control.value) {
      return null;
    }

    const digitCount =
      String(control.value)
        .replace(/\D/g, '')
        .length;

    return (
      digitCount >= 10 &&
      digitCount <= 15
    )
      ? null
      : {
          phoneLength: true
        };
  }

  private validateDifferentPhoneNumbers(
    control: AbstractControl
  ): ValidationErrors | null {

    const phone =
      MemberDetailsComponent.onlyDigits(
        control.get('phone')?.value
      );

    const alternatePhone =
      MemberDetailsComponent.onlyDigits(
        control.get('alternatePhone')?.value
      );

    const emergencyPhone =
      MemberDetailsComponent.onlyDigits(
        control.get('emergencyContactPhone')?.value
      );

    const errors: ValidationErrors = {

      ...(phone && alternatePhone === phone
        ? {
            alternatePhoneMatchesPhone: true
          }
        : {}),

      ...(phone && emergencyPhone === phone
        ? {
            emergencyPhoneMatchesPhone: true
          }
        : {})

    };

    return Object.keys(errors).length
      ? errors
      : null;
  }

  private validateIdProofDetails(
    control: AbstractControl
  ): ValidationErrors | null {

    const proofType =
      String(
        control.get('idProofType')?.value ?? ''
      ).trim();

    const proofNumber =
      String(
        control.get('idProofNumber')?.value ?? ''
      ).trim();

    const errors: ValidationErrors = {};

    if (
      proofType &&
      !proofNumber
    ) {
      errors['idProofNumberRequired'] = true;
    }

    if (
      proofNumber &&
      !proofType
    ) {
      errors['idProofTypeRequired'] = true;
    }

    if (
      proofType &&
      proofNumber
    ) {

      const patterns:
        Record<string, RegExp> = {

        aadhaar:
          /^\d{12}$/,

        pan:
          /^[A-Z]{5}\d{4}[A-Z]$/i,

        passport:
          /^[A-Z][1-9]\d{6}$/i,

        'driving-license':
          /^[A-Z]{2}[\s-]?\d{2}[\s-]?\d{4}[\s-]?\d{7}$/i,

        'voter-id':
          /^[A-Z]{3}\d{7}$/i
      };

      if (
        patterns[proofType] &&
        !patterns[proofType].test(
          proofNumber
        )
      ) {
        errors['invalidIdProofFormat'] = true;
      }
    }

    return Object.keys(errors).length
      ? errors
      : null;
  }

  private validateReferralDetails(
    control: AbstractControl
  ): ValidationErrors | null {

    const source =
      String(
        control.get('referralSource')?.value ?? ''
      ).trim();

    const referredBy =
      String(
        control.get('referredByMemberId')?.value ?? ''
      ).trim();

    const errors: ValidationErrors = {};

    if (
      source === 'member-referral' &&
      !referredBy
    ) {
      errors['referredByMemberRequired'] = true;
    }

    if (
      referredBy &&
      source !== 'member-referral'
    ) {
      errors['memberReferralSourceRequired'] = true;
    }

    if (
      referredBy &&
      Number(referredBy) === this.memberId
    ) {
      errors['selfReferral'] = true;
    }

    return Object.keys(errors).length
      ? errors
      : null;
  }

  private static onlyDigits(
    value: unknown
  ): string {

    return String(
      value ?? ''
    ).replace(/\D/g, '');
  }

  private toDateInputValue(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // =========================================================
  // DATE OF BIRTH VALIDATION
  // =========================================================

  private validateDateOfBirth(
    control: AbstractControl
  ): ValidationErrors | null {

    if (!control.value) {
      return null;
    }

    const selectedDate =
      new Date(
        `${control.value}T00:00:00`
      );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      return {
        invalidDate: true
      };
    }

    const today = new Date();

    selectedDate.setHours(
      0,
      0,
      0,
      0
    );

    today.setHours(
      0,
      0,
      0,
      0
    );

    if (
      selectedDate >
      today
    ) {
      return {
        futureDate: true
      };
    }

    const latestAdultBirthDate =
      new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );

    if (
      selectedDate >
      latestAdultBirthDate
    ) {
      return {
        underAge: true
      };
    }

    return null;
  }

  // =========================================================
  // SERVICE DATA HELPERS
  // =========================================================

  private toMemberStatus(
    value: string
  ): MemberRecord['status'] {

    switch (value.toLowerCase()) {

      case 'expiring':
        return 'Expiring';

      case 'expired':
        return 'Expired';

      case 'inactive':
        return 'Inactive';

      case 'active':
      default:
        return 'Active';
    }
  }

  private stringValue(
    value: unknown
  ): string {

    return typeof value === 'string'
      ? value
      : '';
  }

  private optionalStringValue(
    value: unknown
  ): string | undefined {

    if (
      typeof value !== 'string'
    ) {
      return undefined;
    }

    const trimmed =
      value.trim();

    return trimmed || undefined;
  }
}

