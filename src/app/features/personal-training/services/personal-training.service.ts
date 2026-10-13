import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  map,
  Observable
} from 'rxjs';

import {
  CreatePtPackageRequest,
  PtPackage,
  UpdatePtPackageRequest
} from '../models/pt-package.model';

import {
  CreatePtSubscriptionRequest,
  PtSubscription,
  PtSubscriptionStatus,
  UpdatePtSubscriptionRequest
} from '../models/pt-subscription.model';

import {
  CreatePtSessionRequest,
  PtSession,
  PtSessionStatus,
  UpdatePtSessionRequest
} from '../models/pt-session.model';

import {
  NotificationService
} from '../../../core/notifications/services/notification.service';


@Injectable({
  providedIn: 'root'
})
export class PersonalTrainingService {

  constructor(
    private readonly notificationService: NotificationService
  ) {}


  // =====================================================
  // PT PACKAGES
  // =====================================================

  private readonly packagesSubject =
    new BehaviorSubject<PtPackage[]>([

      {
        packageId: 1,
        tenantId: 1,
        locationId: 1,

        packageName:
          'Starter PT',

        description:
          'Personal training starter package for new clients.',

        totalSessions: 5,

        validityDays: 30,

        price: 3500,

        sessionDurationMinutes: 60,

        packageType:
          'individual',

        maxGroupSize: null,

        isActive: true
      },

      {
        packageId: 2,
        tenantId: 1,
        locationId: 1,

        packageName:
          'Transformation 12',

        description:
          'Twelve one-to-one personal training sessions.',

        totalSessions: 12,

        validityDays: 60,

        price: 7800,

        sessionDurationMinutes: 60,

        packageType:
          'individual',

        maxGroupSize: null,

        isActive: true
      },

      {
        packageId: 3,
        tenantId: 1,
        locationId: 1,

        packageName:
          'Partner Training',

        description:
          'Personal training package for two clients.',

        totalSessions: 8,

        validityDays: 45,

        price: 5200,

        sessionDurationMinutes: 60,

        packageType:
          'group',

        maxGroupSize: 2,

        isActive: true
      },

      {
        packageId: 4,
        tenantId: 1,
        locationId: 1,

        packageName:
          'Elite PT 20',

        description:
          'Twenty session advanced transformation package.',

        totalSessions: 20,

        validityDays: 90,

        price: 12000,

        sessionDurationMinutes: 60,

        packageType:
          'individual',

        maxGroupSize: null,

        isActive: true
      }

    ]);


  readonly packages$ =
    this.packagesSubject
      .asObservable();


  // =====================================================
  // PT SUBSCRIPTIONS
  // =====================================================

  private readonly subscriptionsSubject =
    new BehaviorSubject<PtSubscription[]>([

      {
        ptSubscriptionId: 1,

        tenantId: 1,

        memberId: 1,

        packageId: 2,

        trainerId: 1,

        purchaseDate:
          '2026-09-15',

        startDate:
          '2026-09-16',

        endDate:
          '2026-11-14',

        totalSessions: 12,

        completedSessions: 4,

        remainingSessions: 8,

        status:
          'Active'
      },

      {
        ptSubscriptionId: 2,

        tenantId: 1,

        memberId: 5,

        packageId: 1,

        trainerId: 3,

        purchaseDate:
          '2026-09-28',

        startDate:
          '2026-09-29',

        endDate:
          '2026-10-28',

        totalSessions: 5,

        completedSessions: 2,

        remainingSessions: 3,

        status:
          'Active'
      }

    ]);


  readonly subscriptions$ =
    this.subscriptionsSubject
      .asObservable();


  // =====================================================
  // PT SESSIONS
  // =====================================================

  private readonly sessionsSubject =
    new BehaviorSubject<PtSession[]>([]);


  readonly sessions$ =
    this.sessionsSubject
      .asObservable();


  // =====================================================
  // PACKAGE - GET ALL
  // =====================================================

  getPackages(
    tenantId: number
  ): Observable<PtPackage[]> {

    return this.packages$
      .pipe(

        map(
          packages =>

            packages
              .filter(
                item =>
                  item.tenantId ===
                  tenantId
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.packageName
                    .localeCompare(
                      b.packageName
                    )
              )

        )

      );

  }


  // =====================================================
  // PACKAGE - SNAPSHOT
  // =====================================================

  getPackagesSnapshot(
    tenantId: number
  ): PtPackage[] {

    return this.packagesSubject
      .value
      .filter(
        item =>
          item.tenantId ===
          tenantId
      )
      .sort(
        (
          a,
          b
        ) =>
          a.packageName
            .localeCompare(
              b.packageName
            )
      );

  }


  // =====================================================
  // PACKAGE - ACTIVE
  // =====================================================

  getActivePackages(
    tenantId: number
  ): Observable<PtPackage[]> {

    return this.getPackages(
      tenantId
    )
      .pipe(

        map(
          packages =>
            packages.filter(
              item =>
                item.isActive
            )
        )

      );

  }


  getActivePackagesSnapshot(
    tenantId: number
  ): PtPackage[] {

    return this.getPackagesSnapshot(
      tenantId
    )
      .filter(
        item =>
          item.isActive
      );

  }


  // =====================================================
  // PACKAGE - GET ONE
  // =====================================================

