import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Staff, StaffService } from '../../services/staff.service';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss'
})
export class StaffListComponent implements OnInit {

  staff: Staff[] = [];
  filteredStaff: Staff[] = [];

  searchText = '';
  selectedRole = '';
  selectedStatus = '';
  selectedLocation = '';

  roles: string[] = [];
  statuses: string[] = [];
  locations: string[] = [];

  loading = false;

  constructor(
    private staffService: StaffService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading = true;

    this.staffService.getStaff().subscribe({
      next: (staff) => {
        this.staff = staff;

        this.roles = [...new Set(staff.map(x => x.role))];
        this.statuses = [...new Set(staff.map(x => x.status))];
        this.locations = [...new Set(staff.map(x => x.location))];

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredStaff = this.staff.filter(member => {
      const matchesSearch =
        !search ||
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(search) ||
        member.staffCode.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.phone.toLowerCase().includes(search);

      const matchesRole =
        !this.selectedRole || member.role === this.selectedRole;

      const matchesStatus =
        !this.selectedStatus || member.status === this.selectedStatus;

      const matchesLocation =
        !this.selectedLocation || member.location === this.selectedLocation;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesLocation
      );
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.selectedLocation = '';

    this.applyFilters();
  }

  get totalStaff(): number {
    return this.staff.length;
  }

  get activeStaff(): number {
    return this.staff.filter(x => x.status === 'Active').length;
  }

  get trainersCount(): number {
    return this.staff.filter(x => x.role === 'Trainer').length;
  }

  get onLeaveCount(): number {
    return this.staff.filter(x => x.status === 'On Leave').length;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getStatusClass(status: Staff['status']): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'On Leave':
        return 'status-warning';
      case 'Inactive':
        return 'status-danger';
      default:
        return '';
    }
  }

  viewStaff(staff: Staff): void {
    this.router.navigate(['/staff', staff.staffId]);
  }

  editStaff(staff: Staff): void {
    this.router.navigate(['/staff', staff.staffId, 'edit']);
  }

  deleteStaff(staff: Staff): void {
    if (confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
      this.staffService.deleteStaff(staff.staffId);
      this.applyFilters();
    }
  }

  addStaff(): void {
    this.router.navigate(['/staff/add']);
  }

  trackByStaffId(index: number, staff: Staff): number {
    return staff.staffId;
  }
}