import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() navigationSelected = new EventEmitter<void>();

  membersExpanded = true;

  selectNavigation(): void {
    this.navigationSelected.emit();
  }

  toggleMembers(): void {
    this.membersExpanded = !this.membersExpanded;
  }
}