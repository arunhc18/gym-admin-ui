
import { Component } from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import {
  CreateMember,
  MemberService
} from '../../services/member.service';

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
  selector: 'app-add-member',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './add-member.html',
  styleUrl: './add-member.scss'
})
export class AddMemberComponent {

  memberForm: FormGroup;

  readonly maxDateOfBirth = this.getToday();

  selectedIdProofFile: File | null = null;

  idProofFileError = '';

  isSubmitting = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly memberService: MemberService,
    private readonly router: Router
  ) {
    this.memberForm = this.formBuilder.group(
      {
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
            this.notWhitespaceOnlyValidator
          ]
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(NAME_PATTERN),
            this.notWhitespaceOnlyValidator
          ]
        ],

        dateOfBirth: [
          '',
          [
            this.validDateValidator,
            this.futureDateValidator,
            this.minimumAgeValidator
          ]
        ],

        gender: [
          '',
          [
            Validators.pattern(/^(male|female|other)?$/)
          ]
        ],

        bloodGroup: [
          '',
          [
            Validators.pattern(
              /^(A\+|A-|B\+|B-|AB\+|AB-|O\+|O-)?$/
            )
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

        alternatePhone: [
          '',
          [
            Validators.pattern(PHONE_PATTERN),
            this.phoneLengthValidator
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
          [
            Validators.maxLength(255),
            this.notWhitespaceOnlyValidator
          ]
        ],

        addressLine2: [
          '',
          [
            Validators.maxLength(255),
            this.notWhitespaceOnlyValidator
          ]
        ],

        city: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(LOCATION_NAME_PATTERN),
            this.notWhitespaceOnlyValidator
          ]
        ],

        state: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(LOCATION_NAME_PATTERN),
            this.notWhitespaceOnlyValidator
          ]
        ],

        country: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(LOCATION_NAME_PATTERN),
            this.notWhitespaceOnlyValidator
          ]
        ],

        postalCode: [
          '',
          [
            Validators.maxLength(20)
          ]
        ],

        emergencyContactName: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(NAME_PATTERN),
            this.notWhitespaceOnlyValidator
          ]
        ],

        emergencyContactPhone: [
          '',
          [
            Validators.pattern(PHONE_PATTERN),
            this.phoneLengthValidator
          ]
        ],

        idProofType: [
          '',
          [
            Validators.pattern(
              /^(aadhaar|passport|driving-license|voter-id)?$/
            )
          ]
        ],

        idProofNumber: [
          '',
          [
            Validators.maxLength(50)
          ]
        ],

        medicalConditions: [
          '',
          [
            Validators.maxLength(500),
            this.notWhitespaceOnlyValidator
          ]
        ],

        referralSource: [
          '',
          [
            Validators.pattern(
              /^(walk-in|online|referral|social-media|other)?$/
            )
          ]
        ],

        referredByMemberId: [
          '',
          [
            Validators.maxLength(50)
          ]
        ]
      },
      {
        validators: [
          this.alternatePhoneMatchesPhoneValidator
        ]
      }
    );
  }

  get isFormInvalid(): boolean {
    return this.memberForm.invalid || !!this.idProofFileError;
  }

  /**
   * Creates the member through the centralized MemberService.
   *
   * Current implementation is frontend-only.
   * The MemberService keeps the created member in memory.
   */
  onSubmit(): void {
    if (
      this.memberForm.invalid ||
      this.idProofFileError
    ) {
      this.memberForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.memberForm.getRawValue();

      const memberData: CreateMember = {
        memberCode: this.trimValue(formValue.memberCode),
        firstName: this.trimValue(formValue.firstName),
        lastName: this.trimValue(formValue.lastName),

        dateOfBirth: this.trimValue(formValue.dateOfBirth),
        gender: this.trimValue(formValue.gender),
        bloodGroup: this.trimValue(formValue.bloodGroup),

        phone: this.trimValue(formValue.phone),
        alternatePhone: this.trimValue(formValue.alternatePhone),

        email: this.trimValue(formValue.email),

        addressLine1: this.trimValue(formValue.addressLine1),
        addressLine2: this.trimValue(formValue.addressLine2),

        city: this.trimValue(formValue.city),
        state: this.trimValue(formValue.state),
        country: this.trimValue(formValue.country),
        postalCode: this.trimValue(formValue.postalCode),

        emergencyContactName: this.trimValue(
          formValue.emergencyContactName
        ),

        emergencyContactPhone: this.trimValue(
          formValue.emergencyContactPhone
        ),

        idProofType: this.trimValue(formValue.idProofType),

        idProofNumber: this.trimValue(
          formValue.idProofNumber
        ),

        idProofUrl: this.selectedIdProofFile?.name ?? '',

        medicalConditions: this.trimValue(
          formValue.medicalConditions
        ),

        referralSource: this.trimValue(
          formValue.referralSource
        ),

        referredByMemberId: this.trimValue(
          formValue.referredByMemberId
        )
      };

      const createdMember =
        this.memberService.createMember(memberData);

      console.log(
        'Member created successfully:',
        createdMember
      );

      this.memberForm.markAsPristine();

      this.router.navigate(['/members']);

    } finally {
      this.isSubmitting = false;
    }
  }

  onIdProofSelected(event: Event): void {
    this.idProofFileError = '';

    const input = event.target as HTMLInputElement;

    const file =
      input.files?.[0] ?? null;

    if (!file) {
      this.selectedIdProofFile = null;
      return;
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      this.idProofFileError =
        'Only PDF, JPG and PNG files are allowed.';

      input.value = '';

      this.selectedIdProofFile = null;

      return;
    }

    if (
      file.size >
      MAX_ID_PROOF_FILE_SIZE
    ) {
      this.idProofFileError =
        'ID proof file size cannot exceed 5 MB.';

      input.value = '';

      this.selectedIdProofFile = null;

      return;
    }

    this.selectedIdProofFile = file;
  }

  private readonly notWhitespaceOnlyValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      const value = control.value;

      if (
        typeof value === 'string' &&
        value.length > 0 &&
        value.trim().length === 0
      ) {
        return {
          whitespaceOnly: true
        };
      }

      return null;
    };

  private readonly validDateValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (!control.value) {
        return null;
      }

      const date = new Date(control.value);

      if (Number.isNaN(date.getTime())) {
        return {
          invalidDate: true
        };
      }

      return null;
    };

  private readonly futureDateValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (!control.value) {
        return null;
      }

      const selectedDate =
        new Date(control.value);

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

      if (selectedDate > today) {
        return {
          futureDate: true
        };
      }

      return null;
    };

  private readonly minimumAgeValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (!control.value) {
        return null;
      }

      const dateOfBirth =
        new Date(control.value);

      if (
        Number.isNaN(
          dateOfBirth.getTime()
        )
      ) {
        return null;
      }

      const today = new Date();

      let age =
        today.getFullYear() -
        dateOfBirth.getFullYear();

      const monthDifference =
        today.getMonth() -
        dateOfBirth.getMonth();

      if (
        monthDifference < 0 ||
        (
          monthDifference === 0 &&
          today.getDate() <
            dateOfBirth.getDate()
        )
      ) {
        age--;
      }

      if (age < 18) {
        return {
          underAge: true
        };
      }

      return null;
    };

  private readonly phoneLengthValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (!control.value) {
        return null;
      }

      const digitsOnly =
        String(control.value)
          .replace(/\D/g, '');

      if (
        digitsOnly.length < 10 ||
        digitsOnly.length > 15
      ) {
        return {
          phoneLength: true
        };
      }

      return null;
    };

  private readonly alternatePhoneMatchesPhoneValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      const phone =
        control.get('phone')?.value;

      const alternatePhone =
        control.get('alternatePhone')?.value;

      if (
        phone &&
        alternatePhone &&
        String(phone).replace(/\D/g, '') ===
          String(alternatePhone).replace(/\D/g, '')
      ) {
        return {
          alternatePhoneMatchesPhone: true
        };
      }

      return null;
    };

  private trimValue(value: unknown): string {
    return typeof value === 'string'
      ? value.trim()
      : '';
  }

  private getToday(): string {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
