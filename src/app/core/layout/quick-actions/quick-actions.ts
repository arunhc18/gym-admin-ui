import { Component } from '@angular/core';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss',
})
export class QuickActionsComponent {
  onAddMember(): void { console.log('Add Member action selected'); }
  onCollectPayment(): void { console.log('Collect Payment action selected'); }
  onCheckIn(): void { console.log('Check-In action selected'); }
  onMoreActions(): void { console.log('More actions selected'); }
}