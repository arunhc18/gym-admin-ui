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

import {
  Member,
  MemberService
} from '../../../members/services/member.service';

import {
  Trainer
} from '../../../../shared/models/trainer.model';

import {
  TrainerService
} from '../../../../shared/services/trainer.service';

import {
  PtPackage
} from '../../models/pt-package.model';

import type {
  PtSubscriptionStatus
} from '../../models/pt-subscription.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector: 'app-pt-subscription-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './pt-subscription-form.html',

  styleUrl:
    './pt-subscription-form.scss'
})
export class PtSubscriptionFormComponent
  implements OnInit {


  private readonly fb =
    inject(FormBuilder);


  private readonly route =
    inject(ActivatedRoute);


  private readonly router =
    inject(Router);


  private readonly ptService =
    inject(PersonalTrainingService);


  private readonly memberService =
    inject(MemberService);


  private readonly trainerService =
    inject(TrainerService);


  readonly tenantId = 1;


  ptSubscriptionId:
    number | null =
      null;


  members:
    Member[] = [];


  packages:
    PtPackage[] = [];


  trainers:
    Trainer[] = [];


  errorMessage = '';


  private initialFormState:
    string | null =
      null;


  // =====================================================
  // FORM
  // =====================================================

  readonly form =
    this.fb.group({

      memberId:
        this.fb.control<number | null>(
          null,
          [
            Validators.required
          ]
        ),

      packageId:
        this.fb.control<number | null>(
          null,
          [
            Validators.required
          ]
        ),

      trainerId:
        this.fb.control<number | null>(
          null,
          [
            Validators.required
          ]
        ),

      purchaseDate:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      startDate:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      endDate:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      totalSessions:
        this.fb.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(1)
          ]
        ),

      completedSessions:
        this.fb.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ),

      remainingSessions:
        this.fb.nonNullable.control(
          0,
          [
            Validators.required,
            Validators.min(0)
          ]
        ),

      status:
        this.fb.nonNullable.control<PtSubscriptionStatus>(
          'Active',
          [
            Validators.required
          ]
        )

    });


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.members =
      this.memberService
        .getMembersSnapshot();


    this.packages =
      this.ptService
        .getPackagesSnapshot(
          this.tenantId
        );


    /*
     * Existing project trainers only.
     *
     * TrainerService derives these
     * from StaffService.
     */
    this.trainers =
      this.trainerService
        .getTrainers();


    const idValue =
      this.route.snapshot
        .paramMap
        .get('id');


    // ===================================================
    // CREATE
    // ===================================================

    if (!idValue) {

      const today =
        this.getToday();


      this.form.patchValue({

        purchaseDate:
          today,

        startDate:
          today,

        status:
          'Active'

      });


      return;

    }


    // ===================================================
    // EDIT
    // ===================================================

    const id =
      Number(
        idValue
      );


    if (
      !Number.isFinite(id)
      ||
      id <= 0
    ) {

      this.errorMessage =
        'Invalid PT client ID.';

      return;

    }


    const item =
      this.ptService
        .getSubscriptionById(
          id,
          this.tenantId
        );


    if (!item) {

      this.errorMessage =
        'PT client subscription not found.';

      return;

    }


    this.ptSubscriptionId =
      item.ptSubscriptionId;


    this.form.patchValue({

      memberId:
        item.memberId,

      packageId:
        item.packageId,

      trainerId:
        item.trainerId,

      purchaseDate:
        item.purchaseDate,

      startDate:
        item.startDate,

      endDate:
        item.endDate,

      totalSessions:
        item.totalSessions,

      completedSessions:
        item.completedSessions,

      remainingSessions:
        item.remainingSessions,

      status:
        item.status

    });


    this.initialFormState =
      this.getCurrentFormState();


    this.form.markAsPristine();

    this.form.markAsUntouched();

  }


  // =====================================================
  // MODE
  // =====================================================

  get isEditMode():
    boolean {

    return (
      this.ptSubscriptionId !==
      null
    );

  }


  // =====================================================
  // SELECTED PACKAGE
  // =====================================================

  get selectedPackage():
    PtPackage | undefined {

    const packageId =
      this.form.controls
        .packageId
        .value;


    if (
      packageId === null
    ) {

      return undefined;

    }


    return this.packages
      .find(
        item =>
          item.packageId ===
          packageId
      );

  }


  // =====================================================
  // PACKAGE CHANGE
  // =====================================================

  onPackageChange(): void {

    const packageItem =
      this.selectedPackage;


    if (!packageItem) {

      this.form.patchValue({

        totalSessions: 0,

        remainingSessions: 0,

        endDate: ''

      });


      return;

    }


    const completed =
      this.form.controls
        .completedSessions
        .value;


    const remaining =
      Math.max(
        packageItem.totalSessions
        -
        completed,
        0
      );


    const startDate =
      this.form.controls
        .startDate
        .value;


    this.form.patchValue({

      totalSessions:
        packageItem.totalSessions,

      remainingSessions:
        remaining,

      endDate:
        this.ptService
          .calculateEndDate(
            startDate,
            packageItem.validityDays
          )

    });

  }


  // =====================================================
  // START DATE CHANGE
  // =====================================================

  onStartDateChange(): void {

    const packageItem =
      this.selectedPackage;


    if (!packageItem) {

      this.form.controls
        .endDate
        .setValue('');

      return;

    }


    this.form.controls
      .endDate
      .setValue(

        this.ptService
          .calculateEndDate(

            this.form.controls
              .startDate
              .value,

            packageItem.validityDays

          )

      );

  }


  // =====================================================
  // VALIDATIONS
  // =====================================================

  get dateRangeInvalid():
    boolean {

    const purchase =
      this.form.controls
        .purchaseDate
        .value;


    const start =
      this.form.controls
        .startDate
        .value;


    const end =
      this.form.controls
        .endDate
        .value;


    if (
      !purchase
      ||
      !start
      ||
      !end
    ) {

      return false;

    }


    return (
      start < purchase
      ||
      end < start
    );

  }


  get sessionCountInvalid():
    boolean {

    const total =
      this.form.controls
        .totalSessions
        .value;


    const completed =
      this.form.controls
        .completedSessions
        .value;


    const remaining =
      this.form.controls
        .remainingSessions
        .value;


    return (
      completed > total
      ||
      completed
        +
        remaining
        !==
        total
    );

  }


  get memberHasActiveSubscription():
    boolean {

    const memberId =
      this.form.controls
        .memberId
        .value;


    if (
      memberId === null
      ||
      this.form.controls
        .status
        .value !==
        'Active'
    ) {

      return false;

    }


    return this.ptService
      .getSubscriptionsSnapshot(
        this.tenantId
      )
      .some(
        item =>

          item.memberId ===
            memberId

          &&

          item.status ===
            'Active'

          &&

          item.ptSubscriptionId !==
            this.ptSubscriptionId
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
      this.initialFormState ===
      null
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

    return (
      this.form.invalid

      ||

      this.dateRangeInvalid

      ||

      this.sessionCountInvalid

      ||

      this.memberHasActiveSubscription

      ||

      (
        this.isEditMode
        &&
        !this.hasChanges
      )
    );

  }


  // =====================================================
  // OPTION AVAILABILITY
  // =====================================================

  canUseMember(
    member: Member
  ): boolean {

    const currentMemberId =
      this.form.controls
        .memberId
        .value;


    if (
      member.memberId ===
      currentMemberId
    ) {

      return true;

    }


    return (
      member.status === 'Active'
      ||
      member.status === 'Expiring'
    );

  }


  canUseTrainer(
    trainer: Trainer
  ): boolean {

    const currentTrainerId =
      this.form.controls
        .trainerId
        .value;


    if (
      trainer.trainerId ===
      currentTrainerId
    ) {

      return true;

    }


    return (
      trainer.status === 'Active'
    );

  }


  canUsePackage(
    packageItem:
      PtPackage
  ): boolean {

    const currentPackageId =
      this.form.controls
        .packageId
        .value;


    if (
      packageItem.packageId ===
      currentPackageId
    ) {

      return true;

    }


    return packageItem.isActive;

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
      this.form
        .getRawValue();


    if (
      value.memberId === null
      ||
      value.packageId === null
      ||
      value.trainerId === null
    ) {

      this.form.markAllAsTouched();

      return;

    }


    const request = {

      tenantId:
        this.tenantId,

      memberId:
        value.memberId,

      packageId:
        value.packageId,

      trainerId:
        value.trainerId,

      purchaseDate:
        value.purchaseDate,

      startDate:
        value.startDate,

      endDate:
        value.endDate,

      totalSessions:
        value.totalSessions,

      completedSessions:
        value.completedSessions,

      remainingSessions:
        value.remainingSessions,

      status:
        value.status

    };


    try {


      if (
        this.ptSubscriptionId !==
        null
      ) {

        this.ptService
          .updateSubscription({

            ptSubscriptionId:
              this.ptSubscriptionId,

            ...request

          });

      }

      else {

        this.ptService
          .createSubscription(
            request
          );

      }


      this.router
        .navigate([
          '/training/personal-training/clients'
        ]);

    }

    catch (
      error
    ) {

      this.errorMessage =

        error instanceof Error

          ? error.message

          : 'Unable to save PT client.';

    }

  }


  // =====================================================
  // FORM STATE
  // =====================================================

  private getCurrentFormState():
    string {

    return JSON.stringify(
      this.form.getRawValue()
    );

  }


  // =====================================================
  // TODAY
  // =====================================================

  private getToday():
    string {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth()
        + 1
      )
        .padStart(
          2,
          '0'
        );


    const day =
      String(
        now.getDate()
      )
        .padStart(
          2,
          '0'
        );


    return `${year}-${month}-${day}`;

  }

}