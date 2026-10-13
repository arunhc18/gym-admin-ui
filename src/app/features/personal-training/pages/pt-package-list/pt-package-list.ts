import {
  CurrencyPipe
} from '@angular/common';

import {
  Component,
  DestroyRef,
  inject
} from '@angular/core';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  RouterLink
} from '@angular/router';

import {
  PtPackage
} from '../../models/pt-package.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector:
    'app-pt-package-list',

  standalone:
    true,

  imports: [
    RouterLink,
    CurrencyPipe
  ],

  templateUrl:
    './pt-package-list.html',

  styleUrl:
    './pt-package-list.scss'
})
export class PtPackageListComponent {


  private readonly destroyRef =
    inject(
      DestroyRef
    );


  private readonly ptService =
    inject(
      PersonalTrainingService
    );


  // TEMPORARY TENANT
  // Replace with tenant context later.

  readonly tenantId = 1;


  packages:
    PtPackage[] = [];


  searchTerm = '';

  statusFilter:
    'all'
    | 'active'
    | 'inactive' =
      'all';


  typeFilter:
    'all'
    | 'individual'
    | 'group' =
      'all';


  constructor() {

    this.ptService
      .getPackages(
        this.tenantId
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        packages => {

          this.packages =
            packages;

        }
      );

  }


  // =====================================================
  // FILTERED PACKAGES
  // =====================================================

  get filteredPackages():
    PtPackage[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    return this.packages
      .filter(
        item => {

          const matchesSearch =

            !search

            ||

            item.packageName
              .toLowerCase()
              .includes(
                search
              )

            ||

            (
              item.description
                ?? ''
            )
              .toLowerCase()
              .includes(
                search
              );


          const matchesStatus =

            this.statusFilter ===
              'all'

            ||

            (
              this.statusFilter ===
                'active'

              &&

              item.isActive
            )

            ||

            (
              this.statusFilter ===
                'inactive'

              &&

              !item.isActive
            );


          const matchesType =

            this.typeFilter ===
              'all'

            ||

            item.packageType ===
              this.typeFilter;


          return (
            matchesSearch
            &&
            matchesStatus
            &&
            matchesType
          );

        }
      );

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  get activePackages():
    number {

    return this.packages
      .filter(
        item =>
          item.isActive
      )
      .length;

  }


  get inactivePackages():
    number {

    return this.packages
      .filter(
        item =>
          !item.isActive
      )
      .length;

  }


  get averagePrice():
    number {

    if (
      this.packages.length === 0
    ) {

      return 0;

    }


    const total =
      this.packages
        .reduce(
          (
            sum,
            item
          ) =>
            sum
            +
            item.price,
          0
        );


    return (
      total
      /
      this.packages.length
    );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  updateSearch(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    this.searchTerm =
      input.value;

  }


  // =====================================================
  // STATUS FILTER
  // =====================================================

  updateStatusFilter(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;


    this.statusFilter =
      select.value as
        'all'
        | 'active'
        | 'inactive';

  }


  // =====================================================
  // TYPE FILTER
  // =====================================================

  updateTypeFilter(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;


    this.typeFilter =
      select.value as
        'all'
        | 'individual'
        | 'group';

  }


  // =====================================================
  // TOGGLE STATUS
  // =====================================================

  toggleStatus(
    item: PtPackage
  ): void {

    this.ptService
      .togglePackageStatus(

        item.packageId,

        this.tenantId

      );

  }

}