  getPackageById(
    packageId: number,
    tenantId: number
  ): PtPackage | undefined {

    return this.packagesSubject
      .value
      .find(
        item =>

          item.packageId ===
            packageId

          &&

          item.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // PACKAGE - CREATE
  // =====================================================

  createPackage(
    request:
      CreatePtPackageRequest
  ): PtPackage {

    this.validatePackage(
      request
    );


    const packages =
      this.packagesSubject
        .value;


    const nextId =

      packages.length === 0

        ? 1

        : Math.max(
            ...packages.map(
              item =>
                item.packageId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const newPackage:
      PtPackage = {

      packageId:
        nextId,

      tenantId:
        request.tenantId,

      locationId:
        request.locationId,

      packageName:
        request.packageName
          .trim(),

      description:
        request.description
          ?.trim()
          || null,

      totalSessions:
        request.totalSessions,

      validityDays:
        request.validityDays,

      price:
        request.price,

      sessionDurationMinutes:
        request.sessionDurationMinutes,

      packageType:
        request.packageType,

      maxGroupSize:
        request.packageType ===
          'group'
          ? request.maxGroupSize
          : null,

      isActive:
        request.isActive,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.packagesSubject
      .next([

        ...packages,

        newPackage

      ]);


    this.showPtNotification(
      'success',
      newPackage.tenantId,
      'PT package created',
      `"${newPackage.packageName}" was created successfully.`,
      '/training/personal-training/packages'
    );

    return newPackage;

  }


  // =====================================================
  // PACKAGE - UPDATE
  // =====================================================

  updatePackage(
    request:
      UpdatePtPackageRequest
  ): PtPackage {

    this.validatePackage(
      request
    );


    const packages =
      [
        ...this.packagesSubject
          .value
      ];


    const index =
      packages.findIndex(
        item =>

          item.packageId ===
            request.packageId

          &&

          item.tenantId ===
            request.tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT package not found.'
      );

    }


    const existing =
      packages[index];


    const updated:
      PtPackage = {

      ...existing,

      locationId:
        request.locationId,

      packageName:
        request.packageName
          .trim(),

      description:
        request.description
          ?.trim()
          || null,

      totalSessions:
        request.totalSessions,

      validityDays:
        request.validityDays,

      price:
        request.price,

      sessionDurationMinutes:
        request.sessionDurationMinutes,

      packageType:
        request.packageType,

      maxGroupSize:
        request.packageType ===
          'group'
          ? request.maxGroupSize
          : null,

      isActive:
        request.isActive,

      updatedAt:
        new Date()
          .toISOString()

    };


    packages[index] =
      updated;


    this.packagesSubject
      .next(
        packages
      );


    this.showPtNotification(
      'success',
      updated.tenantId,
      'PT package updated',
      `"${updated.packageName}" was updated successfully.`,
      '/training/personal-training/packages'
    );

    return updated;

  }


  // =====================================================
  // PACKAGE - TOGGLE STATUS
  // =====================================================

  togglePackageStatus(
    packageId: number,
    tenantId: number
  ): void {

    const packages =
      [
        ...this.packagesSubject
          .value
      ];


    const index =
      packages.findIndex(
        item =>

          item.packageId ===
            packageId

          &&

          item.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT package not found.'
      );

    }


    packages[index] = {

      ...packages[index],

      isActive:
        !packages[index]
          .isActive,

      updatedAt:
        new Date()
          .toISOString()

    };


    this.packagesSubject
      .next(
        packages
      );

    const updatedPackage = packages[index];

    this.showPtNotification(
      updatedPackage.isActive ? 'success' : 'warning',
      updatedPackage.tenantId,
      updatedPackage.isActive
        ? 'PT package activated'
        : 'PT package deactivated',
      `"${updatedPackage.packageName}" was ${updatedPackage.isActive ? 'activated' : 'deactivated'}.`,
      '/training/personal-training/packages'
    );

  }


  // =====================================================
  // PACKAGE - VALIDATION
  // =====================================================

  private validatePackage(
    request:
      CreatePtPackageRequest
  ): void {

    if (
      !request.packageName
        .trim()
    ) {

      throw new Error(
        'Package name is required.'
      );

    }


    if (
      request.packageName
        .trim()
        .length > 200
    ) {

      throw new Error(
        'Package name cannot exceed 200 characters.'
      );

    }


    if (
      request.totalSessions <= 0
    ) {

      throw new Error(
        'Total sessions must be greater than zero.'
      );

    }


    if (
      request.validityDays <= 0
    ) {

      throw new Error(
        'Validity must be greater than zero.'
      );

    }


    if (
      request.price < 0
    ) {

      throw new Error(
        'Price cannot be negative.'
      );

    }


    if (
      request.sessionDurationMinutes
        <= 0
    ) {

      throw new Error(
        'Session duration must be greater than zero.'
      );

    }


    if (
      request.packageType ===
        'group'

      &&

      (
        request.maxGroupSize ===
          null

        ||

        request.maxGroupSize < 2
      )
    ) {

      throw new Error(
        'Group packages must allow at least two clients.'
      );

    }

  }


  // =====================================================
  // SUBSCRIPTIONS - GET ALL
  // =====================================================

  getSubscriptions(
    tenantId: number
  ): Observable<PtSubscription[]> {

    return this.subscriptions$
      .pipe(

        map(
          subscriptions =>

            subscriptions
              .filter(
                item =>
                  item.tenantId ===
                  tenantId
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  b.startDate
                    .localeCompare(
                      a.startDate
                    )
              )

        )

      );

  }


  // =====================================================
  // SUBSCRIPTIONS - SNAPSHOT
  // =====================================================

  getSubscriptionsSnapshot(
    tenantId: number
  ): PtSubscription[] {

    return this.subscriptionsSubject
      .value
      .filter(
        item =>
          item.tenantId ===
          tenantId
      );

  }


  // =====================================================
  // ACTIVE SUBSCRIPTIONS
  // =====================================================

  getActiveSubscriptionsSnapshot(
    tenantId: number
  ): PtSubscription[] {

    return this.getSubscriptionsSnapshot(
      tenantId
    )
      .filter(
        item =>
          item.status ===
          'Active'
          &&
          item.remainingSessions > 0
      );

  }


  // =====================================================
  // SUBSCRIPTIONS - GET ONE
  // =====================================================

  getSubscriptionById(
    ptSubscriptionId: number,
    tenantId: number
  ): PtSubscription | undefined {

    return this.subscriptionsSubject
      .value
      .find(
        item =>

          item.ptSubscriptionId ===
            ptSubscriptionId

          &&

          item.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // SUBSCRIPTIONS - CREATE
  // =====================================================

  createSubscription(
    request:
      CreatePtSubscriptionRequest
  ): PtSubscription {

    this.validateSubscription(
      request
    );


    this.validateDuplicateSubscription(
      request
    );


    const subscriptions =
      this.subscriptionsSubject
        .value;


    const nextId =

      subscriptions.length === 0

        ? 1

        : Math.max(
            ...subscriptions.map(
              item =>
                item.ptSubscriptionId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const subscription:
      PtSubscription = {

      ptSubscriptionId:
        nextId,

      tenantId:
        request.tenantId,

      memberId:
        request.memberId,

      packageId:
        request.packageId,

      trainerId:
        request.trainerId,

      purchaseDate:
        request.purchaseDate,

      startDate:
        request.startDate,

      endDate:
        request.endDate,

      totalSessions:
        request.totalSessions,

      completedSessions:
        request.completedSessions,

      remainingSessions:
        request.remainingSessions,

      status:
        request.status,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.subscriptionsSubject
      .next([

        ...subscriptions,

        subscription

      ]);


    this.showPtNotification(
      'success',
      subscription.tenantId,
      'PT client assigned',
      'The member was assigned to a PT package successfully.',
      `/training/personal-training/clients/${subscription.ptSubscriptionId}/edit`
    );

    this.syncPtSubscriptionActions(subscription);

    return subscription;

  }


  // =====================================================
  // SUBSCRIPTIONS - UPDATE
  // =====================================================

  updateSubscription(
    request:
      UpdatePtSubscriptionRequest
  ): PtSubscription {

    this.validateSubscription(
      request
    );


    this.validateDuplicateSubscription(
      request,
      request.ptSubscriptionId
    );


    const subscriptions =
      [
        ...this.subscriptionsSubject
          .value
      ];


    const index =
      subscriptions.findIndex(
        item =>

          item.ptSubscriptionId ===
            request.ptSubscriptionId

          &&

          item.tenantId ===
            request.tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    const existing =
      subscriptions[index];


    const updated:
      PtSubscription = {

      ...existing,

      memberId:
        request.memberId,

      packageId:
        request.packageId,

      trainerId:
        request.trainerId,

      purchaseDate:
        request.purchaseDate,

      startDate:
        request.startDate,

      endDate:
        request.endDate,

      totalSessions:
        request.totalSessions,

      completedSessions:
        request.completedSessions,

      remainingSessions:
        request.remainingSessions,

      status:
        request.status,

      updatedAt:
        new Date()
          .toISOString()

    };


    subscriptions[index] =
      updated;


    this.subscriptionsSubject
      .next(
        subscriptions
      );


    this.showPtNotification(
      'success',
      updated.tenantId,
      'PT client updated',
      'The PT client assignment was updated successfully.',
      `/training/personal-training/clients/${updated.ptSubscriptionId}/edit`
    );

    this.syncPtSubscriptionActions(updated);

    return updated;

  }


  // =====================================================
  // SUBSCRIPTION STATUS
  // =====================================================

  updateSubscriptionStatus(
    ptSubscriptionId: number,
    tenantId: number,
    status:
      PtSubscriptionStatus
  ): void {

    const subscriptions =
      [
        ...this.subscriptionsSubject
          .value
      ];


    const index =
      subscriptions.findIndex(
        item =>

          item.ptSubscriptionId ===
            ptSubscriptionId

          &&

          item.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    subscriptions[index] = {

      ...subscriptions[index],

      status,

      updatedAt:
        new Date()
          .toISOString()

    };


    this.subscriptionsSubject
      .next(
        subscriptions
      );

    const updatedSubscription = subscriptions[index];

    this.showPtNotification(
      status === 'Cancelled' || status === 'Expired' ? 'warning' : 'info',
      updatedSubscription.tenantId,
      'PT client status updated',
      `PT subscription status changed to ${status}.`,
      `/training/personal-training/clients/${updatedSubscription.ptSubscriptionId}/edit`
    );

    this.syncPtSubscriptionActions(updatedSubscription);

  }


  // =====================================================
  // MANUAL COMPLETE SESSION
  //
  // Kept for compatibility with existing code.
  // The PT Sessions module will normally handle this
  // automatically.
  // =====================================================

  completeSubscriptionSession(
    ptSubscriptionId: number,
    tenantId: number
  ): void {

    const subscription =
      this.getSubscriptionById(
        ptSubscriptionId,
        tenantId
      );


    if (!subscription) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    if (
      subscription.status !==
        'Active'
    ) {

      throw new Error(
        'Only active PT subscriptions can record sessions.'
      );

    }


    if (
      subscription.remainingSessions
        <= 0
    ) {

      throw new Error(
        'No PT sessions remaining.'
      );

    }


    this.adjustSubscriptionSessionBalance(
      ptSubscriptionId,
      1
    );

    const updatedSubscription =
      this.getSubscriptionById(ptSubscriptionId, tenantId);

    if (updatedSubscription) {
      this.showPtNotification(
        'success',
        tenantId,
        'PT session completed',
        'A PT session was recorded as completed.',
        `/training/personal-training/clients/${ptSubscriptionId}/edit`
      );

      this.syncPtSubscriptionActions(updatedSubscription);
    }

  }


  // =====================================================
  // SUBSCRIPTION END DATE
  // =====================================================

  calculateEndDate(
    startDate: string,
    validityDays: number
  ): string {

    if (
      !startDate
      ||
      validityDays <= 0
    ) {

      return '';

    }


    const date =
      this.parseDate(
        startDate
      );


    date.setDate(
      date.getDate()
      +
      validityDays
      -
      1
    );


    return this.formatDate(
      date
    );

  }


  // =====================================================
  // SUBSCRIPTION VALIDATION
  // =====================================================

  private validateSubscription(
    request:
      CreatePtSubscriptionRequest
  ): void {

    if (
      !Number.isFinite(
        request.memberId
      )
      ||
      request.memberId <= 0
    ) {

      throw new Error(
        'Member is required.'
      );

    }


    if (
      !Number.isFinite(
        request.packageId
      )
      ||
      request.packageId <= 0
    ) {

      throw new Error(
        'PT package is required.'
      );

    }


    if (
      !Number.isFinite(
        request.trainerId
      )
      ||
      request.trainerId <= 0
    ) {

      throw new Error(
        'Trainer is required.'
      );

    }


    if (
      !request.purchaseDate
    ) {

      throw new Error(
        'Purchase date is required.'
      );

    }


    if (
      !request.startDate
    ) {

      throw new Error(
        'Start date is required.'
      );

    }


    if (
      !request.endDate
    ) {

      throw new Error(
        'End date is required.'
      );

    }


    if (
      request.startDate
      <
      request.purchaseDate
    ) {

      throw new Error(
        'Start date cannot be before the purchase date.'
      );

    }


    if (
      request.endDate
      <
      request.startDate
    ) {

      throw new Error(
        'End date cannot be before the start date.'
      );

    }


    if (
      request.totalSessions <= 0
    ) {

      throw new Error(
        'Total sessions must be greater than zero.'
      );

    }


    if (
      request.completedSessions < 0
    ) {

      throw new Error(
        'Completed sessions cannot be negative.'
      );

    }


    if (
      request.completedSessions
      >
      request.totalSessions
    ) {

      throw new Error(
        'Completed sessions cannot exceed total sessions.'
      );

    }


    if (
      request.remainingSessions < 0
    ) {

      throw new Error(
        'Remaining sessions cannot be negative.'
      );

    }


    if (
      request.completedSessions
      +
      request.remainingSessions
      !==
      request.totalSessions
    ) {

      throw new Error(
        'Completed and remaining sessions do not match the package total.'
      );

    }

  }


  // =====================================================
  // DUPLICATE ACTIVE SUBSCRIPTION
  // =====================================================

  private validateDuplicateSubscription(
    request:
      CreatePtSubscriptionRequest,
    ignoreSubscriptionId:
      number | null =
        null
  ): void {

    if (
      request.status !==
        'Active'
    ) {

      return;

    }


    const duplicate =
      this.subscriptionsSubject
        .value
        .some(
          item =>

            item.tenantId ===
              request.tenantId

            &&

            item.memberId ===
              request.memberId

            &&

            item.status ===
              'Active'

            &&

            item.ptSubscriptionId !==
              ignoreSubscriptionId
        );


    if (
      duplicate
    ) {

      throw new Error(
        'This member already has an active PT subscription.'
      );

    }

  }


  // =====================================================
  // SESSION - GET ALL
  // =====================================================

  getSessions(
    tenantId: number
  ): Observable<PtSession[]> {

    return this.sessions$
      .pipe(

        map(
          sessions =>

            sessions
              .filter(
                session =>
                  this.sessionBelongsToTenant(
                    session,
                    tenantId
                  )
              )
              .sort(
                (
                  a,
                  b
                ) => {

                  const dateCompare =
                    b.sessionDate
                      .localeCompare(
                        a.sessionDate
                      );


                  if (
                    dateCompare !== 0
                  ) {

                    return dateCompare;

                  }


                  return b.startTime
                    .localeCompare(
                      a.startTime
                    );

                }
              )

        )

      );

  }


  // =====================================================
  // SESSION - SNAPSHOT
  // =====================================================

  getSessionsSnapshot(
    tenantId: number
  ): PtSession[] {

    return this.sessionsSubject
      .value
      .filter(
        session =>
          this.sessionBelongsToTenant(
            session,
            tenantId
          )
      );

  }


  // =====================================================
  // SESSION - GET ONE
  // =====================================================

  getSessionById(
    sessionId: number,
    tenantId: number
  ): PtSession | undefined {

    return this.sessionsSubject
      .value
      .find(
        session =>

          session.sessionId ===
            sessionId

          &&

          this.sessionBelongsToTenant(
            session,
            tenantId
          )
      );

  }


  // =====================================================
  // SESSION - CREATE
  // =====================================================

  createSession(
    request:
      CreatePtSessionRequest,
    tenantId: number
  ): PtSession {

    const subscription =
      this.getSubscriptionById(
        request.ptSubscriptionId,
        tenantId
      );


    if (!subscription) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    this.validateSession(
      request,
      subscription
    );


    this.validateTrainerConflict(
      request
    );


    const sessions =
      this.sessionsSubject
        .value;


    const nextId =

      sessions.length === 0

        ? 1

        : Math.max(
            ...sessions.map(
              item =>
                item.sessionId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const session:
      PtSession = {

      sessionId:
        nextId,

      ptSubscriptionId:
        request.ptSubscriptionId,

      trainerId:
        request.trainerId,

      sessionDate:
        request.sessionDate,

      startTime:
        request.startTime,

      endTime:
        request.endTime,

      status:
        request.status,

      notes:
        request.notes
          ?.trim()
          || null,

      exercisesPerformed:
        request.exercisesPerformed
          ?.trim()
          || null,

      feedback:
        request.feedback
          ?.trim()
          || null,

      createdAt:
        now,

      updatedAt:
        now

    };


    /*
     * A session consumes one PT session only
     * when it becomes Completed.
     */
    if (
      session.status ===
        'Completed'
    ) {

      this.adjustSubscriptionSessionBalance(
        session.ptSubscriptionId,
        1
      );

    }


    this.sessionsSubject
      .next([

        ...sessions,

        session

      ]);


    this.notifySessionCreated(session, tenantId);

    const updatedSubscription =
      this.getSubscriptionById(session.ptSubscriptionId, tenantId);

    if (updatedSubscription) {
      this.syncPtSubscriptionActions(updatedSubscription);
    }

    return session;

  }


  // =====================================================
  // SESSION - UPDATE
  // =====================================================

  updateSession(
    request:
      UpdatePtSessionRequest,
    tenantId: number
  ): PtSession {

    const sessions =
      [
        ...this.sessionsSubject
          .value
      ];


    const index =
      sessions.findIndex(
        session =>

          session.sessionId ===
            request.sessionId

          &&

          this.sessionBelongsToTenant(
            session,
            tenantId
          )
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT session not found.'
      );

    }


    const existing =
      sessions[index];


    const oldSubscription =
      this.getSubscriptionById(
        existing.ptSubscriptionId,
        tenantId
      );


    const newSubscription =
      this.getSubscriptionById(
        request.ptSubscriptionId,
        tenantId
      );


    if (
      !oldSubscription
      ||
      !newSubscription
    ) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    /*
     * If the session is already completed,
     * temporarily restore the old subscription
     * balance before validating the replacement.
     *
     * This prevents a completed edit from being
     * blocked simply because remaining sessions
     * is currently zero.
     */
    const wasCompleted =
      existing.status ===
      'Completed';


    const willBeCompleted =
      request.status ===
      'Completed';


    if (wasCompleted) {

      this.adjustSubscriptionSessionBalance(
        existing.ptSubscriptionId,
        -1
      );

    }


    let updated: PtSession;

    try {

      const refreshedSubscription =
        this.getSubscriptionById(
          request.ptSubscriptionId,
          tenantId
        );


      if (!refreshedSubscription) {

        throw new Error(
          'PT subscription not found.'
        );

      }


      this.validateSession(
        request,
        refreshedSubscription
      );


      this.validateTrainerConflict(
        request,
        request.sessionId
      );


      if (willBeCompleted) {

        this.adjustSubscriptionSessionBalance(
          request.ptSubscriptionId,
          1
        );

      }


      updated = {

        ...existing,

        ptSubscriptionId:
          request.ptSubscriptionId,

        trainerId:
          request.trainerId,

        sessionDate:
          request.sessionDate,

        startTime:
          request.startTime,

        endTime:
          request.endTime,

        status:
          request.status,

        notes:
          request.notes
            ?.trim()
            || null,

        exercisesPerformed:
          request.exercisesPerformed
            ?.trim()
            || null,

        feedback:
          request.feedback
            ?.trim()
            || null,

        updatedAt:
          new Date()
            .toISOString()

      };


      sessions[index] =
        updated;


      this.sessionsSubject
        .next(
          sessions
        );

    }

    catch (error) {

      /*
       * Restore original session balance when
       * validation/update fails.
       */
      if (wasCompleted) {

        this.adjustSubscriptionSessionBalance(
          existing.ptSubscriptionId,
          1
        );

      }


      throw error;

    }

    this.notifySessionUpdated(existing, updated, tenantId);

    const updatedSubscription =
      this.getSubscriptionById(updated.ptSubscriptionId, tenantId);

    if (updatedSubscription) {
      this.syncPtSubscriptionActions(updatedSubscription);
    }

    if (existing.ptSubscriptionId !== updated.ptSubscriptionId) {
      const previousSubscription =
        this.getSubscriptionById(existing.ptSubscriptionId, tenantId);

      if (previousSubscription) {
        this.syncPtSubscriptionActions(previousSubscription);
      }
    }

    return updated;

  }


  // =====================================================
  // SESSION - DELETE
  // =====================================================

  deleteSession(
    sessionId: number,
    tenantId: number
  ): void {

    const sessions =
      this.sessionsSubject
        .value;


    const session =
      sessions.find(
        item =>

          item.sessionId ===
            sessionId

          &&

          this.sessionBelongsToTenant(
            item,
            tenantId
          )
      );


    if (!session) {

      throw new Error(
        'PT session not found.'
      );

    }


    /*
     * Removing a completed session must restore
     * the subscription session balance.
     */
    if (
      session.status ===
        'Completed'
    ) {

      this.adjustSubscriptionSessionBalance(
        session.ptSubscriptionId,
        -1
      );

    }


    this.sessionsSubject
      .next(

        sessions.filter(
          item =>
            item.sessionId !==
            sessionId
        )

      );

    this.showPtNotification(
      'warning',
      tenantId,
      'PT session deleted',
      `PT session on ${session.sessionDate} was deleted.`,
      '/training/personal-training/sessions'
    );

    const updatedSubscription =
      this.getSubscriptionById(session.ptSubscriptionId, tenantId);

    if (updatedSubscription) {
      this.syncPtSubscriptionActions(updatedSubscription);
    }

  }


  // =====================================================
  // SESSION - STATUS UPDATE
  // =====================================================

  updateSessionStatus(
    sessionId: number,
    tenantId: number,
    status:
      PtSessionStatus
  ): PtSession {

    const existing =
      this.getSessionById(
        sessionId,
        tenantId
      );


    if (!existing) {

      throw new Error(
        'PT session not found.'
      );

    }


    return this.updateSession(
      {

        sessionId:
          existing.sessionId,

        ptSubscriptionId:
          existing.ptSubscriptionId,

        trainerId:
          existing.trainerId,

        sessionDate:
          existing.sessionDate,

        startTime:
          existing.startTime,

        endTime:
          existing.endTime,

        status,

        notes:
          existing.notes,

        exercisesPerformed:
          existing.exercisesPerformed,

        feedback:
          existing.feedback

      },
      tenantId
    );

  }


  // =====================================================
  // SESSION VALIDATION
  // =====================================================

  private validateSession(
    request:
      CreatePtSessionRequest,
    subscription:
      PtSubscription
  ): void {

    if (
      !Number.isFinite(
        request.ptSubscriptionId
      )
      ||
      request.ptSubscriptionId <= 0
    ) {

      throw new Error(
        'PT client is required.'
      );

    }


    if (
      !Number.isFinite(
        request.trainerId
      )
      ||
      request.trainerId <= 0
    ) {

      throw new Error(
        'Trainer is required.'
      );

    }


    if (
      subscription.trainerId ===
      null
    ) {

      throw new Error(
        'This PT client does not have an assigned trainer.'
      );

    }


    if (
      request.trainerId !==
      subscription.trainerId
    ) {

      throw new Error(
        'Session trainer must match the trainer assigned to the PT client.'
      );

    }


    if (
      subscription.status !==
        'Active'
    ) {

      throw new Error(
        'Sessions can only be scheduled for active PT subscriptions.'
      );

    }


    if (
      subscription.remainingSessions
        <= 0
    ) {

      throw new Error(
        'This PT subscription has no remaining sessions.'
      );

    }


    if (
      !request.sessionDate
    ) {

      throw new Error(
        'Session date is required.'
      );

    }


    if (
      request.sessionDate
      <
      subscription.startDate
    ) {

      throw new Error(
        'Session date cannot be before the PT subscription start date.'
      );

    }


    if (
      request.sessionDate
      >
      subscription.endDate
    ) {

      throw new Error(
        'Session date cannot be after the PT subscription end date.'
      );

    }


    if (
      !request.startTime
    ) {

      throw new Error(
        'Start time is required.'
      );

    }


    if (
      !request.endTime
    ) {

      throw new Error(
        'End time is required.'
      );

    }


    if (
      request.endTime
      <=
      request.startTime
    ) {

      throw new Error(
        'End time must be later than start time.'
      );

    }


    const validStatuses:
      PtSessionStatus[] = [

        'Scheduled',
        'Completed',
        'Cancelled',
        'No Show'

      ];


    if (
      !validStatuses.includes(
        request.status
      )
    ) {

      throw new Error(
        'Invalid PT session status.'
      );

    }

  }


  // =====================================================
  // TRAINER SCHEDULE CONFLICT
  // =====================================================

  private validateTrainerConflict(
    request:
      CreatePtSessionRequest,
    ignoreSessionId:
      number | null =
        null
  ): void {

    /*
     * Cancelled and No Show sessions
     * do not block trainer availability.
     */
    if (
      request.status ===
        'Cancelled'
      ||
      request.status ===
        'No Show'
    ) {

      return;

    }


    const conflictingSession =
      this.sessionsSubject
        .value
        .some(
          session => {

            if (
              session.sessionId ===
              ignoreSessionId
            ) {

              return false;

            }


            if (
              session.trainerId !==
              request.trainerId
            ) {

              return false;

            }


            if (
              session.sessionDate !==
              request.sessionDate
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


            /*
             * Time overlap:
             *
             * NewStart < ExistingEnd
             * AND
             * NewEnd > ExistingStart
             */
            return (

              request.startTime
              <
              session.endTime

              &&

              request.endTime
              >
              session.startTime

            );

          }
        );


    if (
      conflictingSession
    ) {

      throw new Error(
        'The assigned trainer already has another PT session during this time.'
      );

    }

  }


  // =====================================================
  // SUBSCRIPTION SESSION BALANCE
  //
  // direction = 1
  //   Completed session added
  //
  // direction = -1
  //   Completed session removed/reverted
  // =====================================================

  private adjustSubscriptionSessionBalance(
    ptSubscriptionId: number,
    direction:
      1 | -1
  ): void {

    const subscriptions =
      [
        ...this.subscriptionsSubject
          .value
      ];


    const index =
      subscriptions.findIndex(
        item =>
          item.ptSubscriptionId ===
          ptSubscriptionId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'PT subscription not found.'
      );

    }


    const subscription =
      subscriptions[index];


    // ===================================================
    // COMPLETE ONE SESSION
    // ===================================================

    if (
      direction === 1
    ) {

      if (
        subscription.remainingSessions
        <= 0
      ) {

        throw new Error(
          'No PT sessions remaining.'
        );

      }


      const completedSessions =
        subscription.completedSessions
        + 1;


      const remainingSessions =
        Math.max(
          subscription.totalSessions
          -
          completedSessions,
          0
        );


      subscriptions[index] = {

        ...subscription,

        completedSessions,

        remainingSessions,

        status:
          remainingSessions === 0
            ? 'Completed'
            : subscription.status,

        updatedAt:
          new Date()
            .toISOString()

      };

    }


    // ===================================================
    // RESTORE ONE SESSION
    // ===================================================

    else {

      const completedSessions =
        Math.max(
          subscription.completedSessions
          -
          1,
          0
        );


      const remainingSessions =
        Math.min(
          subscription.totalSessions
          -
          completedSessions,
          subscription.totalSessions
        );


      subscriptions[index] = {

        ...subscription,

        completedSessions,

        remainingSessions,

        /*
         * If the subscription was automatically
         * completed because all sessions were used,
         * restoring a session makes it active again.
         */
        status:
          subscription.status ===
            'Completed'
            &&
          remainingSessions > 0

            ? 'Active'

            : subscription.status,

        updatedAt:
          new Date()
            .toISOString()

      };

    }


    this.subscriptionsSubject
      .next(
        subscriptions
      );

  }


  // =====================================================
  // SESSION TENANT CHECK
  // =====================================================

  private sessionBelongsToTenant(
    session:
      PtSession,
    tenantId:
      number
  ): boolean {

    const subscription =
      this.subscriptionsSubject
        .value
        .find(
          item =>
            item.ptSubscriptionId ===
            session.ptSubscriptionId
        );


    return (
      subscription?.tenantId ===
      tenantId
    );

  }


  // =====================================================
  // PT NOTIFICATIONS
  // =====================================================

  private showPtNotification(
    severity: 'success' | 'info' | 'warning' | 'danger',
    tenantId: number,
    subject: string,
    message: string,
    route: string | null = null
  ): void {
    const request = {
      tenantId,
      source: 'personal-training' as const,
      subject,
      message,
      route,
      priority: 'normal' as const,
      actionRequired: false,
      showToast: true,
      toastDurationMs: 5000
    };

    switch (severity) {
      case 'success':
        this.notificationService.success(request);
        break;
      case 'info':
        this.notificationService.info(request);
        break;
      case 'warning':
        this.notificationService.warning(request);
        break;
      case 'danger':
        this.notificationService.danger(request);
        break;
    }
  }


  // =====================================================
  // PT SUBSCRIPTION ACTION NOTIFICATIONS
  // =====================================================

  private syncPtSubscriptionActions(
    subscription: PtSubscription
  ): void {
    const clientRoute =
      `/training/personal-training/clients/${subscription.ptSubscriptionId}/edit`;
    const sessionsActionKey =
      `pt-subscription:${subscription.ptSubscriptionId}:sessions`;
    const expiryActionKey =
      `pt-subscription:${subscription.ptSubscriptionId}:expiry`;

    if (
      subscription.status === 'Cancelled'
      || subscription.status === 'Expired'
    ) {
      this.notificationService.resolveAction(sessionsActionKey);
      this.notificationService.resolveAction(expiryActionKey);
      return;
    }

    if (subscription.remainingSessions === 0) {
      this.notificationService.warning({
        tenantId: subscription.tenantId,
        source: 'personal-training' as const,
        subject: 'PT sessions completed',
        message:
          'This PT client has used all available sessions. Review or renew the PT package.',
        route: clientRoute,
        priority: 'high',
        actionRequired: true,
        actionKey: sessionsActionKey,
        showToast: false
      });
    }
    else if (
      subscription.status === 'Active'
      && subscription.remainingSessions <= 2
    ) {
      this.notificationService.warning({
        tenantId: subscription.tenantId,
        source: 'personal-training' as const,
        subject: 'PT sessions running low',
        message:
          `${subscription.remainingSessions} PT session${subscription.remainingSessions === 1 ? '' : 's'} remaining. Review the client package.`,
        route: clientRoute,
        priority: 'high',
        actionRequired: true,
        actionKey: sessionsActionKey,
        showToast: false
      });
    }
    else {
      this.notificationService.resolveAction(sessionsActionKey);
    }

    if (subscription.status !== 'Active') {
      this.notificationService.resolveAction(expiryActionKey);
      return;
    }

    const today = new Date();
    const endDate = this.parseDate(subscription.endDate);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    // Compare calendar days without daylight-saving time offsets.
    const daysUntilExpiry = Math.round(
      (
        Date.UTC(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        )
        - Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        )
      ) / millisecondsPerDay
    );

    if (daysUntilExpiry < 0) {
      this.notificationService.danger({
        tenantId: subscription.tenantId,
        source: 'personal-training' as const,
        subject: 'PT subscription expired',
        message:
          'An active PT subscription has passed its end date. Review the client subscription.',
        route: clientRoute,
        priority: 'critical',
        actionRequired: true,
        actionKey: expiryActionKey,
        showToast: false
      });
      return;
    }

    if (daysUntilExpiry <= 7) {
      this.notificationService.warning({
        tenantId: subscription.tenantId,
        source: 'personal-training' as const,
        subject: daysUntilExpiry === 0
          ? 'PT subscription expires today'
          : 'PT subscription expiring soon',
        message: daysUntilExpiry === 0
          ? 'This PT subscription expires today. Review or renew it.'
          : `This PT subscription expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.`,
        route: clientRoute,
        priority: daysUntilExpiry <= 1 ? 'critical' : 'high',
        actionRequired: true,
        actionKey: expiryActionKey,
        showToast: false
      });
      return;
    }

    this.notificationService.resolveAction(expiryActionKey);
  }


  // =====================================================
  // REFRESH PT ACTION NOTIFICATIONS
  // =====================================================

  refreshPtActionNotifications(tenantId: number): void {
    this.getSubscriptionsSnapshot(tenantId).forEach(
      subscription => this.syncPtSubscriptionActions(subscription)
    );
  }


  // =====================================================
  // SESSION NOTIFICATIONS
  // =====================================================

  private notifySessionCreated(
    session: PtSession,
    tenantId: number
  ): void {
    const route =
      `/training/personal-training/sessions/${session.sessionId}/edit`;

    switch (session.status) {
      case 'Completed':
        this.showPtNotification(
          'success', tenantId, 'PT session completed',
          `PT session on ${session.sessionDate} was completed successfully.`,
          route
        );
        break;
      case 'Cancelled':
        this.showPtNotification(
          'warning', tenantId, 'PT session cancelled',
          `PT session on ${session.sessionDate} was cancelled.`, route
        );
        break;
      case 'No Show':
        this.showPtNotification(
          'warning', tenantId, 'PT session marked no show',
          `PT session on ${session.sessionDate} was marked as a no-show.`,
          route
        );
        break;
      default:
        this.showPtNotification(
          'success', tenantId, 'PT session scheduled',
          `PT session scheduled for ${session.sessionDate} from ${session.startTime} to ${session.endTime}.`,
          route
        );
        break;
    }
  }


  private notifySessionUpdated(
    previous: PtSession,
    updated: PtSession,
    tenantId: number
  ): void {
    const route =
      `/training/personal-training/sessions/${updated.sessionId}/edit`;

    if (previous.status !== updated.status) {
      switch (updated.status) {
        case 'Completed':
          this.showPtNotification(
            'success', tenantId, 'PT session completed',
            `PT session on ${updated.sessionDate} was marked as completed.`,
            route
          );
          return;
        case 'Cancelled':
          this.showPtNotification(
            'warning', tenantId, 'PT session cancelled',
            `PT session on ${updated.sessionDate} was cancelled.`, route
          );
          return;
        case 'No Show':
          this.showPtNotification(
            'warning', tenantId, 'PT session marked no show',
            `PT session on ${updated.sessionDate} was marked as a no-show.`,
            route
          );
          return;
        case 'Scheduled':
          this.showPtNotification(
            'info', tenantId, 'PT session scheduled',
            `PT session on ${updated.sessionDate} is now scheduled.`, route
          );
          return;
      }
    }

    this.showPtNotification(
      'success', tenantId, 'PT session updated',
      `PT session on ${updated.sessionDate} was updated successfully.`, route
    );
  }



  // =====================================================
  // DATE HELPERS
  // =====================================================

  private parseDate(
    value: string
  ): Date {

    const [
      year,
      month,
      day
    ] =
      value
        .split('-')
        .map(Number);


    return new Date(
      year,
      month - 1,
      day
    );

  }


  private formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth()
        + 1
      )
        .padStart(
          2,
          '0'
        );


    const day =
      String(
        date.getDate()
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