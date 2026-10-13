import {
  Injectable,
  inject
} from '@angular/core';

import {
  Subscription,
  auditTime,
  combineLatest,
  timer
} from 'rxjs';

import {
  MemberRecord,
  MemberService
} from '../../../features/members/services/member.service';

import {
  PersonalTrainingService
} from '../../../features/personal-training/services/personal-training.service';

import {
  AppNotification,
  AppNotificationPriority,
  CreateAppNotificationRequest
} from '../models/notification.model';

import {
  NotificationService
} from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class ActionNotificationSyncService {

  private readonly memberService =
    inject(
      MemberService
    );

  private readonly personalTrainingService =
    inject(
      PersonalTrainingService
    );


  private readonly notificationService =
    inject(
      NotificationService
    );


  /*
   * Renewal reminders become actionable seven days
   * before expiry.
   */
  private readonly renewalReminderDays =
    7;


  /*
   * Do not let very old expired memberships dominate
   * the action centre forever.
   *
   * They remain visible in the Members module, but
   * the bell focuses on recently overdue renewals.
   */
  private readonly maximumRenewalOverdueDays =
    30;


  /*
   * Recheck dates hourly so an app left open overnight
   * will still update its due/overdue notifications.
   */
  private readonly refreshIntervalMs =
    60 * 60 * 1000;


  private started =
    false;


  private initialSyncComplete =
    false;


  private subscription:
    Subscription | null =
    null;


  start():
    void {

    if (
      this.started
    ) {

      return;
    }


    this.started =
      true;


    this.subscription =
      combineLatest([
        this.memberService.members$,

        timer(
          0,
          this.refreshIntervalMs
        )
      ])
        .subscribe(
          ([members]) => {

            this.syncMemberActions(
              members
            );

            this.initialSyncComplete =
              true;
          }
        );


    /*
     * PT actions are checked independently of member loading.
     * The first timer emission runs at startup; later emissions
     * recheck expiry dates even when no PT screen is open.
     *
     * Coalesce synchronous subscription updates so temporary
     * balance restoration/reapplication during a session edit
     * does not generate alerts for intermediate values.
     */
    this.subscription.add(
      combineLatest([
        this.personalTrainingService.subscriptions$
          .pipe(
            auditTime(0)
          ),
        timer(
          0,
          this.refreshIntervalMs
        )
      ])
        .subscribe(
          ([subscriptions]) => {

            /*
             * Use the tenant IDs carried by loaded PT records.
             * Each refresh filters its snapshot by that tenant
             * and writes tenant-scoped notifications.
             */
            const tenantIds =
              new Set<number>(
                subscriptions.map(
                  subscription => subscription.tenantId
                )
              );

            tenantIds.forEach(
              tenantId => {
                this.personalTrainingService
                  .refreshPtActionNotifications(
                    tenantId
                  );
              }
            );
          }
        )
    );
  }


  private syncMemberActions(
    members:
      MemberRecord[]
  ): void {

    const existingNotifications =
      this.notificationService
        .getNotificationsSnapshot();


    const existingByKey =
      new Map<
        string,
        AppNotification
      >();


    existingNotifications
      .forEach(
        notification => {

          if (
            notification.actionKey
          ) {

            existingByKey.set(
              notification.actionKey,
              notification
            );
          }
        }
      );


    const activeMemberActionKeys =
      new Set<string>();


    members.forEach(
      member => {

        /*
         * An intentionally inactive member should not
         * generate renewal/payment attention alerts.
         */
        if (
          member.status === 'Inactive'
        ) {

          return;
        }


        const renewalRequest =
          this.buildRenewalNotification(
            member
          );


        if (
          renewalRequest
          &&
          renewalRequest.actionKey
        ) {

          activeMemberActionKeys.add(
            renewalRequest.actionKey
          );


          this.upsertAction(
            renewalRequest,
            existingByKey
          );
        }


        const paymentRequest =
          this.buildPaymentNotification(
            member
          );


        if (
          paymentRequest
          &&
          paymentRequest.actionKey
        ) {

          activeMemberActionKeys.add(
            paymentRequest.actionKey
          );


          this.upsertAction(
            paymentRequest,
            existingByKey
          );
        }
      }
    );


    /*
     * Remove member actions whose condition has been
     * resolved.
     *
     * Other future notification categories are untouched.
     */
    existingNotifications
      .forEach(
        notification => {

          const key =
            notification.actionKey;


          if (
            !key
          ) {

            return;
          }


          const isMemberManagedAction =
            key.startsWith(
              'renewal-member-'
            )
            ||
            key.startsWith(
              'payment-member-'
            );


          if (
            !isMemberManagedAction
          ) {

            return;
          }


          if (
            activeMemberActionKeys.has(
              key
            )
          ) {

            return;
          }


          this.notificationService
            .resolveAction(
              key
            );
        }
      );
  }


  // =====================================================
  // RENEWAL RULE
  // =====================================================

  private buildRenewalNotification(
    member:
      MemberRecord
  ): CreateAppNotificationRequest | null {

    if (
      !member.expiryDate
    ) {

      return null;
    }


    const daysUntilExpiry =
      this.getCalendarDayDifference(
        member.expiryDate
      );


    if (
      daysUntilExpiry === null
    ) {

      return null;
    }


    /*
     * Too early.
     */
    if (
      daysUntilExpiry >
      this.renewalReminderDays
    ) {

      return null;
    }


    /*
     * Too old to remain in the action centre.
     */
    if (
      daysUntilExpiry <
      -this.maximumRenewalOverdueDays
    ) {

      return null;
    }


    const name =
      this.getMemberName(
        member
      );


    const actionKey =
      `renewal-member-${member.memberId}`;


    if (
      daysUntilExpiry < 0
    ) {

      const overdueDays =
        Math.abs(
          daysUntilExpiry
        );


      return {
        source:
          'renewals',

        severity:
          'danger',

        priority:
          'critical',

        subject:
          'Membership Renewal Overdue',

        message:
          `${name}'s ${member.planName} membership expired ${this.formatDays(overdueDays)} ago. Renewal is pending.`,

        route:
          `/members/${member.memberId}`,

        actionRequired:
          true,

        actionKey
      };
    }


    if (
      daysUntilExpiry === 0
    ) {

      return {
        source:
          'renewals',

        severity:
          'warning',

        priority:
          'high',

        subject:
          'Membership Renewal Due Today',

        message:
          `${name}'s ${member.planName} membership expires today.`,

        route:
          `/members/${member.memberId}`,

        actionRequired:
          true,

        actionKey
      };
    }


    const priority:
      AppNotificationPriority =
      daysUntilExpiry <= 3
        ? 'high'
        : 'normal';


    return {
      source:
        'renewals',

      severity:
        'warning',

      priority,

      subject:
        'Membership Renewal Due Soon',

      message:
        `${name}'s ${member.planName} membership expires in ${this.formatDays(daysUntilExpiry)}.`,

      route:
        `/members/${member.memberId}`,

      actionRequired:
        true,

      actionKey
    };
  }


  // =====================================================
  // PAYMENT RULE
  // =====================================================

  private buildPaymentNotification(
    member:
      MemberRecord
  ): CreateAppNotificationRequest | null {

    const membershipAmount =
      this.toAmount(
        member.membershipAmount
      );


    const amountPaid =
      this.toAmount(
        member.amountPaid
      );


    const storedBalance =
      this.toAmount(
        member.balanceAmount
      );


    const calculatedBalance =
      Math.max(
        0,
        membershipAmount
        -
        amountPaid
      );


    const balance =
      Math.max(
        storedBalance,
        calculatedBalance
      );


    const paymentIncomplete =
      member.paymentStatus === 'Partial'
      ||
      member.paymentStatus === 'Pending'
      ||
      balance > 0;


    if (
      !paymentIncomplete
    ) {

      return null;
    }


    const name =
      this.getMemberName(
        member
      );


    const amountMessage =
      balance > 0
        ? `${this.formatCurrency(balance)} is pending from ${name}.`
        : `Payment is marked ${member.paymentStatus ?? 'Pending'} for ${name}.`;


    return {
      source:
        'accounts',

      severity:
        'warning',

      priority:
        'high',

      subject:
        'Payment Pending',

      message:
        `${amountMessage} ${member.planName} membership.`,

      /*
       * Existing Collect Payment action already opens
       * this page.
       */
      route:
        '/accounts/invoices/new',

      actionRequired:
        true,

      actionKey:
        `payment-member-${member.memberId}`
    };
  }


  // =====================================================
  // UPSERT + TOAST POLICY
  // =====================================================

  private upsertAction(
    request:
      CreateAppNotificationRequest,
    existingByKey:
      Map<
        string,
        AppNotification
      >
  ): void {

    const actionKey =
      request.actionKey
      ??
      null;


    const existing =
      actionKey
        ? existingByKey.get(
            actionKey
          )
        : undefined;


    /*
     * Never flood the user with multiple popup alerts
     * when the app initially loads.
     *
     * Afterwards, toast when:
     * - a genuinely new action appears
     * - its priority escalates
     * - its meaningful text changes
     */
    const materiallyChanged =
      !existing
      ||
      existing.priority !== request.priority
      ||
      existing.subject !== request.subject
      ||
      existing.message !== request.message;


    const showToast =
      this.initialSyncComplete
      &&
      materiallyChanged;


    const result =
      this.notificationService
        .notify({
          ...request,
          showToast
        });


    if (
      result.actionKey
    ) {

      existingByKey.set(
        result.actionKey,
        result
      );
    }
  }


  // =====================================================
  // DATE HELPERS
  // =====================================================

  private getCalendarDayDifference(
    dateValue:
      string
  ): number | null {

    const target =
      this.parseDateOnly(
        dateValue
      );


    if (
      !target
    ) {

      return null;
    }


    const now =
      new Date();


    const today =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );


    const targetDay =
      new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate()
      );


    const millisecondsPerDay =
      24
      *
      60
      *
      60
      *
      1000;


    return Math.round(
      (
        targetDay.getTime()
        -
        today.getTime()
      )
      /
      millisecondsPerDay
    );
  }


  private parseDateOnly(
    value:
      string
  ): Date | null {

    const match =
      /^(\d{4})-(\d{2})-(\d{2})$/
        .exec(
          value
        );


    if (
      !match
    ) {

      return null;
    }


    const year =
      Number(
        match[1]
      );

    const month =
      Number(
        match[2]
      );

    const day =
      Number(
        match[3]
      );


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      date.getFullYear() !== year
      ||
      date.getMonth() !== month - 1
      ||
      date.getDate() !== day
    ) {

      return null;
    }


    return date;
  }


  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  private getMemberName(
    member:
      MemberRecord
  ): string {

    return [
      member.firstName,
      member.lastName
    ]
      .filter(
        value =>
          !!value
      )
      .join(
        ' '
      )
      .trim()
      ||
      member.memberCode;
  }


  private formatDays(
    days:
      number
  ): string {

    return days === 1
      ? '1 day'
      : `${days} days`;
  }


  private formatCurrency(
    amount:
      number
  ): string {

    return new Intl.NumberFormat(
      'en-IN',
      {
        style:
          'currency',

        currency:
          'INR',

        maximumFractionDigits:
          0
      }
    )
      .format(
        amount
      );
  }


  private toAmount(
    value:
      number | null | undefined
  ): number {

    if (
      value === null
      ||
      value === undefined
      ||
      !Number.isFinite(
        Number(
          value
        )
      )
    ) {

      return 0;
    }


    return Math.max(
      0,
      Number(
        value
      )
    );
  }

}