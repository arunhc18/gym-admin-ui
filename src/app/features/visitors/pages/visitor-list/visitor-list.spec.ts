import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitorListComponent } from './visitor-list';

describe('VisitorListComponent', () => {
  let component: VisitorListComponent;
  let fixture: ComponentFixture<VisitorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters visitors by search term and status', () => {
    component.searchTerm = 'guest pass';
    component.selectedStatus = 'Checked out';

    expect(component.filteredVisitors.length).toBeGreaterThan(0);
    expect(component.filteredVisitors.every(visitor =>
      visitor.purpose === 'Guest pass' && visitor.status === 'Checked out'
    )).toBe(true);
  });

  it('paginates the filtered visitor list', () => {
    component.pageSize = 10;

    expect(component.pagedVisitors).toHaveLength(10);
    expect(component.totalPages).toBe(3);
    component.nextPage();

    expect(component.currentPage).toBe(2);
    expect(component.firstResult).toBe(11);
  });
});