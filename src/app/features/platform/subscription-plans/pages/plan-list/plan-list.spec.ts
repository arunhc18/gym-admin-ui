import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlanListComponent } from './plan-list';

describe('PlanListComponent', () => {
  let component: PlanListComponent;
  let fixture: ComponentFixture<PlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
