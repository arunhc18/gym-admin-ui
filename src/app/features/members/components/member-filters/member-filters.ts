import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './member-filters.html',
  styleUrl: './member-filters.scss'
})
export class MemberFiltersComponent {

  @Input() searchTerm = '';
  @Input() selectedStatus = 'All';
  @Input() selectedPlan = 'All';
  @Input() selectedLocation = 'All';

  @Input() plans: string[] = [];
  @Input() locations: string[] = [];

  @Output() searchTermChange =
    new EventEmitter<string>();

  @Output() statusChange =
    new EventEmitter<string>();

  @Output() planChange =
    new EventEmitter<string>();

  @Output() locationChange =
    new EventEmitter<string>();

  @Output() clear =
    new EventEmitter<void>();


  onSearchChange(value: string): void {
    this.searchTermChange.emit(value);
  }

  onStatusChange(value: string): void {
    this.statusChange.emit(value);
  }

  onPlanChange(value: string): void {
    this.planChange.emit(value);
  }

  onLocationChange(value: string): void {
    this.locationChange.emit(value);
  }

  clearFilters(): void {
    this.clear.emit();
  }
}