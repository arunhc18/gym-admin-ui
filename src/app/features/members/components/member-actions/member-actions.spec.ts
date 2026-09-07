import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberActionsComponent } from './member-actions';

describe('MemberActionsComponent', () => {
  let component: MemberActionsComponent;
  let fixture: ComponentFixture<MemberActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberActionsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
