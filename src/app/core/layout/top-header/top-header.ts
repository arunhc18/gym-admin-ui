import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { QuickActionsComponent } from '../quick-actions/quick-actions';

@Component({
  selector: 'app-top-header',
  imports: [AsyncPipe, QuickActionsComponent],
  templateUrl: './top-header.html',
  styleUrl: './top-header.scss',
})
export class TopHeaderComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  @Output() menuClicked = new EventEmitter<void>();

  readonly pageMeta$ = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    startWith(null),
    map(() => {
      let route = this.activatedRoute;
      while (route.firstChild) route = route.firstChild;
      return route.snapshot.data as { title?: string; description?: string };
    }),
  );
}