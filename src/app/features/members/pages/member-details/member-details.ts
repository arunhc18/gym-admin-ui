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
  MEMBERSHIP_PLANS,
  PAYMENT_MODES,
  PAYMENT_STATUSES,
  MemberRecord,
  MemberService,
  UpdateMember
} from '../../services/member.service';

interface MemberData {
  [key: string]: string;
}

const NAME_PATTERN =
  /^[\p{L}\p{M}\s'.-]+$/u;

const PHONE_PATTERN =
  /^\+?[0-9\s()-]+$/;

const LOCATION_NAME_PATTERN =
  /^[\p{L}\p{M}\s'.-]+$/u;

const ALLOWED_FILE_TYPES =
  new Set([
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]);

const MAX_ID_PROOF_FILE_SIZE =
  5 * 1024 * 1024;

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

  readonly membershipPlans =
    MEMBERSHIP_PLANS;

  readonly paymentModes =
    PAYMENT_MODES;

  readonly paymentStatuses =
    PAYMENT_STATUSES;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly memberService: MemberService
  ) {

    this.memberForm =
      this.fb.group({

        memberCode: [
          '',
          [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(
              /^[A-Za-z0-9_-]+$/
            )
          ]
        ],

        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(
              NAME_PATTERN
            ),
            this.validateNotWhitespaceOnly
          ]
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(100),
            Validators.pattern(
              NAME_PATTERN
            ),
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
            Validators.pattern(
              /^(male|female|other)$/
            )
          ]
        ],

        bloodGroup: [
          '',
          [
            Validators.maxLength(10),
            Validators.pattern(
              /^(A|B|AB|O)[+-]$/
            )
          ]
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.maxLength(20),
            Validators.pattern(
              PHONE_PATTERN
            ),
            this.validatePhoneLength
          ]
        ],

        alternatePhone: [
          '',
          [
            Validators.maxLength(20),
            Validators.pattern(
              PHONE_PATTERN
            ),
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
            Validators.pattern(
              LOCATION_NAME_PATTERN
            ),
            this.validateNotWhitespaceOnly
          ]
        ],

        state: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(
              LOCATION_NAME_PATTERN
            ),
            this.validateNotWhitespaceOnly
          ]
        ],

        country: [
          '',
          [
            Validators.maxLength(100),
            Validators.pattern(
              LOCATION_NAME_PATTERN
            ),
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
            Validators.pattern(
              NAME_PATTERN
            ),
            this.validateNotWhitespaceOnly
          ]
        ],

        emergencyContactPhone: [
          '',
          [
            Validators.maxLength(20),
            Validators.pattern(
              PHONE_PATTERN
            ),
            this.validatePhoneLength
          ]
        ],

        planName: [
          '',
          [
            Validators.required
          ]
        ],

        joinDate: [
          '',
          [
            Validators.required
          ]
        ],

        expiryDate: [
          {
            value: '',
            disabled: true
          }
        ],

        paymentMode: [
          ''
        ],

        paymentStatus: [
          'Pending',
          [
            Validators.required
          ]
        ],

        membershipAmount: [
          0,
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ],

        amountPaid: [
          0,
          [
            Validators.min(0),
            this.amountPaidValidator
          ]
        ],

        balanceAmount: [
          {
            value: 0,
            disabled: true
          }
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

      },
      {
        validators: [
          this.validateDifferentPhoneNumbers,
          this.validateIdProofDetails,
          control =>
            this.validateReferralDetails(
              control
            ),
          this.validatePayment
        ]
      });

    this.memberForm.controls['phone']
      .valueChanges
      .subscribe(() => {

        this.memberForm.controls[
          'alternatePhone'
        ].updateValueAndValidity({
          emitEvent: false
        });

        this.memberForm.controls[
          'emergencyContactPhone'
        ].updateValueAndValidity({
          emitEvent: false
        });
      });

    this.memberForm.controls[
      'planName'
    ].valueChanges.subscribe(planName => {
      this.updateMembershipValues(
        String(planName ?? ''),
        true
      );
      this.applyPaymentStatus(
        String(
          this.memberForm.controls[
            'paymentStatus'
          ].value ?? ''
        )
      );
      this.memberForm.controls[
        'amountPaid'
      ].updateValueAndValidity({
        emitEvent: false
      });
      this.memberForm.updateValueAndValidity({
        emitEvent: false
      });
    });

    this.memberForm.controls[
      'joinDate'
    ].valueChanges.subscribe(() => {
      this.updateMembershipValues();
    });

    this.memberForm.controls[
      'paymentStatus'
    ].valueChanges.subscribe(status => {
      this.applyPaymentStatus(
        status
      );
    });

    this.memberForm.controls[
      'membershipAmount'
    ].valueChanges.subscribe(() => {
      this.updateBalance();
    });

    this.memberForm.controls[
      'amountPaid'
    ].valueChanges.subscribe(() => {
      this.updateBalance();
    });
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('id');

        if (!id) {
          this.savedMember = {};
          return;
        }

        const numericId =
          Number(id);

        if (Number.isNaN(numericId)) {
          this.savedMember = {};
          return;
        }

        this.memberId =
          numericId;

        this.loadMember(
          numericId
        );

        if (
          this.route.snapshot
            .queryParamMap
            .get('mode') === 'edit'
        ) {
          this.startEditing();
        }
      }
    );
  }

  private loadMember(
    id: number
  ): void {

    const member =
      this.memberService
        .getMemberById(id);

    if (!member) {

      this.savedMember = {};

      this.memberForm.reset();

      this.memberForm.markAsPristine();

      this.isEditMode = false;

      return;
    }

    this.savedMember =
      this.toMemberData(
        member
      );

    this.memberForm.reset(
      this.savedMember
    );

    this.updateMembershipValues();
    this.updateBalance();

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  private toMemberData(
    member: MemberRecord
  ): MemberData {

    const data:
      MemberData = {};

    Object.entries(member)
      .forEach(
        ([key, value]) => {

          data[key] =
            value !== undefined &&
            value !== null
              ? String(value)
              : '';
        }
      );

    data['status'] =
      member.status.toLowerCase();

    return data;
  }

  get isSaveDisabled(): boolean {

    return (
      this.memberForm.invalid ||
      !this.memberForm.dirty
    );
  }

  get maxDateOfBirth(): string {

    const today =
      new Date();

    const latestDate =
      new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );

    return this.toDateInputValue(
      latestDate
    );
  }

  get memberName(): string {

    const firstName =
      this.savedMember['firstName'] ?? '';

    const lastName =
      this.savedMember['lastName'] ?? '';

    return `${firstName} ${lastName}`.trim();
  }

  get memberInitials(): string {

    const firstName =
      this.savedMember['firstName'] ?? '';

    const lastName =
      this.savedMember['lastName'] ?? '';

    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`
    ).toUpperCase();
  }

  get memberSince(): string {

    const joinDate =
      this.savedMember['joinDate'];

    if (!joinDate) {
      return 'Not provided';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    ).format(
      new Date(
        `${joinDate}T00:00:00`
      )
    );
  }

  startEditing(): void {

    this.memberForm.reset(
      this.savedMember
    );

    this.updateMembershipValues();
    this.updateBalance();

    this.memberForm.markAsPristine();

    this.isEditMode = true;
  }

  displayValue(
    controlName: string
  ): string {

    const value =
      this.savedMember[
        controlName
      ];

    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return 'Not provided';
    }

    return value;
  }

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
        'driving-license':
          'Driving License',
        'voter-id':
          'Voter ID'
      },

      referralSource: {
        'walk-in': 'Walk-in',
        website: 'Website',
        'social-media':
          'Social Media',
        'member-referral':
          'Member Referral',
        advertisement:
          'Advertisement',
        other: 'Other'
      }

    };

    return (
      labels[controlName]?.[
        this.savedMember[
          controlName
        ]
      ]
      ??
      this.displayValue(
        controlName
      )
    );
  }

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

  formatAmount(
    value: string
  ): string {

    const amount =
      Number(value);

    if (
      Number.isNaN(amount)
    ) {
      return '₹0.00';
    }

    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }
    ).format(amount);
  }

  hasError(
    controlName: string,
    errorName: string
  ): boolean {

    const control =
      this.memberForm.controls[
        controlName
      ];

    return (
      control.touched &&
      control.hasError(
        errorName
      )
    );
  }

  saveMember(): void {

    if (
      this.memberForm.invalid
    ) {

      this.memberForm.markAllAsTouched();

      this.memberForm
        .updateValueAndValidity();

      return;
    }

    const values =
      this.memberForm
        .getRawValue();

    const updateData:
      UpdateMember = {

      memberCode:
        this.stringValue(
          values.memberCode
        ),

      firstName:
        this.stringValue(
          values.firstName
        ),

      lastName:
        this.stringValue(
          values.lastName
        ),

      dateOfBirth:
        this.optionalStringValue(
          values.dateOfBirth
        ),

      gender:
        this.optionalStringValue(
          values.gender
        ),

      bloodGroup:
        this.optionalStringValue(
          values.bloodGroup
        ),

      phone:
        this.stringValue(
          values.phone
        ),

      alternatePhone:
        this.optionalStringValue(
          values.alternatePhone
        ),

      email:
        this.optionalStringValue(
          values.email
        ),

      addressLine1:
        this.optionalStringValue(
          values.addressLine1
        ),

      addressLine2:
        this.optionalStringValue(
          values.addressLine2
        ),

      city:
        this.optionalStringValue(
          values.city
        ),

      state:
        this.optionalStringValue(
          values.state
        ),

      country:
        this.optionalStringValue(
          values.country
        ),

      postalCode:
        this.optionalStringValue(
          values.postalCode
        ),

      emergencyContactName:
        this.optionalStringValue(
          values.emergencyContactName
        ),

      emergencyContactPhone:
        this.optionalStringValue(
          values.emergencyContactPhone
        ),

      planName:
        this.stringValue(
          values.planName
        ),

      planDurationMonths:
        this.memberService
          .getMembershipPlan(
            values.planName
          )
          ?.durationMonths,

      joinDate:
        this.stringValue(
          values.joinDate
        ),

      expiryDate:
        values.expiryDate,

      paymentMode:
        values.paymentMode ||
        undefined,

      paymentStatus:
        values.paymentStatus,

      membershipAmount:
        Number(
          values.membershipAmount
        ),

      amountPaid:
        Number(
          values.amountPaid
        ),

      balanceAmount:
        Number(
          values.balanceAmount
        ),

      idProofType:
        this.optionalStringValue(
          values.idProofType
        ),

      idProofNumber:
        this.optionalStringValue(
          values.idProofNumber
        ),

      idProofUrl:
        this.optionalStringValue(
          values.idProofUrl
        ),

      medicalConditions:
        this.optionalStringValue(
          values.medicalConditions
        ),

      referralSource:
        this.optionalStringValue(
          values.referralSource
        ),

      referredByMemberId:
        this.optionalStringValue(
          values.referredByMemberId
        ),

      status:
        this.toMemberStatus(
          String(
            values.status ??
            'active'
          )
        )
    };

    const updated =
      this.memberService.updateMember(
        this.memberId,
        updateData
      );

    if (!updated) {
      return;
    }

    this.savedMember =
      this.toMemberData(
        updated
      );

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  cancel(): void {

    this.memberForm.reset(
      this.savedMember
    );

    this.memberForm.markAsPristine();

    this.isEditMode = false;
  }

  private updateMembershipValues(
    planName?: string,
    updateAmount = false
  ): void {

    const selectedPlan =
      planName ??
      String(
        this.memberForm.get(
          'planName'
        )?.value ?? ''
      );

    const joinDate =
      this.memberForm.get(
        'joinDate'
      )?.value;

    if (
      !selectedPlan ||
      !joinDate
    ) {
      return;
    }

    if (updateAmount) {
      this.memberForm
        .get('membershipAmount')
        ?.setValue(
          this.memberService.getMembershipAmount(
            selectedPlan
          ) ?? null,
          {
            emitEvent: false
          }
        );
    }

    const expiry =
      this.memberService
        .calculateExpiryDate(
          joinDate,
          this.memberService.getPlanDuration(
            selectedPlan
          )
        );

    this.memberForm
      .get('expiryDate')
      ?.setValue(
        expiry,
        {
          emitEvent: false
        }
      );
  }

  private applyPaymentStatus(
    status: string
  ): void {

    const amount =
      Number(
        this.memberForm.get(
          'membershipAmount'
        )?.value ?? 0
      );

    const paidControl =
      this.memberForm.get(
        'amountPaid'
      );

    if (status === 'Paid') {

      paidControl?.setValue(
        amount,
        {
          emitEvent: false
        }
      );

    } else if (
      status === 'Pending'
    ) {

      paidControl?.setValue(
        0,
        {
          emitEvent: false
        }
      );
    }

    this.updateBalance();
  }

  private updateBalance(): void {

    const amount =
      Number(
        this.memberForm.get(
          'membershipAmount'
        )?.value ?? 0
      );

    const paid =
      Number(
        this.memberForm.get(
          'amountPaid'
        )?.value ?? 0
      );

    this.memberForm
      .get('balanceAmount')
      ?.setValue(
        Math.max(
          0,
          amount - paid
        ),
        {
          emitEvent: false
        }
      );
  }

  private readonly amountPaidValidator =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      if (
        control.value === null ||
        control.value === '' ||
        control.value === undefined
      ) {
        return null;
      }

      const amount =
        Number(
          control.parent?.get(
            'membershipAmount'
          )?.value
        ) || 0;

      const amountPaid =
        Number(control.value);

      if (
        Number.isNaN(amountPaid) ||
        amountPaid < 0 ||
        amountPaid > amount
      ) {
        return {
          amountPaidExceedsAmount: true
        };
      }

      return null;
    };

  private readonly validatePayment =
    (
      control: AbstractControl
    ): ValidationErrors | null => {

      const status =
        String(
          control.get(
            'paymentStatus'
          )?.value ?? ''
        );

      const mode =
        String(
          control.get(
            'paymentMode'
          )?.value ?? ''
        );

      const amount =
        Number(
          control.get(
            'membershipAmount'
          )?.value ?? 0
        );

      const paid =
        Number(
          control.get(
            'amountPaid'
          )?.value ?? 0
        );

      const errors:
        ValidationErrors = {};

      if (
        (
          status === 'Paid' ||
          status === 'Partial'
        ) &&
        !mode
      ) {
        errors[
          'paymentModeRequired'
        ] = true;
      }

      if (
        paid < 0 ||
        paid > amount
      ) {
        errors[
          'invalidAmountPaid'
        ] = true;
      }

      if (
        status === 'Partial' &&
        (
          paid <= 0 ||
          paid >= amount
        )
      ) {
        errors[
          'invalidPartialPayment'
        ] = true;
      }

      return Object.keys(errors).length
        ? errors
        : null;
    };

  onIdProofFileSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const control =
      this.memberForm.controls[
        'idProofUrl'
      ];

    const file =
      input.files?.[0];

    control.markAsTouched();
    control.markAsDirty();

    if (!file) {

      control.setValue('');
      control.setErrors(null);

      return;
    }

    if (
      !ALLOWED_FILE_TYPES.has(
        file.type
      )
    ) {

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

    control.setValue(
      file.name
    );
  }

  private validateNotWhitespaceOnly(
    control: AbstractControl
  ): ValidationErrors | null {

    const value =
      String(
        control.value ?? ''
      );

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
      String(
        control.value
      )
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
        control.get(
          'phone'
        )?.value
      );

    const alternatePhone =
      MemberDetailsComponent.onlyDigits(
        control.get(
          'alternatePhone'
        )?.value
      );

    const emergencyPhone =
      MemberDetailsComponent.onlyDigits(
        control.get(
          'emergencyContactPhone'
        )?.value
      );

    const errors:
      ValidationErrors = {};

    if (
      phone &&
      alternatePhone === phone
    ) {
      errors[
        'alternatePhoneMatchesPhone'
      ] = true;
    }

    if (
      phone &&
      emergencyPhone === phone
    ) {
      errors[
        'emergencyPhoneMatchesPhone'
      ] = true;
    }

    return Object.keys(errors).length
      ? errors
      : null;
  }

  private validateIdProofDetails(
    control: AbstractControl
  ): ValidationErrors | null {

    const proofType =
      String(
        control.get(
          'idProofType'
        )?.value ?? ''
      ).trim();

    const proofNumber =
      String(
        control.get(
          'idProofNumber'
        )?.value ?? ''
      ).trim();

    const errors:
      ValidationErrors = {};

    if (
      proofType &&
      !proofNumber
    ) {
      errors[
        'idProofNumberRequired'
      ] = true;
    }

    if (
      proofNumber &&
      !proofType
    ) {
      errors[
        'idProofTypeRequired'
      ] = true;
    }

    if (
      proofType &&
      proofNumber
    ) {
      const proofPatterns: Record<string, RegExp> = {
        aadhaar: /^\d{12}$/,
        pan: /^[A-Z]{5}\d{4}[A-Z]$/i,
        passport: /^[A-Z0-9]{6,9}$/i,
        'driving-license': /^[A-Z0-9-]{5,20}$/i,
        'voter-id': /^[A-Z0-9]{10}$/i
      };

      if (
        !proofPatterns[proofType]?.test(proofNumber)
      ) {
        errors[
          'invalidIdProofFormat'
        ] = true;
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
        control.get(
          'referralSource'
        )?.value ?? ''
      ).trim();

    const referredBy =
      String(
        control.get(
          'referredByMemberId'
        )?.value ?? ''
      ).trim();

    const errors:
      ValidationErrors = {};

    if (
      source === 'member-referral' &&
      !referredBy
    ) {
      errors[
        'referredByMemberRequired'
      ] = true;
    }

    if (
      referredBy &&
      source !== 'member-referral'
    ) {
      errors[
        'memberReferralSourceRequired'
      ] = true;
    }

    if (
      referredBy &&
      Number(referredBy) ===
        this.memberId
    ) {
      errors[
        'selfReferral'
      ] = true;
    }

    return Object.keys(errors).length
      ? errors
      : null;
  }

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

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    selectedDate.setHours(
      0,
      0,
      0,
      0
    );

    if (
      selectedDate > today
    ) {
      return {
        futureDate: true
      };
    }

    const adultDate =
      new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );

    return selectedDate > adultDate
      ? {
          underAge: true
        }
      : null;
  }

  private toMemberStatus(
    value: string
  ): MemberRecord['status'] {

    switch (
      value.toLowerCase()
    ) {

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

  private static onlyDigits(
    value: unknown
  ): string {

    return String(
      value ?? ''
    ).replace(
      /\D/g,
      ''
    );
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
}