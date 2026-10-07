import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  IsActiveMatchOptions,
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
  // ROUTER MATCHING
  // =====================================================

  readonly exactRouteMatch:
    IsActiveMatchOptions = {

      paths: 'exact',

      queryParams: 'ignored',

      fragment: 'ignored',

      matrixParams: 'ignored'

    };


  // =====================================================
  // EXPANDED MENU STATES
  // =====================================================

  membersExpanded = true;

  accountsExpanded = true;

  trainingExpanded = true;


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


  // =====================================================
  // TRAINING
  // =====================================================

  toggleTraining(): void {

    this.trainingExpanded =
      !this.trainingExpanded;

  }

}