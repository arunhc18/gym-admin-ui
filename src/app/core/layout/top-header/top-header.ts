import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { QuickActionsComponent } from '../quick-actions/quick-actions';

interface PageMeta {
  title?: string;
  description?: string;
  breadcrumbParent?: string;
  breadcrumbParentUrl?: string;
}

@Component({
  selector: 'app-top-header',
  imports: [AsyncPipe, QuickActionsComponent, RouterLink],
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

      while (route.firstChild) {
        route = route.firstChild;
      }

      const routeData = route.snapshot.data as PageMeta;
      const currentUrl = this.router.url.split('?')[0];

      const isMemberChildRoute =
        currentUrl.startsWith('/members/') &&
        currentUrl !== '/members/new';

      const isAddMemberRoute =
        currentUrl === '/members/new';

      if (isMemberChildRoute || isAddMemberRoute) {
        return {
          ...routeData,
          breadcrumbParent: 'Members',
          breadcrumbParentUrl: '/members',
        };
      }

      return {
        ...routeData,
        breadcrumbParent: 'Dashboard',
        breadcrumbParentUrl: '/dashboard',
      };
    }),
  );
}