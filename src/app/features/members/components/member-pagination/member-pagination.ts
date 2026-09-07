import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-pagination',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './member-pagination.html',
  styleUrl: './member-pagination.scss'
})
export class MemberPaginationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 1;

  @Input() startRecord = 0;
  @Input() endRecord = 0;
  @Input() totalRecords = 0;

  @Input() pageSize = 10;

  @Input() pageSizeOptions:
    number[] = [10, 25, 50];

  @Output() pageChange =
    new EventEmitter<number>();

  @Output() pageSizeChange =
    new EventEmitter<number>();


  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }


  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.pageChange.emit(page);
  }


  changePageSize(size: number): void {
    this.pageSizeChange.emit(size);
  }
}