import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Visitor, VisitorService, VisitorStatus } from '../../services/visitor.service';

@Component({
  selector: 'app-visitor-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.scss'
})
export class VisitorListComponent {
  constructor(private readonly visitorService: VisitorService) {}

  readonly statuses: Array<'All' | VisitorStatus> = ['All', 'Checked in', 'Checked out'];
  readonly pageSizes = [10, 25, 50];

  searchTerm = '';
  selectedStatus: 'All' | VisitorStatus = 'All';
  selectedDate = '';
  pageSize = 10;
  currentPage = 1;

  get visitors(): Visitor[] {
    return this.visitorService.getVisitors();
  }

  get filteredVisitors(): Visitor[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.visitors.filter(visitor => {
      const matchesSearch = !search || [visitor.name, visitor.phone, visitor.purpose, visitor.host]
        .some(value => value.toLowerCase().includes(search));
      const matchesStatus = this.selectedStatus === 'All' || visitor.status === this.selectedStatus;
      const matchesDate = !this.selectedDate || visitor.visitDate === this.selectedDate;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredVisitors.length / this.pageSize));
  }

  get pagedVisitors(): Visitor[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVisitors.slice(start, start + this.pageSize);
  }

  get checkedInCount(): number {
    return this.visitors.filter(visitor => visitor.status === 'Checked in').length;
  }

  get todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.visitors.filter(visitor => visitor.visitDate === today).length;
  }

  get firstResult(): number {
    return this.filteredVisitors.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get lastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredVisitors.length);
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  checkOutVisitor(visitor: Visitor): void {
    this.visitorService.checkOutVisitor(visitor.visitorId);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }
}
