import {
  Component,
  inject
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

import {
  NotificationToastComponent
} from '../../notifications/components/notification-toast/notification-toast';

import {
  ActionNotificationSyncService
} from '../../notifications/services/action-notification-sync.service';

import {
  SidebarComponent
} from '../sidebar/sidebar';

import {
  TopHeaderComponent
} from '../top-header/top-header';


@Component({
  selector:
    'app-layout',

  imports: [
    RouterOutlet,
    SidebarComponent,
    TopHeaderComponent,
    NotificationToastComponent
  ],

  templateUrl:
    './app-layout.html',

  styleUrl:
    './app-layout.scss'
})
export class AppLayoutComponent {

  private readonly actionNotificationSyncService =
    inject(
      ActionNotificationSyncService
    );


  sidebarCollapsed =
    false;


  mobileSidebarOpen =
    false;


  constructor() {

    /*
     * Starts global actionable notification rules.
     * This runs regardless of which feature page the
     * administrator is currently viewing.
     */
    this.actionNotificationSyncService
      .start();
  }


  toggleSidebar():
    void {

    if (
      window.matchMedia(
        '(max-width: 899px)'
      ).matches
    ) {

      this.mobileSidebarOpen =
        !this.mobileSidebarOpen;

      return;
    }


    this.sidebarCollapsed =
      !this.sidebarCollapsed;
  }


  closeMobileSidebar():
    void {

    this.mobileSidebarOpen =
      false;
  }

}