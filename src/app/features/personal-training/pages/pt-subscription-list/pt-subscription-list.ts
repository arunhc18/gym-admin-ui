import {
  DatePipe
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
  Member,
  MemberService
} from '../../../members/services/member.service';

import {
  Trainer
} from '../../../../shared/models/trainer.model';

import {
  TrainerService
} from '../../../../shared/services/trainer.service';

import {
  PtPackage
} from '../../models/pt-package.model';

import {
  PtSubscription
} from '../../models/pt-subscription.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector: 'app-pt-subscription-list',

  standalone: true,

  imports: [
    RouterLink,
    DatePipe
  ],

  templateUrl:
    './pt-subscription-list.html',

  styleUrl:
    './pt-subscription-list.scss'
})
export class PtSubscriptionListComponent {


  private readonly destroyRef =
    inject(DestroyRef);


  private readonly ptService =
    inject(PersonalTrainingService);


  private readonly memberService =
    inject(MemberService);


  private readonly trainerService =
    inject(TrainerService);


  readonly tenantId = 1;


  subscriptions:
    PtSubscription[] = [];


  members:
    Member[] = [];


  packages:
    PtPackage[] = [];


  trainers:
    Trainer[] = [];


  searchTerm = '';


  statusFilter:
    'all'
    | 'Active'
    | 'Completed'
    | 'Expired'
    | 'Cancelled' =
      'all';


  trainerFilter:
    number | 'all' =
      'all';


  constructor() {

    this.members =
      this.memberService
        .getMembersSnapshot();


    this.packages =
      this.ptService
        .getPackagesSnapshot(
          this.tenantId
        );


    /*
     * IMPORTANT:
     * Trainers come from the existing
     * TrainerService / StaffService.
     *
     * No PT-specific trainer names.
     */
    this.trainers =
      this.trainerService
        .getTrainers();


    this.ptService
      .getSubscriptions(
        this.tenantId
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        subscriptions => {

          this.subscriptions =
            subscriptions;

        }
      );

  }


  // =====================================================
  // FILTERED LIST
  // =====================================================

  get filteredSubscriptions():
    PtSubscription[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    return this.subscriptions
      .filter(
        subscription => {

          const member =
            this.getMember(
              subscription.memberId
            );


          const packageItem =
            this.getPackage(
              subscription.packageId
            );


          const trainer =
            this.getTrainer(
              subscription.trainerId
            );


          const searchableText =
            [
              member?.memberCode ?? '',
              member?.firstName ?? '',
              member?.lastName ?? '',
              packageItem?.packageName ?? '',
              trainer?.fullName ?? ''
            ]
              .join(' ')
              .toLowerCase();


          const matchesSearch =
            !search
            ||
            searchableText
              .includes(search);


          const matchesStatus =
            this.statusFilter === 'all'
            ||
            subscription.status ===
              this.statusFilter;


          const matchesTrainer =
            this.trainerFilter === 'all'
            ||
            subscription.trainerId ===
              this.trainerFilter;


          return (
            matchesSearch
            &&
            matchesStatus
            &&
            matchesTrainer
          );

        }
      );

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  get totalClients():
    number {

    return this.subscriptions.length;

  }


  get activeClients():
    number {

    return this.subscriptions
      .filter(
        item =>
          item.status === 'Active'
      )
      .length;

  }


  get completedClients():
    number {

    return this.subscriptions
      .filter(
        item =>
          item.status === 'Completed'
      )
      .length;

  }


  get remainingSessions():
    number {

    return this.subscriptions
      .filter(
        item =>
          item.status === 'Active'
      )
      .reduce(
        (
          total,
          item
        ) =>
          total
          +
          item.remainingSessions,
        0
      );

  }


  // =====================================================
  // LOOKUPS
  // =====================================================

  getMember(
    memberId: number
  ): Member | undefined {

    return this.members
      .find(
        item =>
          item.memberId ===
          memberId
      );

  }


  getMemberName(
    memberId: number
  ): string {

    const member =
      this.getMember(
        memberId
      );


    if (!member) {

      return 'Unknown Member';

    }


    return (
      `${member.firstName} ${member.lastName}`
    );

  }


  getMemberCode(
    memberId: number
  ): string {

    return (
      this.getMember(memberId)
        ?.memberCode
      ?? ''
    );

  }


  getPackage(
    packageId: number
  ): PtPackage | undefined {

    return this.packages
      .find(
        item =>
          item.packageId ===
          packageId
      );

  }


  getPackageName(
    packageId: number
  ): string {

    return (
      this.getPackage(packageId)
        ?.packageName
      ??
      'Unknown Package'
    );

  }


  getTrainer(
    trainerId:
      number | null
  ): Trainer | undefined {

    if (
      trainerId === null
    ) {

      return undefined;

    }


    return this.trainers
      .find(
        item =>
          item.trainerId ===
          trainerId
      );

  }


  getTrainerName(
    trainerId:
      number | null
  ): string {

    return (
      this.getTrainer(trainerId)
        ?.fullName
      ??
      'Unassigned'
    );

  }


  // =====================================================
  // FILTER EVENTS
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


  updateStatusFilter(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;


    this.statusFilter =
      select.value as
        typeof this.statusFilter;

  }


  updateTrainerFilter(
    event: Event
  ): void {

    const select =
      event.target as
        HTMLSelectElement;


    this.trainerFilter =
      select.value === 'all'
        ? 'all'
        : Number(
            select.value
          );

  }

}