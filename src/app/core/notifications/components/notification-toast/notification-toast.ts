import {
  AsyncPipe
} from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  AppNotificationToast
} from '../../models/notification.model';

import {
  NotificationService
} from '../../services/notification.service';


@Component({
  selector:
    'app-notification-toast',

  imports: [
    AsyncPipe
  ],

  templateUrl:
    './notification-toast.html',

  styleUrl:
    './notification-toast.scss'
})
export class NotificationToastComponent {


  private readonly router =
    inject(
      Router
    );


  readonly notificationService =
    inject(
      NotificationService
    );


  readonly toasts$ =
    this.notificationService
      .toasts$;


  openToast(
    toast:
      AppNotificationToast
  ): void {


    this.notificationService
      .markAsRead(
        toast.notificationId
      );


    this.notificationService
      .dismissToast(
        toast.toastId
      );


    if (
      toast.route
    ) {

      void this.router
        .navigateByUrl(
          toast.route
        );

    }

  }


  dismiss(
    event:
      MouseEvent,
    toastId:
      number
  ): void {


    event.stopPropagation();


    this.notificationService
      .dismissToast(
        toastId
      );

  }

}