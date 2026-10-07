export type AppNotificationSeverity =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';


export type AppNotificationPriority =
  | 'critical'
  | 'high'
  | 'normal';


export type AppNotificationSource =
  | 'members'
  | 'renewals'
  | 'enquiries'
  | 'visitors'
  | 'staff'
  | 'classes'
  | 'personal-training'
  | 'attendance'
  | 'accounts'
  | 'products'
  | 'vendors'
  | 'equipment'
  | 'reports'
  | 'system';


export type AppNotificationStatus =
  | 'sent'
  | 'read';


export interface AppNotification {

  notificationId:
    number;

  tenantId:
    number;

  source:
    AppNotificationSource;

  severity:
    AppNotificationSeverity;

  priority:
    AppNotificationPriority;

  subject:
    string;

  message:
    string;

  route:
    string | null;

  iconClass:
    string;

  notificationType:
    'in_app';

  status:
    AppNotificationStatus;

  /*
   * true:
   * stays in the notification panel.
   *
   * false:
   * toast only.
   */
  actionRequired:
    boolean;

  /*
   * Used to avoid duplicate action notifications.
   *
   * Example:
   * renewal-member-25
   * invoice-payment-103
   */
  actionKey:
    string | null;

  /*
   * Optional automatic expiry.
   *
   * Important unresolved notifications should normally
   * leave this null and be explicitly resolved instead.
   */
  expiresAt:
    string | null;

  createdAt:
    string;

  readAt:
    string | null;

}


export interface CreateAppNotificationRequest {

  tenantId?:
    number;

  source:
    AppNotificationSource;

  severity?:
    AppNotificationSeverity;

  priority?:
    AppNotificationPriority;

  subject:
    string;

  message:
    string;

  route?:
    string | null;

  iconClass?:
    string;

  actionRequired?:
    boolean;

  actionKey?:
    string | null;

  expiresAt?:
    string | null;

  showToast?:
    boolean;

  toastDurationMs?:
    number;

}


export interface AppNotificationToast
  extends AppNotification {

  toastId:
    number;

}