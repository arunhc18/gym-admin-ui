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
MemberService,
  MEMBERSHIP_PLAN_AMOUNTS,
MEMBERSHIP_PLANS,
PAYMENT_MODES,
PAYMENT_STATUSES,
PaymentMode,
PaymentStatus
} from '../../services/member.service';

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

readonly maxDateOfBirth =
this.getToday();

readonly membershipPlans =
MEMBERSHIP_PLANS;

readonly paymentModes =
PAYMENT_MODES;

readonly paymentStatuses =
PAYMENT_STATUSES;

selectedIdProofFile: File | null = null;

idProofFileError = '';

isSubmitting = false;

constructor(
private readonly formBuilder: FormBuilder,
private readonly memberService: MemberService,
private readonly router: Router
) {
this.memberForm =
  this.formBuilder.group(
    {
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
          this.notWhitespaceOnlyValidator
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
          Validators.pattern(
            /^(male|female|other)?$/
          )
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
          Validators.pattern(
            PHONE_PATTERN
          ),
          this.phoneLengthValidator
        ]
      ],

      alternatePhone: [
        '',
        [
          Validators.pattern(
            PHONE_PATTERN
          ),
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
          Validators.pattern(
            LOCATION_NAME_PATTERN
          ),
          this.notWhitespaceOnlyValidator
        ]
      ],

      state: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            LOCATION_NAME_PATTERN
          ),
          this.notWhitespaceOnlyValidator
        ]
      ],

      country: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            LOCATION_NAME_PATTERN
          ),
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
          Validators.pattern(
            NAME_PATTERN
          ),
          this.notWhitespaceOnlyValidator
        ]
      ],

      emergencyContactPhone: [
        '',
        [
          Validators.pattern(
            PHONE_PATTERN
          ),
          this.phoneLengthValidator
        ]
      ],

      planName: [
        '',
        [
          Validators.required
        ]
      ],

      joinDate: [
        this.getToday(),
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
        null,
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
        this.alternatePhoneMatchesPhoneValidator,
        this.paymentValidationValidator
      ]
    }
  );

this.updateExpiryDate();
this.updatePaymentValues();

}

get isFormInvalid(): boolean {
return (
this.memberForm.invalid ||
!!this.idProofFileError
);
}

/*

* Called when Membership Plan changes.
* Automatically updates:
* * Expiry Date
* * Membership Amount
* * Amount Paid
* * Balance
    */
onPlanChange(): void {
  const planName =
    this.memberForm.controls[
      'planName'
    ].value;

  const planAmount =
    MEMBERSHIP_PLAN_AMOUNTS[planName];

  if (planAmount !== undefined) {
    this.memberForm.controls[
      'membershipAmount'
    ].setValue(
      planAmount,
      {
        emitEvent: false
      }
    );
  } else {
    this.memberForm.controls[
      'membershipAmount'
    ].setValue(
      null,
      {
        emitEvent: false
      }
    );
  }

  this.updateExpiryDate();
  this.updatePaymentValues();

  this.memberForm.controls[
    'membershipAmount'
  ].updateValueAndValidity({
    emitEvent: false
  });

  this.memberForm.controls[
    'amountPaid'
  ].updateValueAndValidity({
    emitEvent: false
  });

  this.memberForm.updateValueAndValidity({
    emitEvent: false
  });
}

onStartDateChange(): void {
this.updateExpiryDate();
}

onPaymentStatusChange(): void {
this.updatePaymentValues();
this.memberForm.controls[
  'amountPaid'
].updateValueAndValidity({
  emitEvent: false
});

this.memberForm.updateValueAndValidity({
  emitEvent: false
});

}

onAmountChange(): void {
this.updatePaymentValues();
this.memberForm.controls[
  'amountPaid'
].updateValueAndValidity({
  emitEvent: false
});

this.memberForm.updateValueAndValidity({
  emitEvent: false
});


}

onAmountPaidChange(): void {
this.updateBalance();
this.memberForm.controls[
  'amountPaid'
].updateValueAndValidity({
  emitEvent: false
});

this.memberForm.updateValueAndValidity({
  emitEvent: false
});


}

