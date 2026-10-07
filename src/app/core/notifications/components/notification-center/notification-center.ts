import {
  AsyncPipe
} from '@angular/common';

import {
  Component,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AppNotification,
  AppNotificationPriority
} from '../../models/notification.model';

import {
  NotificationService
} from '../../services/notification.service';


@Component({
  selector:
    'app-notification-center',

  imports: [
    AsyncPipe
  ],

  templateUrl:
    './notification-center.html',

  styleUrl:
    './notification-center.scss'
})
export class NotificationCenterComponent {


  private readonly router =
    inject(
      Router
    );


  private readonly elementRef =
    inject(
      ElementRef<HTMLElement>
    );


  readonly notificationService =
    inject(
      NotificationService
    );


  readonly notifications$ =
    this.notificationService
      .notifications$;


  readonly actionCount$ =
    this.notificationService
      .actionCount$;


  readonly highestPriority$ =
    this.notificationService
      .highestPriority$;


  panelOpen =
    false;


  togglePanel():
    void {

    this.panelOpen =
      !this.panelOpen;

  }


  closePanel():
    void {

    this.panelOpen =
      false;

  }


  openNotification(
    notification:
      AppNotification
  ): void {


    this.notificationService
      .markAsRead(
        notification.notificationId
      );


    this.closePanel();


    if (
      notification.route
    ) {

      void this.router
        .navigateByUrl(
          notification.route
        );

    }

  }


  dismissNotification(
    event:
      MouseEvent,
    notificationId:
      number
  ): void {


    event.stopPropagation();


    this.notificationService
      .dismissNotification(
        notificationId
      );

  }


  getPriorityLabel(
    priority:
      AppNotificationPriority
  ): string {


    switch (
      priority
    ) {


      case 'critical':

        return 'Urgent';


      case 'high':

        return 'Action required';


      case 'normal':

      default:

        return 'Reminder';

    }

  }


  getRelativeTime(
    createdAt:
      string
  ): string {


    const created =
      new Date(
        createdAt
      )
        .getTime();


    const difference =
      Math.max(
        0,
        Date.now() - created
      );


    const seconds =
      Math.floor(
        difference / 1000
      );


    if (
      seconds < 30
    ) {

      return 'Just now';

    }


    const minutes =
      Math.floor(
        seconds / 60
      );


    if (
      minutes < 60
    ) {

      return `${minutes} min${minutes === 1 ? '' : 's'} ago`;

    }


    const hours =
      Math.floor(
        minutes / 60
      );


    if (
      hours < 24
    ) {

      return `${hours} hr${hours === 1 ? '' : 's'} ago`;

    }


    const days =
      Math.floor(
        hours / 24
      );


    if (
      days < 7
    ) {

      return `${days} day${days === 1 ? '' : 's'} ago`;

    }


    return new Date(
      createdAt
    )
      .toLocaleDateString(
        'en-IN',
        {
          day:
            '2-digit',

          month:
            'short'
        }
      );

  }


  @HostListener(
    'document:click',
    [
      '$event'
    ]
  )
  onDocumentClick(
    event:
      MouseEvent
  ): void {


    if (
      !this.panelOpen
    ) {

      return;

    }


    const target =
      event.target as Node | null;


    if (
      target
      &&
      this.elementRef
        .nativeElement
        .contains(
          target
        )
    ) {

      return;

    }


    this.closePanel();

  }


  @HostListener(
    'document:keydown.escape'
  )
  onEscape():
    void {

    this.closePanel();

  }

}