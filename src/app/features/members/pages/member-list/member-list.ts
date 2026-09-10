import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MemberListItem } from '../../models/member-list-item.model';
import { MemberService } from '../../services/member.service';

import { MemberFiltersComponent } from '../../components/member-filters/member-filters';
import { MemberTableComponent } from '../../components/member-table/member-table';
import { MemberPaginationComponent } from '../../components/member-pagination/member-pagination';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MemberFiltersComponent,
    MemberTableComponent,
    MemberPaginationComponent
  ],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss'
})
export class MemberListComponent {

  members: MemberListItem[] = [];

  searchTerm = '';
  selectedStatus = 'All';
  selectedPlan = 'All';
  selectedLocation = 'All';

  currentPage = 1;
  pageSize = 10;

  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private readonly router: Router,
    private readonly memberService: MemberService
  ) {
    this.loadMembers();
  }

  private loadMembers(): void {
    this.members = this.memberService.getMembers();
  }

  get totalMembers(): number {
    return this.members.length;
  }

  get activeMembers(): number {
    return this.members.filter(
      member => member.status === 'Active'
    ).length;
  }

  get expiringMembers(): number {
    return this.members.filter(
      member => member.status === 'Expiring'
    ).length;
  }

  get expiredMembers(): number {
    return this.members.filter(
      member => member.status === 'Expired'
    ).length;
  }

  get plans(): string[] {
    return [
      ...new Set(
        this.members.map(member => member.planName)
      )
    ];
  }

  get locations(): string[] {
    return [
      ...new Set(
        this.members.map(member => member.location)
      )
    ];
  }

  get filteredMembers(): MemberListItem[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.members.filter(member => {

      const matchesSearch =
        !search ||
        member.memberCode.toLowerCase().includes(search) ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(search) ||
        member.phone.toLowerCase().includes(search) ||
        (member.email ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        member.status === this.selectedStatus;

      const matchesPlan =
        this.selectedPlan === 'All' ||
        member.planName === this.selectedPlan;

      const matchesLocation =
        this.selectedLocation === 'All' ||
        member.location === this.selectedLocation;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPlan &&
        matchesLocation
      );
    });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredMembers.length / this.pageSize
      )
    );
  }

  get paginatedMembers(): MemberListItem[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredMembers.slice(
      start,
      start + this.pageSize
    );
  }

  get startRecord(): number {
    if (this.filteredMembers.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredMembers.length
    );
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.currentPage = 1;
  }

  onPlanChange(value: string): void {
    this.selectedPlan = value;
    this.currentPage = 1;
  }

  onLocationChange(value: string): void {
    this.selectedLocation = value;
    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedPlan = 'All';
    this.selectedLocation = 'All';
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  viewMember(member: MemberListItem): void {
    this.router.navigate([
      '/members',
      member.memberId
    ]);
  }

  editMember(member: MemberListItem): void {
    console.log('Edit member:', member);
  }

  renewMembership(member: MemberListItem): void {
    console.log('Renew membership:', member);
  }

  recordPayment(member: MemberListItem): void {
    console.log('Record payment:', member);
  }
}