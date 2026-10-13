import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import type {
  PtPackageType
} from '../../models/pt-package.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector: 'app-pt-package-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './pt-package-form.html',

  styleUrl:
    './pt-package-form.scss'
})
export class PtPackageFormComponent
  implements OnInit {


  private readonly fb =
    inject(FormBuilder);


  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);


  private readonly ptService =
    inject(PersonalTrainingService);


  // =====================================================
  // TEMPORARY CONTEXT
  // =====================================================

  readonly tenantId = 1;

  readonly locationId = 1;


  packageId:
    number | null =
      null;


  errorMessage = '';


  // Used to detect whether edit form
  // actually contains any changes.
  private initialFormState:
    string | null =
      null;


  // =====================================================
  // FORM
  // =====================================================

  readonly form =
    this.fb.nonNullable.group({

      packageName:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required,
            Validators.maxLength(150)
          ]
        ),

      description:
        this.fb.nonNullable.control(
          ''
        ),

      packageType:
        this.fb.nonNullable.control<PtPackageType>(
          'individual',
          [
            Validators.required
          ]
        ),

      totalSessions:
        this.fb.nonNullable.control(
          1,
          [
            Validators.required,
            Validators.min(1)
          ]
        ),

      validityDays:
        this.fb.nonNullable.control(
          30,
          [
            Validators.required,
            Validators.min(1)
          ]
        ),

      sessionDurationMinutes:
        this.fb.nonNullable.control(
          60,
          [
            Validators.required,
            Validators.min(1)
          ]
        ),

      price:
        this.fb.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ),

      maxGroupSize:
        this.fb.nonNullable.control(
          2,
          [
            Validators.required,
            Validators.min(2)
          ]
        ),

      isActive:
        this.fb.nonNullable.control(
          true
        )

    });


  // =====================================================
  // MODE
  // =====================================================

  get isEditMode():
    boolean {

    return this.packageId !== null;

  }


  get isGroupPackage():
    boolean {

    return (
      this.form.controls
        .packageType
        .value === 'group'
    );

  }


  // =====================================================
  // CHANGE DETECTION
  // =====================================================

  get hasChanges():
    boolean {

    if (!this.isEditMode) {

      return true;

    }


    if (
      this.initialFormState === null
    ) {

      return false;

    }


    return (
      this.getCurrentFormState()
      !==
      this.initialFormState
    );

  }


  get isSaveDisabled():
    boolean {

    // Invalid form
    if (this.form.invalid) {

      return true;

    }


    // Extra protection for group packages
    if (
      this.isGroupPackage
      &&
      this.form.controls
        .maxGroupSize
        .value < 2
    ) {

      return true;

    }


    // Edit mode:
    // disable Save Changes until something changes
    if (
      this.isEditMode
      &&
      !this.hasChanges
    ) {

      return true;

    }


    return false;

  }


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    const idValue =
      this.route.snapshot
        .paramMap
        .get('id');


    // ===================================================
    // CREATE MODE
    // ===================================================

    if (!idValue) {

      return;

    }


    // ===================================================
    // EDIT MODE
    // ===================================================

    const id =
      Number(idValue);


    if (
      !Number.isFinite(id)
      ||
      id <= 0
    ) {

      this.errorMessage =
        'Invalid PT package ID.';

      return;

    }


    const item =
      this.ptService
        .getPackageById(
          id,
          this.tenantId
        );


    if (!item) {

      this.errorMessage =
        'PT package not found.';

      return;

    }


    this.packageId =
      item.packageId;


    this.form.patchValue({

      packageName:
        item.packageName,

      description:
        item.description ?? '',

      packageType:
        item.packageType,

      totalSessions:
        item.totalSessions,

      validityDays:
        item.validityDays,

      sessionDurationMinutes:
        item.sessionDurationMinutes,

      price:
        item.price,

      maxGroupSize:
        item.maxGroupSize ?? 2,

      isActive:
        item.isActive

    });


    // Mark the loaded values as the original state.
    // Save Changes remains disabled until something changes.

    this.initialFormState =
      this.getCurrentFormState();


    this.form.markAsPristine();

    this.form.markAsUntouched();

  }


  // =====================================================
  // SAVE
  // =====================================================

  save(): void {

    this.errorMessage = '';


    if (
      this.isSaveDisabled
    ) {

      this.form.markAllAsTouched();

      return;

    }


    const value =
      this.form.getRawValue();


    const request = {

      tenantId:
        this.tenantId,

      locationId:
        this.locationId,

      packageName:
        value.packageName.trim(),

      description:
        value.description.trim()
          || null,

      totalSessions:
        Number(
          value.totalSessions
        ),

      validityDays:
        Number(
          value.validityDays
        ),

      price:
        Number(
          value.price
        ),

      sessionDurationMinutes:
        Number(
          value.sessionDurationMinutes
        ),

      packageType:
        value.packageType,

      maxGroupSize:
        value.packageType === 'group'
          ? Number(
              value.maxGroupSize
            )
          : null,

      isActive:
        value.isActive

    };


    try {


      // ===================================================
      // UPDATE
      // ===================================================

      if (
        this.packageId !== null
      ) {

        this.ptService
          .updatePackage({

            packageId:
              this.packageId,

            ...request

          });

      }


      // ===================================================
      // CREATE
      // ===================================================

      else {

        this.ptService
          .createPackage(
            request
          );

      }


      this.router.navigate([
        '/training/personal-training/packages'
      ]);

    }

    catch (error) {

      this.errorMessage =

        error instanceof Error

          ? error.message

          : 'Unable to save PT package.';

    }

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/training/personal-training/packages'
    ]);

  }


  // =====================================================
  // CURRENT FORM STATE
  //
  // Used for edit-form change detection.
  // =====================================================

  private getCurrentFormState():
    string {

    const value =
      this.form.getRawValue();


    return JSON.stringify({

      packageName:
        value.packageName,

      description:
        value.description,

      packageType:
        value.packageType,

      totalSessions:
        Number(
          value.totalSessions
        ),

      validityDays:
        Number(
          value.validityDays
        ),

      sessionDurationMinutes:
        Number(
          value.sessionDurationMinutes
        ),

      price:
        Number(
          value.price
        ),

      maxGroupSize:
        value.packageType === 'group'
          ? Number(
              value.maxGroupSize
            )
          : null,

      isActive:
        value.isActive

    });

  }

}