import {
  Component
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  ThemeToggleComponent
} from '../../theme/theme-toggle/theme-toggle';


@Component({
  selector:
    'app-platform-layout',

  standalone:
    true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThemeToggleComponent
  ],

  templateUrl:
    './platform-layout.html',

  styleUrl:
    './platform-layout.scss'
})
export class PlatformLayoutComponent {


  sidebarCollapsed =
    false;


  mobileSidebarOpen =
    false;


  accountsOpen =
    false;


  constructor(
    private readonly router:
      Router
  ) {


    this.accountsOpen =
      this.router.url
        .startsWith(
          '/platform/accounts'
        );

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


  toggleAccounts():
    void {


    this.accountsOpen =
      !this.accountsOpen;

  }


  isAccountsActive():
    boolean {


    return this.router.url
      .startsWith(
        '/platform/accounts'
      );

  }


  closeMobileSidebar():
    void {


    this.mobileSidebarOpen =
      false;

  }

}