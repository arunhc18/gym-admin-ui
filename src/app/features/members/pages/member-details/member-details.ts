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

  imports: [
    ReactiveFormsModule,
    TitleCasePipe
  ],

  templateUrl: './member-details.html',
  styleUrl: './member-details.scss'
})
export class MemberDetailsComponent {

  memberId!: number;

  memberForm: FormGroup;

  savedMember: MemberData = {};

  isEditMode = false;


  // =========================================================
  // MOCK MEMBER DATA
  //
  // IMPORTANT:
  // memberId, memberCode, name, phone, email,
  // plan, location, join date, expiry date and status
  // are aligned with Developer 1's Member List.
  //
  // The remaining profile fields are blank because
  // Developer 1's current list data does not provide them.
  //
  // Later this data should come from MemberService / API.
  // =========================================================

  private readonly mockMembers: Record<number, MemberData> = {

    // =======================================================
    // MEMBER 1 - ARUN KUMAR
    // =======================================================

    1: {

      memberCode: 'MEM-00124',

      firstName: 'Arun',
      lastName: 'Kumar',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9876543210',
      alternatePhone: '',

      email: 'arun@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Gold Annual',

      location: 'Main Branch',

      joinDate: '2026-01-12',

      expiryDate: '2027-01-11'
    },


    // =======================================================
    // MEMBER 2 - RAHUL SHARMA
    // =======================================================

    2: {

      memberCode: 'MEM-00125',

      firstName: 'Rahul',
      lastName: 'Sharma',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9876500001',
      alternatePhone: '',

      email: 'rahul@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'expiring',

      planName: 'Monthly',

      location: 'Main Branch',

      joinDate: '2026-08-01',

      expiryDate: '2026-09-30'
    },


    // =======================================================
    // MEMBER 3 - SNEHA PATIL
    // =======================================================

    3: {

      memberCode: 'MEM-00126',

      firstName: 'Sneha',
      lastName: 'Patil',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9900011223',
      alternatePhone: '',

      email: 'sneha@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'expired',

      planName: 'Premium Annual',

      location: 'Indiranagar',

      joinDate: '2025-09-01',

      expiryDate: '2026-08-31'
    },


    // =======================================================
    // MEMBER 4 - KIRAN RAO
    // =======================================================

    4: {

      memberCode: 'MEM-00127',

      firstName: 'Kiran',
      lastName: 'Rao',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9988776655',
      alternatePhone: '',

      email: 'kiran@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Quarterly',

      location: 'HSR Layout',

      joinDate: '2026-07-15',

      expiryDate: '2026-10-15'
    },


    // =======================================================
    // MEMBER 5 - PRIYA SHETTY
    // =======================================================

    5: {

      memberCode: 'MEM-00128',

      firstName: 'Priya',
      lastName: 'Shetty',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9911223344',
      alternatePhone: '',

      email: 'priya@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Gold Annual',

      location: 'Indiranagar',

      joinDate: '2026-02-15',

      expiryDate: '2027-02-14'
    },


    // =======================================================
    // MEMBER 6 - MANOJ GOWDA
    // =======================================================

    6: {

      memberCode: 'MEM-00129',

      firstName: 'Manoj',
      lastName: 'Gowda',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9845012345',
      alternatePhone: '',

      email: 'manoj@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'expiring',

      planName: 'Monthly',

      location: 'Main Branch',

      joinDate: '2026-08-10',

      expiryDate: '2026-09-10'
    },


    // =======================================================
    // MEMBER 7 - ANANYA REDDY
    // =======================================================

    7: {

      memberCode: 'MEM-00130',

      firstName: 'Ananya',
      lastName: 'Reddy',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9900998877',
      alternatePhone: '',

      email: 'ananya@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Premium Annual',

      location: 'HSR Layout',

      joinDate: '2026-03-05',

      expiryDate: '2027-03-04'
    },


    // =======================================================
    // MEMBER 8 - VIJAY KUMAR
    // =======================================================

    8: {

      memberCode: 'MEM-00131',

      firstName: 'Vijay',
      lastName: 'Kumar',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9988007766',
      alternatePhone: '',

      email: 'vijay@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'expired',

      planName: 'Quarterly',

      location: 'Indiranagar',

      joinDate: '2026-04-10',

      expiryDate: '2026-07-10'
    },


    // =======================================================
    // MEMBER 9 - MEGHA NAIR
    // =======================================================

    9: {

      memberCode: 'MEM-00132',

      firstName: 'Megha',
      lastName: 'Nair',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9887766554',
      alternatePhone: '',

      email: 'megha@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Gold Annual',

      location: 'Main Branch',

      joinDate: '2026-06-20',

      expiryDate: '2027-06-19'
    },


    // =======================================================
    // MEMBER 10 - RAKESH BHAT
    // =======================================================

    10: {

      memberCode: 'MEM-00133',

      firstName: 'Rakesh',
      lastName: 'Bhat',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9876123456',
      alternatePhone: '',

      email: 'rakesh@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'inactive',

      planName: 'Monthly',

      location: 'HSR Layout',

      joinDate: '2026-08-25',

      expiryDate: '2026-09-25'
    },


    // =======================================================
    // MEMBER 11 - DIVYA KRISHNA
    // =======================================================

    11: {

      memberCode: 'MEM-00134',

      firstName: 'Divya',
      lastName: 'Krishna',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9898989898',
      alternatePhone: '',

      email: 'divya@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'active',

      planName: 'Gold Annual',

      location: 'Main Branch',

      joinDate: '2026-05-12',

      expiryDate: '2027-05-11'
    },


    // =======================================================
    // MEMBER 12 - SURESH NAIK
    // =======================================================

    12: {

      memberCode: 'MEM-00135',

      firstName: 'Suresh',
      lastName: 'Naik',

      dateOfBirth: '',
      gender: '',
      bloodGroup: '',

      phone: '9812345678',
      alternatePhone: '',

      email: 'suresh@example.com',

      addressLine1: '',
      addressLine2: '',

      city: '',
      state: '',
      country: '',
      postalCode: '',

      emergencyContactName: '',
      emergencyContactPhone: '',

      idProofType: '',
      idProofNumber: '',
      idProofUrl: '',

      medicalConditions: '',

      referralSource: '',
      referredByMemberId: '',

      status: 'expired',

      planName: 'Quarterly',

      location: 'Indiranagar',

      joinDate: '2026-06-01',

      expiryDate: '2026-09-01'
    }

  };


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute
  ) {

    // =======================================================
    // DEVELOPER 2'S EXISTING FORM + VALIDATIONS
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
        [
          this.validateDateOfBirth
        ]
      ],


      gender: [
        '',
        [
          Validators.maxLength(20)
        ]
      ],


      bloodGroup: [
        '',
        [
          Validators.maxLength(10)
        ]
      ],


      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\+?[0-9\s()-]{10,20}$/
          )
        ]
      ],


      alternatePhone: [
        '',
        [
          Validators.pattern(
            /^\+?[0-9\s()-]{10,20}$/
          )
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
          Validators.maxLength(255)
        ]
      ],


      addressLine2: [
        '',
        [
          Validators.maxLength(255)
        ]
      ],


      city: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z\s'-]+$/
          )
        ]
      ],


      state: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z\s'-]+$/
          )
        ]
      ],


      country: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z\s'-]+$/
          )
        ]
      ],


      postalCode: [
        '',
        [
          Validators.pattern(
            /^[0-9A-Za-z\s-]{3,20}$/
          )
        ]
      ],


      emergencyContactName: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z\s'-]+$/
          )
        ]
      ],


      emergencyContactPhone: [
        '',
        [
          Validators.pattern(
            /^\+?[0-9\s()-]{10,20}$/
          )
        ]
      ],


      idProofType: [
        '',
        [
          Validators.maxLength(50)
        ]
      ],


      idProofNumber: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[A-Za-z0-9\s./-]+$/
          )
        ]
      ],


      idProofUrl: [
        ''
      ],


      medicalConditions: [
        '',
        [
          Validators.maxLength(1000)
        ]
      ],


      referralSource: [
        '',
        [
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z0-9\s'-]+$/
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

          // "expiring" is added because Developer 1
          // has Expiring members.
          Validators.pattern(
            /^(active|expiring|inactive|suspended|expired)$/
          )
        ]
      ]

    });

  }


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    // Subscribe to route changes so that if Angular reuses
    // this component for another /members/:id route,
    // the displayed member also changes.

    this.route.paramMap.subscribe(
      params => {

        const id =
          params.get('id');


        if (!id) {

          console.error(
            'Member ID was not provided in the route.'
          );

          this.savedMember = {};

          return;
        }


        const numericId =
          Number(id);


        if (
          Number.isNaN(numericId)
        ) {

          console.error(
            'Invalid member ID:',
            id
          );

          this.savedMember = {};

          return;
        }


        this.memberId =
          numericId;


        this.loadMember(
          this.memberId
        );


        // Preserve Developer 2's edit-mode query parameter.
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


  // =========================================================
  // LOAD SELECTED MEMBER
  // =========================================================

  private loadMember(
    id: number
  ): void {

    const selectedMember =
      this.mockMembers[id];


    if (!selectedMember) {

      console.error(
        'Member not found:',
        id
      );


      this.savedMember = {};


      this.memberForm.reset();


      this.memberForm
        .markAsPristine();


      this.isEditMode =
        false;


      return;
    }


    // Create a copy so editing savedMember does not
    // directly modify the original mock object.
    this.savedMember = {
      ...selectedMember
    };


    // Populate Developer 2's existing form
    // with the selected person's information.
    this.memberForm.reset(
      this.savedMember
    );


    this.memberForm
      .markAsPristine();


    this.isEditMode =
      false;

  }


  // =========================================================
  // SAVE BUTTON
  // =========================================================

  get isSaveDisabled(): boolean {

    return (
      this.memberForm.invalid ||
      !this.memberForm.dirty
    );

  }


  // =========================================================
  // MEMBER NAME
  // =========================================================

  get memberName(): string {

    const firstName =
      this.savedMember[
        'firstName'
      ] ?? '';


    const lastName =
      this.savedMember[
        'lastName'
      ] ?? '';


    return (
      `${firstName} ${lastName}`
    ).trim();

  }


  // =========================================================
  // MEMBER INITIALS
  // =========================================================

  get memberInitials(): string {

    const firstName =
      this.savedMember[
        'firstName'
      ] ?? '';


    const lastName =
      this.savedMember[
        'lastName'
      ] ?? '';


    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`
    ).toUpperCase();

  }


  // =========================================================
  // MEMBER SINCE
  // =========================================================

  get memberSince(): string {

    const joinDate =
      this.savedMember[
        'joinDate'
      ];


    if (!joinDate) {

      return 'Not provided';

    }


    const date =
      new Date(
        `${joinDate}T00:00:00`
      );


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

    // Make sure the form always starts with
    // the selected member's current saved values.

    this.memberForm.reset(
      this.savedMember
    );


    this.memberForm
      .markAsPristine();


    this.isEditMode =
      true;

  }


  // =========================================================
  // DISPLAY VALUE
  // =========================================================

  displayValue(
    controlName: string
  ): string {

    const value =
      this.savedMember[
        controlName
      ];


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

        'driving-license':
          'Driving License',

        'voter-id':
          'Voter ID'

      },


      referralSource: {

        'walk-in':
          'Walk-in',

        website:
          'Website',

        'social-media':
          'Social Media',

        'member-referral':
          'Member Referral',

        advertisement:
          'Advertisement',

        other:
          'Other'

      }

    };


    return (
      labels[
        controlName
      ]?.[
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
      this.memberForm
        .controls[
          controlName
        ];


    return (
      control.touched &&
      control.hasError(
        errorName
      )
    );

  }


  // =========================================================
  // SAVE MEMBER
  // =========================================================

  saveMember(): void {

    if (
      this.memberForm.invalid
    ) {

      this.memberForm
        .markAllAsTouched();


      this.memberForm
        .updateValueAndValidity();


      return;

    }


    // Important:
    // Keep Developer 1 information such as joinDate,
    // expiryDate, planName and location.
    //
    // Only overwrite values represented by the edit form.

    this.savedMember = {

      ...this.savedMember,

      ...this.memberForm
        .getRawValue()

    };


    // Update the temporary member record as well.
    // This means if the same profile is opened again
    // during the current application session,
    // the edited values are retained.

    if (
      this.mockMembers[
        this.memberId
      ]
    ) {

      this.mockMembers[
        this.memberId
      ] = {

        ...this.savedMember

      };

    }


    this.memberForm
      .markAsPristine();


    this.isEditMode =
      false;


    console.log(
      'Updated member:',
      this.memberId,
      this.savedMember
    );

  }


  // =========================================================
  // CANCEL EDITING
  // =========================================================

  cancel(): void {

    // Restore the selected member values and discard
    // unsaved form changes.

    this.memberForm.reset(
      this.savedMember
    );


    this.memberForm
      .markAsPristine();


    this.isEditMode =
      false;

  }


  // =========================================================
  // DATE OF BIRTH VALIDATION
  //
  // Developer 2's existing validation is retained.
  // =========================================================

  private validateDateOfBirth(
    control: {
      value: string
    }
  ): ValidationErrors | null {

    if (
      !control.value
    ) {

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
      selectedDate >
      today
    ) {

      return {
        futureDate: true
      };

    }


    return null;

  }

}