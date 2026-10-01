import {
  Component,
  Input
} from '@angular/core';

import {
  ThemeService
} from '../theme.service';


@Component({
  selector: 'app-theme-toggle',

  standalone: true,

  imports: [],

  templateUrl: './theme-toggle.html',

  styleUrl: './theme-toggle.scss'
})
export class ThemeToggleComponent {


  @Input()
  compact = false;


  constructor(
    private readonly themeService:
      ThemeService
  ) {}


  get isLightTheme():
    boolean {

    return this.themeService
      .isLight;

  }


  get themeLabel():
    string {

    return this.isLightTheme
      ? 'Light'
      : 'Dark';

  }


  toggleTheme():
    void {

    this.themeService
      .toggleTheme();

  }

}