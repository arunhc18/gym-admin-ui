import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Enquiry, EnquiryService, EnquiryStatus } from '../../services/enquiry.service';

@Component({
  selector: 'app-enquiry-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './enquiry-list.html',
  styleUrl: './enquiry-list.scss'
})
export class EnquiryListComponent {
  private readonly enquiryService = inject(EnquiryService);

  readonly statuses: Array<'All' | EnquiryStatus> = ['All', 'New', 'Contacted', 'Follow-up', 'Converted', 'Lost'];
  readonly pageSizes = [10, 25, 50, 100];
  searchTerm = '';
  selectedStatus: 'All' | EnquiryStatus = 'All';
  pageSize = 10;
  currentPage = 1;

  get allEnquiries(): Enquiry[] {
    return this.enquiryService.getEnquiries();
  }

  get filteredEnquiries(): Enquiry[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.allEnquiries.filter(enquiry => {
      const matchesSearch = !search || [
        enquiry.name,
        enquiry.phone,
        enquiry.email,
        enquiry.interestedPlan
      ].some(value => value.toLowerCase().includes(search));
      const matchesStatus = this.selectedStatus === 'All' || enquiry.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEnquiries.length / this.pageSize));
  }

  get pagedEnquiries(): Enquiry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredEnquiries.slice(start, start + this.pageSize);
  }

  get firstResult(): number {
    return this.filteredEnquiries.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get lastResult(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredEnquiries.length);
  }

  get newCount(): number { return this.countByStatus('New'); }
  get followUpCount(): number { return this.countByStatus('Follow-up'); }
  get convertedCount(): number { return this.countByStatus('Converted'); }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
  }

  editEnquiry(id: number): string[] {
    return ['/enquiries', String(id), 'edit'];
  }

  formatDate(value: string): string {
    if (!value) {
      return '—';
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(`${value}T00:00:00`));
  }

  private countByStatus(status: EnquiryStatus): number {
    return this.allEnquiries.filter(enquiry => enquiry.status === status).length;
  }
}
