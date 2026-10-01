import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  ThemeToggleComponent
} from '../../theme/theme-toggle/theme-toggle';


@Component({
  selector: 'app-sidebar',

  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive,
    ThemeToggleComponent
  ],

  templateUrl: './sidebar.html',

  styleUrl: './sidebar.scss'
})
export class SidebarComponent {


  @Input()
  collapsed = false;


  @Input()
  mobileOpen = false;


  @Output()
  navigationSelected =
    new EventEmitter<void>();


  // =====================================================
  // EXPANDED MENU STATES
  // =====================================================

  membersExpanded = true;

  accountsExpanded = true;

  classesExpanded = true;


  // =====================================================
  // NAVIGATION
  // =====================================================

  selectNavigation(): void {

    this.navigationSelected.emit();

  }


  // =====================================================
  // MEMBERS
  // =====================================================

  toggleMembers(): void {

    this.membersExpanded =
      !this.membersExpanded;

  }


  // =====================================================
  // ACCOUNTS
  // =====================================================

  toggleAccounts(): void {

    this.accountsExpanded =
      !this.accountsExpanded;

  }

  toggleClasses(): void {

    this.classesExpanded =
      !this.classesExpanded;

  }

}