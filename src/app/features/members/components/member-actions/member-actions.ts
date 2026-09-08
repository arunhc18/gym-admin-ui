import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { MemberListItem } from '../../models/member-list-item.model';

@Component({
  selector: 'app-member-actions',
  standalone: true,
  imports: [],
  templateUrl: './member-actions.html',
  styleUrl: './member-actions.scss'
})
export class MemberActionsComponent {

  @Input({ required: true })
  member!: MemberListItem;

  @Output()
  view = new EventEmitter<MemberListItem>();

  @Output()
  edit = new EventEmitter<MemberListItem>();

  @Output()
  renew = new EventEmitter<MemberListItem>();

  @Output()
  payment = new EventEmitter<MemberListItem>();


  viewMember(): void {
    this.view.emit(this.member);
  }


  editMember(): void {
    this.edit.emit(this.member);
  }


  renewMembership(): void {
    this.renew.emit(this.member);
  }


  recordPayment(): void {
    this.payment.emit(this.member);
  }

}