import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  distinctUntilChanged,
  map
} from 'rxjs';

import {
  AppNotification,
  AppNotificationPriority,
  AppNotificationSeverity,
  AppNotificationSource,
  AppNotificationToast,
  CreateAppNotificationRequest
} from '../models/notification.model';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly tenantId =
    1;

  private readonly storageKey =
    'gym-admin.action-notifications.v2';

  private readonly defaultToastDurationMs =
    5000;

  /*
   * Only these are displayed in the panel.
   */
  private readonly maximumPanelNotifications =
    5;

  /*
   * We can retain more unresolved actions internally.
   * This allows action #6 to surface automatically
   * when one of the top five is resolved.
   */
  private readonly maximumStoredActions =
    100;

  private readonly maximumVisibleToasts =
    3;


  private notificationSequence =
    1;

  private toastSequence =
    1;


  private readonly toastTimers =
    new Map<
      number,
      ReturnType<typeof setTimeout>
    >();


  private readonly notificationsSubject =
    new BehaviorSubject<AppNotification[]>(
      this.loadNotifications()
    );


  private readonly toastsSubject =
    new BehaviorSubject<AppNotificationToast[]>(
      []
    );


  /*
   * The UI only receives the five most important
   * unresolved notifications.
   */
  readonly notifications$ =
    this.notificationsSubject
      .asObservable()
      .pipe(
        map(
          notifications =>
            notifications.slice(
              0,
              this.maximumPanelNotifications
            )
        )
      );


  readonly toasts$ =
    this.toastsSubject
      .asObservable();


  /*
   * Badge shows total unresolved actionable items,
   * even if only five are displayed.
   */
  readonly actionCount$ =
    this.notificationsSubject
      .asObservable()
      .pipe(
        map(
          notifications =>
            notifications.length
        ),
        distinctUntilChanged()
      );


  readonly unreadCount$ =
    this.notificationsSubject
      .asObservable()
      .pipe(
        map(
          notifications =>
            notifications.filter(
              item =>
                item.status !== 'read'
            ).length
        ),
        distinctUntilChanged()
      );


  readonly hasActionNotifications$ =
    this.actionCount$
      .pipe(
        map(
          count =>
            count > 0
        ),
        distinctUntilChanged()
      );


  readonly highestPriority$ =
    this.notificationsSubject
      .asObservable()
      .pipe(
        map(
          notifications =>
            notifications.length > 0
              ? notifications[0].priority
              : null
        ),
        distinctUntilChanged()
      );


  constructor() {

    /*
     * Clean expired/stale stored records and sort
     * immediately when the application starts.
     */
    this.setNotifications(
      this.notificationsSubject.value
    );

    this.initializeSequences();
  }


  // =====================================================
  // CREATE
  // =====================================================

  notify(
    request:
      CreateAppNotificationRequest
  ): AppNotification {

    const subject =
      request.subject.trim();

    const message =
      request.message.trim();


    if (
      !subject
      ||
      !message
    ) {

      throw new Error(
        'Notification subject and message are required.'
      );
    }


    let notification:
      AppNotification = {

      notificationId:
        this.notificationSequence++,

      tenantId:
        request.tenantId
        ??
        this.tenantId,

      source:
        request.source,

      severity:
        request.severity
        ??
        'info',

      priority:
        request.priority
        ??
        'normal',

      subject,

      message,

      route:
        request.route
        ??
        null,

      iconClass:
        request.iconClass?.trim()
        ||
        this.resolveIconClass(
          request.source,
          request.severity ?? 'info'
        ),

      notificationType:
        'in_app',

      status:
        'sent',

      actionRequired:
        request.actionRequired
        ??
        false,

      actionKey:
        request.actionKey?.trim()
        ||
        null,

      expiresAt:
        request.expiresAt
        ??
        null,

      createdAt:
        new Date()
          .toISOString(),

      readAt:
        null
    };


    /*
     * Toast-only information does not enter the bell.
     */
    if (
      notification.actionRequired
    ) {

      notification =
        this.upsertActionNotification(
          notification
        );
    }


    if (
      request.showToast !== false
    ) {

      this.showToast(
        notification,
        request.toastDurationMs
        ??
        this.defaultToastDurationMs
      );
    }


    return notification;
  }


  // =====================================================
  // HELPERS
  // =====================================================

  success(
    request:
      Omit<
        CreateAppNotificationRequest,
        'severity'
      >
  ): AppNotification {

    return this.notify({
      ...request,
      severity:
        'success'
    });
  }


  info(
    request:
      Omit<
        CreateAppNotificationRequest,
        'severity'
      >
  ): AppNotification {

    return this.notify({
      ...request,
      severity:
        'info'
    });
  }


  warning(
    request:
      Omit<
        CreateAppNotificationRequest,
        'severity'
      >
  ): AppNotification {

    return this.notify({
      ...request,
      severity:
        'warning'
    });
  }


  danger(
    request:
      Omit<
        CreateAppNotificationRequest,
        'severity'
      >
  ): AppNotification {

    return this.notify({
      ...request,
      severity:
        'danger'
    });
  }


  // =====================================================
  // ACTION UPSERT
  // =====================================================

  private upsertActionNotification(
    incoming:
      AppNotification
  ): AppNotification {

    if (
      incoming.actionKey
    ) {

      const existing =
        this.notificationsSubject
          .value
          .find(
            item =>
              item.actionKey ===
              incoming.actionKey
          );


      if (
        existing
      ) {

        const changed =
          existing.priority !== incoming.priority
          ||
          existing.severity !== incoming.severity
          ||
          existing.subject !== incoming.subject
          ||
          existing.message !== incoming.message
          ||
          existing.route !== incoming.route;


        const updated:
          AppNotification = {

          ...incoming,

          notificationId:
            existing.notificationId,

          /*
           * Keep the original creation point so hourly
           * synchronization does not continuously reorder
           * unchanged alerts.
           */
          createdAt:
            existing.createdAt,

          /*
           * Escalation/content changes make the item new
           * again. Otherwise preserve read state.
           */
          status:
            changed
              ? 'sent'
              : existing.status,

          readAt:
            changed
              ? null
              : existing.readAt
        };


        const others =
          this.notificationsSubject
            .value
            .filter(
              item =>
                item.notificationId
                !== existing.notificationId
            );


        this.setNotifications([
          updated,
          ...others
        ]);


        return updated;
      }
    }


    this.setNotifications([
      incoming,
      ...this.notificationsSubject.value
    ]);


    return incoming;
  }


  // =====================================================
  // RESOLVE / DISMISS
  // =====================================================

  resolveNotification(
    notificationId:
      number
  ): void {

    this.setNotifications(
      this.notificationsSubject
        .value
        .filter(
          notification =>
            notification.notificationId
            !== notificationId
        )
    );
  }


  resolveAction(
    actionKey:
      string
  ): void {

    const key =
      actionKey.trim();


    if (
      !key
    ) {

      return;
    }


    this.setNotifications(
      this.notificationsSubject
        .value
        .filter(
          notification =>
            notification.actionKey
            !== key
        )
    );
  }


  dismissNotification(
    notificationId:
      number
  ): void {

    this.resolveNotification(
      notificationId
    );
  }


  clearAllActions():
    void {

    this.setNotifications(
      []
    );
  }


  // =====================================================
  // READ STATUS
  // =====================================================

  markAsRead(
    notificationId:
      number
  ): void {

    const now =
      new Date()
        .toISOString();


    const updated =
      this.notificationsSubject
        .value
        .map(
          notification => {

            if (
              notification.notificationId
              !== notificationId
            ) {

              return notification;
            }


            if (
              notification.status === 'read'
            ) {

              return notification;
            }


            return {
              ...notification,
              status:
                'read' as const,
              readAt:
                now
            };
          }
        );


    this.setNotifications(
      updated
    );
  }


  markAsUnread(
    notificationId:
      number
  ): void {

    this.setNotifications(
      this.notificationsSubject
        .value
        .map(
          notification => {

            if (
              notification.notificationId
              !== notificationId
            ) {

              return notification;
            }


            return {
              ...notification,
              status:
                'sent' as const,
              readAt:
                null
            };
          }
        )
    );
  }


  markAllAsRead():
    void {

    const now =
      new Date()
        .toISOString();


    this.setNotifications(
      this.notificationsSubject
        .value
        .map(
          notification => ({
            ...notification,

            status:
              'read' as const,

            readAt:
              notification.readAt
              ??
              now
          })
        )
    );
  }


  // =====================================================
  // SNAPSHOTS
  // =====================================================

  /*
   * Returns ALL outstanding actions, not just the
   * five currently displayed.
   */
  getNotificationsSnapshot():
    AppNotification[] {

    return [
      ...this.notificationsSubject.value
    ];
  }


  getNotificationById(
    notificationId:
      number
  ): AppNotification | undefined {

    return this.notificationsSubject
      .value
      .find(
        notification =>
          notification.notificationId
          === notificationId
      );
  }


  getActionCountSnapshot():
    number {

    return this.notificationsSubject
      .value
      .length;
  }


  // =====================================================
  // TOASTS
  // =====================================================

  private showToast(
    notification:
      AppNotification,
    durationMs:
      number
  ): void {

    const toastId =
      this.toastSequence++;


    const toast:
      AppNotificationToast = {
      ...notification,
      toastId
    };


    const current =
      this.toastsSubject.value;


    const next = [
      toast,
      ...current
    ]
      .slice(
        0,
        this.maximumVisibleToasts
      );


    const activeIds =
      new Set(
        next.map(
          item =>
            item.toastId
        )
      );


    current.forEach(
      item => {

        if (
          !activeIds.has(
            item.toastId
          )
        ) {

          this.clearToastTimer(
            item.toastId
          );
        }
      }
    );


    this.toastsSubject.next(
      next
    );


    const safeDuration =
      Math.max(
        1500,
        durationMs
      );


    const timer =
      setTimeout(
        () => {

          this.dismissToast(
            toastId
          );
        },
        safeDuration
      );


    this.toastTimers.set(
      toastId,
      timer
    );
  }


  dismissToast(
    toastId:
      number
  ): void {

    this.clearToastTimer(
      toastId
    );


    this.toastsSubject.next(
      this.toastsSubject
        .value
        .filter(
          toast =>
            toast.toastId
            !== toastId
        )
    );
  }


  clearAllToasts():
    void {

    this.toastTimers
      .forEach(
        timer =>
          clearTimeout(
            timer
          )
      );


    this.toastTimers.clear();

    this.toastsSubject.next(
      []
    );
  }


  private clearToastTimer(
    toastId:
      number
  ): void {

    const timer =
      this.toastTimers.get(
        toastId
      );


    if (
      timer === undefined
    ) {

      return;
    }


    clearTimeout(
      timer
    );

    this.toastTimers.delete(
      toastId
    );
  }


  // =====================================================
  // SORTING + STORAGE SET
  // =====================================================

  private setNotifications(
    notifications:
      AppNotification[]
  ): void {

    const now =
      Date.now();


    const cleaned =
      notifications
        .filter(
          notification =>
            notification.actionRequired
        )
        .filter(
          notification => {

            if (
              !notification.expiresAt
            ) {

              return true;
            }


            const expiry =
              new Date(
                notification.expiresAt
              )
                .getTime();


            if (
              Number.isNaN(
                expiry
              )
            ) {

              return true;
            }


            return expiry > now;
          }
        );


    const sorted =
      [...cleaned]
        .sort(
          (
            first,
            second
          ) => {

            const priorityDifference =
              this.getPriorityWeight(
                second.priority
              )
              -
              this.getPriorityWeight(
                first.priority
              );


            if (
              priorityDifference !== 0
            ) {

              return priorityDifference;
            }


            return (
              new Date(
                second.createdAt
              )
                .getTime()
              -
              new Date(
                first.createdAt
              )
                .getTime()
            );
          }
        )
        .slice(
          0,
          this.maximumStoredActions
        );


    this.notificationsSubject.next(
      sorted
    );


    this.persistNotifications(
      sorted
    );
  }


  private getPriorityWeight(
    priority:
      AppNotificationPriority
  ): number {

    switch (
      priority
    ) {

      case 'critical':
        return 3;

      case 'high':
        return 2;

      case 'normal':
      default:
        return 1;
    }
  }


  // =====================================================
  // ICONS
  // =====================================================

  private resolveIconClass(
    source:
      AppNotificationSource,
    severity:
      AppNotificationSeverity
  ): string {

    switch (
      source
    ) {

      case 'members':
        return 'fa-solid fa-user';

      case 'renewals':
        return 'fa-solid fa-arrows-rotate';

      case 'enquiries':
        return 'fa-solid fa-comments';

      case 'visitors':
        return 'fa-solid fa-person-walking-arrow-right';

      case 'staff':
        return 'fa-solid fa-id-badge';

      case 'classes':
        return 'fa-solid fa-calendar-check';

      case 'personal-training':
        return 'fa-solid fa-dumbbell';

      case 'attendance':
        return 'fa-solid fa-clipboard-user';

      case 'accounts':
        return 'fa-solid fa-file-invoice-dollar';

      case 'products':
        return 'fa-solid fa-box';

      case 'vendors':
        return 'fa-solid fa-truck';

      case 'equipment':
        return 'fa-solid fa-screwdriver-wrench';

      case 'reports':
        return 'fa-solid fa-chart-column';

      case 'system':
      default:
        return this.resolveSeverityIcon(
          severity
        );
    }
  }


  private resolveSeverityIcon(
    severity:
      AppNotificationSeverity
  ): string {

    switch (
      severity
    ) {

      case 'success':
        return 'fa-solid fa-circle-check';

      case 'warning':
        return 'fa-solid fa-triangle-exclamation';

      case 'danger':
        return 'fa-solid fa-circle-exclamation';

      case 'info':
      default:
        return 'fa-solid fa-circle-info';
    }
  }


  // =====================================================
  // LOCAL STORAGE
  // =====================================================

  private persistNotifications(
    notifications:
      AppNotification[]
  ): void {

    if (
      typeof localStorage ===
      'undefined'
    ) {

      return;
    }


    try {

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(
          notifications
        )
      );
    }

    catch {

      /*
       * Notification storage must never break the app.
       */
    }
  }


  private loadNotifications():
    AppNotification[] {

    if (
      typeof localStorage ===
      'undefined'
    ) {

      return [];
    }


    try {

      const raw =
        localStorage.getItem(
          this.storageKey
        );


      if (
        !raw
      ) {

        return [];
      }


      const parsed =
        JSON.parse(
          raw
        );


      if (
        !Array.isArray(
          parsed
        )
      ) {

        return [];
      }


      return parsed.filter(
        (
          item
        ):
          item is AppNotification =>

          this.isStoredNotification(
            item
          )
      );
    }

    catch {

      return [];
    }
  }


  private isStoredNotification(
    value:
      unknown
  ): value is AppNotification {

    if (
      !value
      ||
      typeof value !== 'object'
    ) {

      return false;
    }


    const item =
      value as Partial<AppNotification>;


    const validPriority =
      item.priority === 'critical'
      ||
      item.priority === 'high'
      ||
      item.priority === 'normal';


    return (
      typeof item.notificationId === 'number'
      &&
      typeof item.subject === 'string'
      &&
      typeof item.message === 'string'
      &&
      typeof item.createdAt === 'string'
      &&
      item.actionRequired === true
      &&
      validPriority
      &&
      (
        item.status === 'sent'
        ||
        item.status === 'read'
      )
    );
  }


  // =====================================================
  // IDS
  // =====================================================

  private initializeSequences():
    void {

    const notifications =
      this.notificationsSubject.value;


    if (
      notifications.length > 0
    ) {

      this.notificationSequence =
        Math.max(
          ...notifications.map(
            item =>
              item.notificationId
          )
        )
        + 1;
    }


    this.toastSequence =
      1;
  }

}