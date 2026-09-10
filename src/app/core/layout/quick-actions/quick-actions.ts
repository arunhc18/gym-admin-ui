import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss',
})
export class QuickActionsComponent {
  private readonly router = inject(Router);

  onAddMember(): void {
    this.router.navigate(['/members/new']);
  }

  onCollectPayment(): void {
    console.log('Collect Payment action selected');
  }

  onCheckIn(): void {
    console.log('Check-In action selected');
  }

  onMoreActions(): void {
    console.log('More actions selected');
  }
}