onSubmit(): void {
this.memberForm.updateValueAndValidity();

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
  const formValue =
    this.memberForm.getRawValue();

  const paymentMode =
    this.toPaymentMode(
      formValue.paymentMode
    );

  const paymentStatus =
    this.toPaymentStatus(
      formValue.paymentStatus
    );

  const amount =
    Number(
      formValue.membershipAmount
    );

  const amountPaid =
    Number(
      formValue.amountPaid
    );

  const planDurationMonths =
    this.memberService.getPlanDuration(
      formValue.planName
    );

  const expiryDate =
    this.memberService.calculateExpiryDate(
      formValue.joinDate,
      planDurationMonths
    );

  const memberData:
    CreateMember = {

    memberCode:
      this.trimValue(
        formValue.memberCode
      ),

    firstName:
      this.trimValue(
        formValue.firstName
      ),

    lastName:
      this.trimValue(
        formValue.lastName
      ),

    dateOfBirth:
      this.trimValue(
        formValue.dateOfBirth
      ),

    gender:
      this.trimValue(
        formValue.gender
      ),

    bloodGroup:
      this.trimValue(
        formValue.bloodGroup
      ),

    phone:
      this.trimValue(
        formValue.phone
      ),

    alternatePhone:
      this.trimValue(
        formValue.alternatePhone
      ),

    email:
      this.trimValue(
        formValue.email
      ),

    addressLine1:
      this.trimValue(
        formValue.addressLine1
      ),

    addressLine2:
      this.trimValue(
        formValue.addressLine2
      ),

    city:
      this.trimValue(
        formValue.city
      ),

    state:
      this.trimValue(
        formValue.state
      ),

    country:
      this.trimValue(
        formValue.country
      ),

    postalCode:
      this.trimValue(
        formValue.postalCode
      ),

    emergencyContactName:
      this.trimValue(
        formValue.emergencyContactName
      ),

    emergencyContactPhone:
      this.trimValue(
        formValue.emergencyContactPhone
      ),

    idProofType:
      this.trimValue(
        formValue.idProofType
      ),

    idProofNumber:
      this.trimValue(
        formValue.idProofNumber
      ),

    idProofUrl:
      this.selectedIdProofFile?.name ?? '',

    medicalConditions:
      this.trimValue(
        formValue.medicalConditions
      ),

    referralSource:
      this.trimValue(
        formValue.referralSource
      ),

    referredByMemberId:
      this.trimValue(
        formValue.referredByMemberId
      ),

    planName:
      this.trimValue(
        formValue.planName
      ),

    planDurationMonths,

    joinDate:
      this.trimValue(
        formValue.joinDate
      ),

    expiryDate,

    paymentMode,

    paymentStatus,

    membershipAmount:
      amount,

    amountPaid,

    balanceAmount:
      this.memberService.calculateBalance(
        amount,
        amountPaid
      )
  };

  const createdMember =
    this.memberService.createMember(
      memberData
    );

  console.log(
    'Member created successfully:',
    createdMember
  );

  this.memberForm.markAsPristine();

  this.router.navigate([
    '/members'
  ]);

} finally {
  this.isSubmitting = false;
}

}

