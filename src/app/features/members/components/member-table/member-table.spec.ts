import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberTableComponent } from './member-table';

describe('MemberTableComponent', () => {
  let component: MemberTableComponent;
  let fixture: ComponentFixture<MemberTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
