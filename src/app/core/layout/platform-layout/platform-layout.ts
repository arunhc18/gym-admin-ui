import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';


@Component({
  selector: 'app-platform-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl:
    './platform-layout.html',

  styleUrl:
    './platform-layout.scss'
})
export class PlatformLayoutComponent {

  sidebarCollapsed = false;

  mobileSidebarOpen = false;

  accountsOpen = false;


  constructor(
    private readonly router: Router
  ) {

    // Keep Accounts expanded when user is
    // already inside Payments / Invoices.
    this.accountsOpen =
      this.router.url.startsWith(
        '/platform/accounts'
      );

  }


  // =====================================================
  // SIDEBAR
  // =====================================================

  toggleSidebar(): void {

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


  // =====================================================
  // ACCOUNTS MENU
  // =====================================================

  toggleAccounts(): void {

    this.accountsOpen =
      !this.accountsOpen;

  }


  isAccountsActive(): boolean {

    return this.router.url.startsWith(
      '/platform/accounts'
    );

  }


  // =====================================================
  // MOBILE
  // =====================================================

  closeMobileSidebar(): void {

    this.mobileSidebarOpen =
      false;

  }

}