import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Member, MemberService } from '../../services/member.service';

@Component({
  selector: 'app-renewals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renewals.html',
  styleUrl: './renewals.scss'
})
export class RenewalsComponent implements OnInit {
  members: Member[] = [];
  renewalMembers: Member[] = [];
  filteredRenewalMembers: Member[] = [];
  searchText = '';
  selectedStatus = 'All';
  selectedPlan = 'All';
  selectedLocation = 'All';
  readonly statuses = ['All', 'Expired', 'Expiring', 'Partial payment'];
  plans: string[] = [];
  locations: string[] = [];
  loading = true;

  constructor(
    private readonly memberService: MemberService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.memberService.getMembers().subscribe({
      next: members => {
        this.members = members;
        this.renewalMembers = members.filter(member =>
          member.status === 'Expired' ||
          member.status === 'Expiring' ||
          (member.balanceAmount ?? 0) > 0
        );
        this.plans = [...new Set(this.renewalMembers.map(member => member.planName))].sort();
        this.locations = [...new Set(this.renewalMembers.map(member => member.locationName))].sort();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.members = [];
        this.renewalMembers = [];
        this.filteredRenewalMembers = [];
        this.loading = false;
      }
    });
  }

  goToMembers(): void {
    this.router.navigate(['/members']);
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();
    this.filteredRenewalMembers = this.renewalMembers.filter(member => {
      const name = this.getFullName(member).toLowerCase();
      const matchesSearch = !search || [name, member.memberCode, member.phone, member.email ?? '']
        .some(value => value.toLowerCase().includes(search));
      const matchesStatus = this.selectedStatus === 'All' ||
        (this.selectedStatus === 'Partial payment' ? (member.balanceAmount ?? 0) > 0 : member.status === this.selectedStatus);
      const matchesPlan = this.selectedPlan === 'All' || member.planName === this.selectedPlan;
      const matchesLocation = this.selectedLocation === 'All' || member.locationName === this.selectedLocation;
      return matchesSearch && matchesStatus && matchesPlan && matchesLocation;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'All';
    this.selectedPlan = 'All';
    this.selectedLocation = 'All';
    this.applyFilters();
  }

  editMembership(member: Member): void {
    this.router.navigate(['/members', member.memberId], {
      queryParams: { mode: 'edit' }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  collectPayment(member: Member): void {
    const updated = this.memberService.updateMember(member.memberId, {
      paymentStatus: 'Paid',
      amountPaid: member.membershipAmount ?? 0,
      balanceAmount: 0
    });

    if (updated) {
      this.replaceMember(updated);
    }
  }

  getFullName(member: Member): string {
    return `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
  }

  getInitials(member: Member): string {
    return `${member.firstName?.charAt(0) ?? ''}${member.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getDaysUntilExpiry(member: Member): number | null {
    if (!member.expiryDate) {
      return null;
    }

    const difference = this.parseDate(member.expiryDate).getTime() - this.startOfToday().getTime();
    return Math.ceil(difference / 86400000);
  }

  private replaceMember(updated: Member): void {
    this.members = this.members.map(member => member.memberId === updated.memberId ? updated : member);
    this.renewalMembers = this.members.filter(member =>
      member.status === 'Expired' ||
      member.status === 'Expiring' ||
      (member.balanceAmount ?? 0) > 0
    );
    this.applyFilters();
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

}
