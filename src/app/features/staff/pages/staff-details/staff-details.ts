import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Staff, StaffService } from '../../services/staff.service';

@Component({
  selector: 'app-staff-details',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './staff-details.html',
  styleUrl: './staff-details.scss'
})
export class StaffDetailsComponent implements OnInit {

  staff: Staff | undefined;

  constructor(
    private readonly staffService: StaffService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    const idParam = this.route.snapshot.paramMap.get('id');
    const staffId = idParam ? Number(idParam) : NaN;

    this.staff = this.staffService.getStaffById(staffId);
  }

  getInitials(staff: Staff): string {
    return `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`.toUpperCase();
  }

  getFullName(staff: Staff): string {
    return `${staff.firstName} ${staff.lastName}`;
  }

  deleteStaff(): void {

    if (!this.staff) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${this.getFullName(this.staff)} from staff? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.staffService.deleteStaff(this.staff.staffId);
    this.router.navigate(['/staff']);
  }
}