import {
  DOCUMENT
} from '@angular/common';

import {
  Inject,
  Injectable
} from '@angular/core';

import {
  BehaviorSubject
} from 'rxjs';


export type AppTheme =
  | 'dark'
  | 'light';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {


  private readonly storageKey =
    'gym-admin-theme';


  private readonly themeSubject:
    BehaviorSubject<AppTheme>;


  readonly theme$;


  constructor(

    @Inject(DOCUMENT)
    private readonly document:
      Document

  ) {


    const initialTheme =
      this.getInitialTheme();


    this.themeSubject =
      new BehaviorSubject<AppTheme>(
        initialTheme
      );


    this.theme$ =
      this.themeSubject
        .asObservable();


    this.applyTheme(
      initialTheme
    );

  }


  get currentTheme():
    AppTheme {

    return this.themeSubject
      .value;

  }


  get isDark():
    boolean {

    return (
      this.currentTheme ===
      'dark'
    );

  }


  get isLight():
    boolean {

    return (
      this.currentTheme ===
      'light'
    );

  }


  toggleTheme():
    void {


    const theme:
      AppTheme =

      this.currentTheme ===
        'dark'

        ? 'light'

        : 'dark';


    this.setTheme(
      theme
    );

  }


  setTheme(
    theme:
      AppTheme
  ):
    void {


    if (
      theme ===
      this.currentTheme
    ) {

      this.applyTheme(
        theme
      );

      return;

    }


    this.themeSubject
      .next(
        theme
      );


    this.applyTheme(
      theme
    );

  }


  private getInitialTheme():
    AppTheme {


    if (
      typeof window !==
      'undefined'
    ) {


      const savedTheme =
        window.localStorage
          .getItem(
            this.storageKey
          );


      if (
        savedTheme ===
          'dark'

        ||

        savedTheme ===
          'light'
      ) {

        return savedTheme;

      }

    }


    /*
     * Your existing application is dark,
     * so keep dark as the default.
     */
    return 'dark';

  }


  private applyTheme(
    theme:
      AppTheme
  ):
    void {


    this.document
      .documentElement
      .setAttribute(
        'data-theme',
        theme
      );


    if (
      typeof window !==
      'undefined'
    ) {

      window.localStorage
        .setItem(
          this.storageKey,
          theme
        );

    }

  }

}