onIdProofSelected(
event: Event
): void {

this.idProofFileError = '';

const input =
  event.target as HTMLInputElement;

const file =
  input.files?.[0] ?? null;

if (!file) {
  this.selectedIdProofFile = null;
  return;
}

if (
  !ALLOWED_FILE_TYPES.has(
    file.type
  )
) {
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

private updateExpiryDate(): void {
const planName =
this.memberForm?.controls[
'planName'
]?.value;

const joinDate =
  this.memberForm?.controls[
    'joinDate'
  ]?.value;

if (
  !planName ||
  !joinDate
) {
  this.memberForm?.controls[
    'expiryDate'
  ]?.setValue(
    '',
    {
      emitEvent: false
    }
  );

  return;
}

const duration =
  this.memberService.getPlanDuration(
    planName
  );

const expiry =
  this.memberService.calculateExpiryDate(
    joinDate,
    duration
  );

this.memberForm.controls[
  'expiryDate'
].setValue(
  expiry,
  {
    emitEvent: false
  }
);

}

private updatePaymentValues(): void {
  const status =
    this.memberForm.controls[
      'paymentStatus'
    ].value;

  const amount =
    Number(
      this.memberForm.controls[
        'membershipAmount'
      ].value
    ) || 0;

  const amountPaidControl =
    this.memberForm.controls[
      'amountPaid'
    ];

  if (status === 'Paid') {
    amountPaidControl.setValue(
      amount,
      {
        emitEvent: false
      }
    );
  } else if (status === 'Pending') {
    amountPaidControl.setValue(
      0,
      {
        emitEvent: false
      }
    );
  }

  /*
   * Do NOT disable/enable amountPaid here.
   * The HTML controls whether it is editable
   * based on the selected payment status.
   */

  this.updateBalance();
}
private updateBalance(): void {
const amount =
Number(
this.memberForm.controls[
'membershipAmount'
].value
) || 0;

const amountPaid =
  Number(
    this.memberForm.controls[
      'amountPaid'
    ].value
  ) || 0;

const balance =
  this.memberService.calculateBalance(
    amount,
    amountPaid
  );

this.memberForm.controls[
  'balanceAmount'
].setValue(
  balance,
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
    Number.isNaN(amountPaid)
  ) {
    return {
      invalidAmountPaid: true
    };
  }

  if (
    amountPaid < 0
  ) {
    return {
      negativeAmountPaid: true
    };
  }

  if (
    amountPaid > amount
  ) {
    return {
      amountPaidExceedsAmount: true
    };
  }

  return null;
};

private readonly paymentValidationValidator =
(
control: AbstractControl
): ValidationErrors | null => {

  const status =
    String(
      control.get(
        'paymentStatus'
      )?.value ?? ''
    );

  const paymentMode =
    String(
      control.get(
        'paymentMode'
      )?.value ?? ''
    );

  const amount =
    Number(
      control.get(
        'membershipAmount'
      )?.value
    ) || 0;

  const amountPaid =
    Number(
      control.get(
        'amountPaid'
      )?.value
    ) || 0;

  const errors:
    ValidationErrors = {};

  if (
    status === 'Paid'
  ) {

    if (!paymentMode) {
      errors[
        'paymentModeRequired'
      ] = true;
    }

    if (
      amount <= 0 ||
      amountPaid !== amount
    ) {
      errors[
        'paidAmountMismatch'
      ] = true;
    }
  }

  if (
    status === 'Partial'
  ) {

    if (!paymentMode) {
      errors[
        'paymentModeRequired'
      ] = true;
    }

    if (
      amountPaid <= 0 ||
      amountPaid >= amount
    ) {
      errors[
        'invalidPartialPayment'
      ] = true;
    }
  }

  if (
    status === 'Pending'
  ) {

    if (
      amountPaid !== 0
    ) {
      errors[
        'pendingAmountMismatch'
      ] = true;
    }
  }

  return Object.keys(errors).length
    ? errors
    : null;
};

private readonly notWhitespaceOnlyValidator =
(
control: AbstractControl
): ValidationErrors | null => {


  const value =
    control.value;

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

  const date =
    new Date(control.value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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
    new Date(
      control.value
    );

  const today =
    new Date();

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
    selectedDate > today
  ) {
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
    new Date(
      control.value
    );

  if (
    Number.isNaN(
      dateOfBirth.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

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
    control.get(
      'phone'
    )?.value;

  const alternatePhone =
    control.get(
      'alternatePhone'
    )?.value;

  if (
    phone &&
    alternatePhone &&
    String(phone)
      .replace(/\D/g, '') ===
    String(alternatePhone)
      .replace(/\D/g, '')
  ) {
    return {
      alternatePhoneMatchesPhone:
        true
    };
  }

  return null;
};

private toPaymentMode(
value: unknown
): PaymentMode | undefined {

if (
  value === 'Cash' ||
  value === 'UPI' ||
  value === 'Card' ||
  value === 'Bank Transfer' ||
  value === 'Other'
) {
  return value;
}

return undefined;

}

private toPaymentStatus(
value: unknown
): PaymentStatus | undefined {

if (
  value === 'Paid' ||
  value === 'Partial' ||
  value === 'Pending'
) {
  return value;
}

return undefined;

}

private trimValue(
value: unknown
): string {
return typeof value === 'string'
? value.trim()
: '';
}

private getToday(): string {
const today =
new Date();

const year =
  today.getFullYear();

const month =
  String(
    today.getMonth() + 1
  ).padStart(
    2,
    '0'
  );

const day =
  String(
    today.getDate()
  ).padStart(
    2,
    '0'
  );

return '${year}-${month}-${day}';

}
}
