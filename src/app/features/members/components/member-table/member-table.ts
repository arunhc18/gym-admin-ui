import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import type { MemberListItem } from '../../../../features/members/models/member-list-item.model';

import { MemberActionsComponent }
  from '../member-actions/member-actions';

@Component({
  selector: 'app-member-table',
  standalone: true,
  imports: [
    CommonModule,
    MemberActionsComponent
  ],
  templateUrl: './member-table.html',
  styleUrl: './member-table.scss'
})
export class MemberTableComponent {

  @Input() members: MemberListItem[] = [];

  @Output() view =
    new EventEmitter<MemberListItem>();

  @Output() edit =
    new EventEmitter<MemberListItem>();

  @Output() renew =
    new EventEmitter<MemberListItem>();

  @Output() payment =
    new EventEmitter<MemberListItem>();


  getInitials(member: MemberListItem): string {
    return (
      member.firstName.charAt(0) +
      member.lastName.charAt(0)
    ).toUpperCase();
  }


  getStatusClass(status: string): string {

    switch (status) {

      case 'Active':
        return 'status-active';

      case 'Expiring':
        return 'status-expiring';

      case 'Expired':
        return 'status-expired';

      default:
        return 'status-inactive';
    }
  }


  trackByMemberId(
    index: number,
    member: MemberListItem
  ): number {
    return member.memberId;
  }
}