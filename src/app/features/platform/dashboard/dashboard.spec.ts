import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformDashboardComponent } from './dashboard';

describe('PlatformDashboardComponent', () => {
  let component: PlatformDashboardComponent;
  let fixture: ComponentFixture<PlatformDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
