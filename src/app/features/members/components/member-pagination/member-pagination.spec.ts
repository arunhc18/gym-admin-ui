import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberPaginationComponent } from './member-pagination';

describe('MemberPaginationComponent', () => {
  let component: MemberPaginationComponent;
  let fixture: ComponentFixture<MemberPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberPaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberPaginationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
