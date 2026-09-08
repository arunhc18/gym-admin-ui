import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MemberListItem } from '../../models/member-list-item.model';

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

  // =========================================================
  // FILTER VALUES
  // =========================================================

  searchTerm = '';
  selectedStatus = 'All';
  selectedPlan = 'All';
  selectedLocation = 'All';


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;
  pageSize = 10;

  readonly pageSizeOptions: number[] = [
    5,
    10,
    25,
    50
  ];


  // =========================================================
  // MOCK MEMBER DATA
  // Later this will come from ASP.NET Core API
  // =========================================================

  members: MemberListItem[] = [

    {
      memberId: 1,
      memberCode: 'MEM-00124',

      firstName: 'Arun',
      lastName: 'Kumar',

      phone: '9876543210',
      email: 'arun@example.com',

      planName: 'Gold Annual',
      location: 'Main Branch',

      joinDate: '2026-01-12',
      expiryDate: '2027-01-11',

      status: 'Active'
    },

    {
      memberId: 2,
      memberCode: 'MEM-00125',

      firstName: 'Rahul',
      lastName: 'Sharma',

      phone: '9876500001',
      email: 'rahul@example.com',

      planName: 'Monthly',
      location: 'Main Branch',

      joinDate: '2026-08-01',
      expiryDate: '2026-09-30',

      status: 'Expiring'
    },

    {
      memberId: 3,
      memberCode: 'MEM-00126',

      firstName: 'Sneha',
      lastName: 'Patil',

      phone: '9900011223',
      email: 'sneha@example.com',

      planName: 'Premium Annual',
      location: 'Indiranagar',

      joinDate: '2025-09-01',
      expiryDate: '2026-08-31',

      status: 'Expired'
    },

    {
      memberId: 4,
      memberCode: 'MEM-00127',

      firstName: 'Kiran',
      lastName: 'Rao',

      phone: '9988776655',
      email: 'kiran@example.com',

      planName: 'Quarterly',
      location: 'HSR Layout',

      joinDate: '2026-07-15',
      expiryDate: '2026-10-15',

      status: 'Active'
    },

    {
      memberId: 5,
      memberCode: 'MEM-00128',

      firstName: 'Priya',
      lastName: 'Shetty',

      phone: '9911223344',
      email: 'priya@example.com',

      planName: 'Gold Annual',
      location: 'Indiranagar',

      joinDate: '2026-02-15',
      expiryDate: '2027-02-14',

      status: 'Active'
    },

    {
      memberId: 6,
      memberCode: 'MEM-00129',

      firstName: 'Manoj',
      lastName: 'Gowda',

      phone: '9845012345',
      email: 'manoj@example.com',

      planName: 'Monthly',
      location: 'Main Branch',

      joinDate: '2026-08-10',
      expiryDate: '2026-09-10',

      status: 'Expiring'
    },

    {
      memberId: 7,
      memberCode: 'MEM-00130',

      firstName: 'Ananya',
      lastName: 'Reddy',

      phone: '9900998877',
      email: 'ananya@example.com',

      planName: 'Premium Annual',
      location: 'HSR Layout',

      joinDate: '2026-03-05',
      expiryDate: '2027-03-04',

      status: 'Active'
    },

    {
      memberId: 8,
      memberCode: 'MEM-00131',

      firstName: 'Vijay',
      lastName: 'Kumar',

      phone: '9988007766',
      email: 'vijay@example.com',

      planName: 'Quarterly',
      location: 'Indiranagar',

      joinDate: '2026-04-10',
      expiryDate: '2026-07-10',

      status: 'Expired'
    },

    {
      memberId: 9,
      memberCode: 'MEM-00132',

      firstName: 'Megha',
      lastName: 'Nair',

      phone: '9887766554',
      email: 'megha@example.com',

      planName: 'Gold Annual',
      location: 'Main Branch',

      joinDate: '2026-06-20',
      expiryDate: '2027-06-19',

      status: 'Active'
    },

    {
      memberId: 10,
      memberCode: 'MEM-00133',

      firstName: 'Rakesh',
      lastName: 'Bhat',

      phone: '9876123456',
      email: 'rakesh@example.com',

      planName: 'Monthly',
      location: 'HSR Layout',

      joinDate: '2026-08-25',
      expiryDate: '2026-09-25',

      status: 'Inactive'
    },

    {
      memberId: 11,
      memberCode: 'MEM-00134',

      firstName: 'Divya',
      lastName: 'Krishna',

      phone: '9898989898',
      email: 'divya@example.com',

      planName: 'Gold Annual',
      location: 'Main Branch',

      joinDate: '2026-05-12',
      expiryDate: '2027-05-11',

      status: 'Active'
    },

    {
      memberId: 12,
      memberCode: 'MEM-00135',

      firstName: 'Suresh',
      lastName: 'Naik',

      phone: '9812345678',
      email: 'suresh@example.com',

      planName: 'Quarterly',
      location: 'Indiranagar',

      joinDate: '2026-06-01',
      expiryDate: '2026-09-01',

      status: 'Expired'
    }

  ];


  constructor(
    private router: Router
  ) {}


  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

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


  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  get plans(): string[] {

    return [
      ...new Set(
        this.members.map(
          member => member.planName
        )
      )
    ];
  }


  get locations(): string[] {

    return [
      ...new Set(
        this.members.map(
          member => member.location
        )
      )
    ];
  }


  // =========================================================
  // FILTERED MEMBERS
  // =========================================================

  get filteredMembers(): MemberListItem[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.members.filter(member => {

      const fullName =
        `${member.firstName} ${member.lastName}`
          .toLowerCase();


      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        member.memberCode
          .toLowerCase()
          .includes(search) ||
        member.phone.includes(search) ||
        (member.email ?? '')
          .toLowerCase()
          .includes(search);


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


  // =========================================================
  // PAGINATION CALCULATIONS
  // =========================================================

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredMembers.length /
        this.pageSize
      )
    );
  }


  get paginatedMembers(): MemberListItem[] {

    const validCurrentPage =
      Math.min(
        this.currentPage,
        this.totalPages
      );

    const startIndex =
      (validCurrentPage - 1) *
      this.pageSize;


    return this.filteredMembers.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }


  get startRecord(): number {

    if (
      this.filteredMembers.length === 0
    ) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize +
      1
    );
  }


  get endRecord(): number {

    return Math.min(
      this.currentPage *
      this.pageSize,

      this.filteredMembers.length
    );
  }


  // =========================================================
  // FILTER EVENTS
  // =========================================================

  onSearchChange(
    value: string
  ): void {

    this.searchTerm = value;

    this.currentPage = 1;
  }


  onStatusChange(
    value: string
  ): void {

    this.selectedStatus = value;

    this.currentPage = 1;
  }


  onPlanChange(
    value: string
  ): void {

    this.selectedPlan = value;

    this.currentPage = 1;
  }


  onLocationChange(
    value: string
  ): void {

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


  // =========================================================
  // PAGINATION EVENTS
  // =========================================================

  changePage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }


  onPageSizeChange(
    size: number
  ): void {

    this.pageSize = size;

    this.currentPage = 1;
  }


  // =========================================================
  // MEMBER ACTIONS
  // =========================================================

  viewMember(
    member: MemberListItem
  ): void {

    this.router.navigate([
      '/members',
      member.memberId
    ]);
  }


  editMember(
    member: MemberListItem
  ): void {

    console.log(
      'Edit Member:',
      member
    );
  }


  renewMembership(
    member: MemberListItem
  ): void {

    console.log(
      'Renew Membership:',
      member
    );
  }


  recordPayment(
    member: MemberListItem
  ): void {

    console.log(
      'Record Payment:',
      member
    );
  }
}