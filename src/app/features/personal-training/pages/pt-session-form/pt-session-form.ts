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
  TrainerService
} from '../../../../shared/services/trainer.service';

import {
  PtPackage
} from '../../models/pt-package.model';

import {
  PtSession,
  PtSessionStatus
} from '../../models/pt-session.model';

import {
  PtSubscription
} from '../../models/pt-subscription.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector: 'app-pt-session-form',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:
    './pt-session-form.html',

  styleUrl:
    './pt-session-form.scss'
})
export class PtSessionFormComponent
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


  sessionId:
    number | null =
      null;


  members:
    Member[] = [];


  subscriptions:
    PtSubscription[] = [];


  packages:
    PtPackage[] = [];


  errorMessage = '';


  private initialFormState:
    string | null =
      null;


  readonly form =
    this.fb.group({

      ptSubscriptionId:
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

      sessionDate:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      startTime:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      endTime:
        this.fb.nonNullable.control(
          '',
          [
            Validators.required
          ]
        ),

      status:
        this.fb.nonNullable.control<PtSessionStatus>(
          'Scheduled',
          [
            Validators.required
          ]
        ),

      notes:
        this.fb.nonNullable.control(
          ''
        ),

      exercisesPerformed:
        this.fb.nonNullable.control(
          ''
        ),

      feedback:
        this.fb.nonNullable.control(
          ''
        )

    });


  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {

    this.members =
      this.memberService
        .getMembersSnapshot();


    this.subscriptions =
      this.ptService
        .getSubscriptionsSnapshot(
          this.tenantId
        );


    this.packages =
      this.ptService
        .getPackagesSnapshot(
          this.tenantId
        );


    const idValue =
      this.route.snapshot
        .paramMap
        .get('id');


    // ===================================================
    // CREATE MODE
    // ===================================================

    if (!idValue) {

      this.form.patchValue({

        sessionDate:
          this.getToday(),

        status:
          'Scheduled'

      });


      return;

    }


    // ===================================================
    // EDIT MODE
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
        'Invalid PT session ID.';

      return;

    }


    const session =
      this.ptService
        .getSessionById(
          id,
          this.tenantId
        );


    if (!session) {

      this.errorMessage =
        'PT session not found.';

      return;

    }


    this.sessionId =
      session.sessionId;


    this.form.patchValue({

      ptSubscriptionId:
        session.ptSubscriptionId,

      trainerId:
        session.trainerId,

      sessionDate:
        session.sessionDate,

      startTime:
        session.startTime,

      endTime:
        session.endTime,

      status:
        session.status,

      notes:
        session.notes ?? '',

      exercisesPerformed:
        session.exercisesPerformed
        ?? '',

      feedback:
        session.feedback ?? ''

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
      this.sessionId !==
      null
    );

  }


  // =====================================================
  // SELECTED SUBSCRIPTION
  // =====================================================

  get selectedSubscription():
    PtSubscription | undefined {

    const id =
      this.form.controls
        .ptSubscriptionId
        .value;


    if (
      id === null
    ) {

      return undefined;

    }


    return this.subscriptions
      .find(
        item =>
          item.ptSubscriptionId ===
          id
      );

  }


  // =====================================================
  // SELECTED PACKAGE
  // =====================================================

  get selectedPackage():
    PtPackage | undefined {

    const subscription =
      this.selectedSubscription;


    if (!subscription) {

      return undefined;

    }


    return this.packages
      .find(
        item =>
          item.packageId ===
          subscription.packageId
      );

  }


  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  get selectedMemberName():
    string {

    const subscription =
      this.selectedSubscription;


    if (!subscription) {

      return '—';

    }


    const member =
      this.members
        .find(
          item =>
            item.memberId ===
            subscription.memberId
        );


    if (!member) {

      return 'Unknown Member';

    }


    return (
      `${member.firstName} ${member.lastName}`
    );

  }


  get selectedPackageName():
    string {

    return (
      this.selectedPackage
        ?.packageName
      ??
      '—'
    );

  }


  get assignedTrainerName():
    string {

    const trainerId =
      this.form.controls
        .trainerId
        .value;


    if (
      trainerId === null
    ) {

      return 'Unassigned';

    }


    return this.trainerService
      .getTrainerLabel(
        trainerId
      );

  }


  get remainingSessions():
    number {

    return (
      this.selectedSubscription
        ?.remainingSessions
      ??
      0
    );

  }


  // =====================================================
  // SUBSCRIPTION OPTION LABEL
  // =====================================================

  getSubscriptionLabel(
    subscription:
      PtSubscription
  ): string {

    const member =
      this.members
        .find(
          item =>
            item.memberId ===
            subscription.memberId
        );


    const packageItem =
      this.packages
        .find(
          item =>
            item.packageId ===
            subscription.packageId
        );


    const memberName =
      member
        ? `${member.firstName} ${member.lastName}`
        : 'Unknown Member';


    const packageName =
      packageItem
        ?.packageName
      ??
      'Unknown Package';


    return (
      `${memberName} - ${packageName}`
    );

  }


  // =====================================================
  // SUBSCRIPTION AVAILABILITY
  // =====================================================

  canUseSubscription(
    subscription:
      PtSubscription
  ): boolean {

    const currentSubscriptionId =
      this.form.controls
        .ptSubscriptionId
        .value;


    if (
      subscription.ptSubscriptionId ===
      currentSubscriptionId
    ) {

      return true;

    }


    return (
      subscription.status ===
        'Active'
      &&
      subscription.remainingSessions > 0
      &&
      subscription.trainerId !== null
    );

  }


  // =====================================================
  // SUBSCRIPTION CHANGE
  // =====================================================

  onSubscriptionChange(): void {

    const subscription =
      this.selectedSubscription;


    if (!subscription) {

      this.form.patchValue({

        trainerId: null,

        endTime: ''

      });


      return;

    }


    this.form.controls
      .trainerId
      .setValue(
        subscription.trainerId
      );


    const currentDate =
      this.form.controls
        .sessionDate
        .value;


    if (
      !currentDate
      ||
      currentDate <
        subscription.startDate
      ||
      currentDate >
        subscription.endDate
    ) {

      const today =
        this.getToday();


      const suitableDate =

        today >=
          subscription.startDate

        &&

        today <=
          subscription.endDate

          ? today

          : subscription.startDate;


      this.form.controls
        .sessionDate
        .setValue(
          suitableDate
        );

    }


    this.updateEndTime();

  }


  // =====================================================
  // START TIME CHANGE
  // =====================================================

  onStartTimeChange(): void {

    this.updateEndTime();

  }


  // =====================================================
  // AUTO END TIME
  // =====================================================

  private updateEndTime(): void {

    const packageItem =
      this.selectedPackage;


    const startTime =
      this.form.controls
        .startTime
        .value;


    if (
      !packageItem
      ||
      !startTime
    ) {

      this.form.controls
        .endTime
        .setValue('');

      return;

    }


    const endTime =
      this.calculateEndTime(

        startTime,

        packageItem
          .sessionDurationMinutes

      );


    this.form.controls
      .endTime
      .setValue(
        endTime
      );

  }


  // =====================================================
  // SESSION DATE VALIDATION
  // =====================================================

  get sessionDateInvalid():
    boolean {

    const subscription =
      this.selectedSubscription;


    const date =
      this.form.controls
        .sessionDate
        .value;


    if (
      !subscription
      ||
      !date
    ) {

      return false;

    }


    return (

      date <
        subscription.startDate

      ||

      date >
        subscription.endDate

    );

  }


  // =====================================================
  // TIME VALIDATION
  // =====================================================

  get timeRangeInvalid():
    boolean {

    const start =
      this.form.controls
        .startTime
        .value;


    const end =
      this.form.controls
        .endTime
        .value;


    if (
      !start
      ||
      !end
    ) {

      return false;

    }


    return (
      end <= start
    );

  }


  // =====================================================
  // SUBSCRIPTION VALIDATION
  // =====================================================

  get subscriptionInvalid():
    boolean {

    const subscription =
      this.selectedSubscription;


    if (!subscription) {

      return false;

    }


    /*
     * During edit, the existing subscription
     * remains valid even when completing the last
     * session caused the subscription to become
     * Completed.
     */
    const currentSession =
      this.getCurrentSession();


    if (
      currentSession
      &&
      currentSession.ptSubscriptionId ===
        subscription.ptSubscriptionId
    ) {

      return false;

    }


    return (

      subscription.status !==
        'Active'

      ||

      subscription.remainingSessions
        <= 0

      ||

      subscription.trainerId ===
        null

    );

  }


  // =====================================================
  // TRAINER CONFLICT
  // =====================================================

  get trainerConflict():
    boolean {

    const subscriptionId =
      this.form.controls
        .ptSubscriptionId
        .value;


    const trainerId =
      this.form.controls
        .trainerId
        .value;


    const date =
      this.form.controls
        .sessionDate
        .value;


    const start =
      this.form.controls
        .startTime
        .value;


    const end =
      this.form.controls
        .endTime
        .value;


    const status =
      this.form.controls
        .status
        .value;


    if (
      subscriptionId === null
      ||
      trainerId === null
      ||
      !date
      ||
      !start
      ||
      !end
    ) {

      return false;

    }


    if (
      status === 'Cancelled'
      ||
      status === 'No Show'
    ) {

      return false;

    }


    return this.ptService
      .getSessionsSnapshot(
        this.tenantId
      )
      .some(
        session => {

          if (
            session.sessionId ===
            this.sessionId
          ) {

            return false;

          }


          if (
            session.trainerId !==
            trainerId
          ) {

            return false;

          }


          if (
            session.sessionDate !==
            date
          ) {

            return false;

          }


          if (
            session.status ===
              'Cancelled'
            ||
            session.status ===
              'No Show'
          ) {

            return false;

          }


          return (

            start <
              session.endTime

            &&

            end >
              session.startTime

          );

        }
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


  // =====================================================
  // SAVE DISABLED
  // =====================================================

  get isSaveDisabled():
    boolean {

    return (

      this.form.invalid

      ||

      this.sessionDateInvalid

      ||

      this.timeRangeInvalid

      ||

      this.subscriptionInvalid

      ||

      this.trainerConflict

      ||

      (
        this.isEditMode
        &&
        !this.hasChanges
      )

    );

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
      value.ptSubscriptionId ===
        null
      ||
      value.trainerId ===
        null
    ) {

      this.form.markAllAsTouched();

      return;

    }


    const request = {

      ptSubscriptionId:
        value.ptSubscriptionId,

      trainerId:
        value.trainerId,

      sessionDate:
        value.sessionDate,

      startTime:
        value.startTime,

      endTime:
        value.endTime,

      status:
        value.status,

      notes:
        value.notes.trim()
        || null,

      exercisesPerformed:
        value.exercisesPerformed
          .trim()
        || null,

      feedback:
        value.feedback
          .trim()
        || null

    };


    try {


      if (
        this.sessionId !==
        null
      ) {

        this.ptService
          .updateSession(
            {

              sessionId:
                this.sessionId,

              ...request

            },
            this.tenantId
          );

      }

      else {

        this.ptService
          .createSession(
            request,
            this.tenantId
          );

      }


      this.router
        .navigate([
          '/training/personal-training/sessions'
        ]);

    }

    catch (
      error
    ) {

      this.errorMessage =

        error instanceof Error

          ? error.message

          : 'Unable to save PT session.';

    }

  }


  // =====================================================
  // CURRENT SESSION
  // =====================================================

  private getCurrentSession():
    PtSession | undefined {

    if (
      this.sessionId ===
      null
    ) {

      return undefined;

    }


    return this.ptService
      .getSessionById(
        this.sessionId,
        this.tenantId
      );

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
  // END TIME CALCULATION
  // =====================================================

  private calculateEndTime(
    startTime: string,
    durationMinutes: number
  ): string {

    const [
      hours,
      minutes
    ] =
      startTime
        .split(':')
        .map(Number);


    if (
      !Number.isFinite(hours)
      ||
      !Number.isFinite(minutes)
      ||
      !Number.isFinite(
        durationMinutes
      )
      ||
      durationMinutes <= 0
    ) {

      return '';

    }


    const totalMinutes =
      hours * 60
      +
      minutes
      +
      durationMinutes;


    const endHours =
      Math.floor(
        totalMinutes / 60
      ) % 24;


    const endMinutes =
      totalMinutes % 60;


    return (

      `${String(endHours)
        .padStart(2, '0')}:`
      +
      `${String(endMinutes)
        .padStart(2, '0')}`

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
        now.getMonth() + 1
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


    return (
      `${year}-${month}-${day}`
    );

  }

}