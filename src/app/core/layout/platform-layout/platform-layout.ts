import { Component } from '@angular/core';

import {
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

  templateUrl: './platform-layout.html',

  styleUrl: './platform-layout.scss'
})
export class PlatformLayoutComponent {

  sidebarCollapsed = false;

  mobileSidebarOpen = false;


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


  closeMobileSidebar(): void {

    this.mobileSidebarOpen = false;

  }

}