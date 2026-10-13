import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ThemeService } from '../../theme/theme.service';
import { PlatformLayoutComponent } from './platform-layout';

describe('PlatformLayoutComponent', () => {
  let component: PlatformLayoutComponent;
  let fixture: ComponentFixture<PlatformLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: ThemeService,
          useValue: {
            isLight: false,
            toggleTheme: () => {}
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
