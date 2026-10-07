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
  PtSession,
  PtSessionStatus
} from '../../models/pt-session.model';

import {
  PtSubscription
} from '../../models/pt-subscription.model';

import {
  PersonalTrainingService
} from '../../services/personal-training.service';


@Component({
  selector: 'app-pt-session-list',

  standalone: true,

  imports: [
    RouterLink,
    DatePipe
  ],

  templateUrl:
    './pt-session-list.html',

  styleUrl:
    './pt-session-list.scss'
})
export class PtSessionListComponent {


  private readonly destroyRef =
    inject(DestroyRef);


  private readonly ptService =
    inject(PersonalTrainingService);


  private readonly memberService =
    inject(MemberService);


  private readonly trainerService =
    inject(TrainerService);


  readonly tenantId = 1;


  sessions:
    PtSession[] = [];


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
    'all' | PtSessionStatus =
      'all';


  trainerFilter:
    number | 'all' =
      'all';


  dateFilter = '';


  constructor() {

    this.members =
      this.memberService
        .getMembersSnapshot();


    this.subscriptions =
      this.ptService
        .getSubscriptionsSnapshot(
          this.tenantId
        );


    this.packages =
      this.ptService
        .getPackagesSnapshot(
          this.tenantId
        );


    this.trainers =
      this.trainerService
        .getTrainers();


    this.ptService
      .getSessions(
        this.tenantId
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe(
        sessions => {

          this.sessions =
            sessions;

        }
      );

  }


  // =====================================================
  // FILTERED SESSIONS
  // =====================================================

  get filteredSessions():
    PtSession[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    return this.sessions
      .filter(
        session => {

          const subscription =
            this.getSubscription(
              session.ptSubscriptionId
            );


          const member =
            subscription
              ? this.getMember(
                  subscription.memberId
                )
              : undefined;


          const packageItem =
            subscription
              ? this.getPackage(
                  subscription.packageId
                )
              : undefined;


          const trainer =
            this.getTrainer(
              session.trainerId
            );


          const searchableText =
            [
              member?.memberCode ?? '',
              member?.firstName ?? '',
              member?.lastName ?? '',
              packageItem?.packageName ?? '',
              trainer?.fullName ?? '',
              session.status
            ]
              .join(' ')
              .toLowerCase();


          const matchesSearch =
            !search
            ||
            searchableText
              .includes(search);


          const matchesStatus =
            this.statusFilter ===
              'all'
            ||
            session.status ===
              this.statusFilter;


          const matchesTrainer =
            this.trainerFilter ===
              'all'
            ||
            session.trainerId ===
              this.trainerFilter;


          const matchesDate =
            !this.dateFilter
            ||
            session.sessionDate ===
              this.dateFilter;


          return (
            matchesSearch
            &&
            matchesStatus
            &&
            matchesTrainer
            &&
            matchesDate
          );

        }
      );

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  get totalSessions():
    number {

    return this.sessions.length;

  }


  get scheduledSessions():
    number {

    return this.sessions
      .filter(
        item =>
          item.status ===
          'Scheduled'
      )
      .length;

  }


  get completedSessions():
    number {

    return this.sessions
      .filter(
        item =>
          item.status ===
          'Completed'
      )
      .length;

  }


  get cancelledSessions():
    number {

    return this.sessions
      .filter(
        item =>
          item.status ===
            'Cancelled'
          ||
          item.status ===
            'No Show'
      )
      .length;

  }


  // =====================================================
  // SUBSCRIPTION LOOKUP
  // =====================================================

  getSubscription(
    ptSubscriptionId: number
  ): PtSubscription | undefined {

    return this.subscriptions
      .find(
        item =>
          item.ptSubscriptionId ===
          ptSubscriptionId
      );

  }


  // =====================================================
  // MEMBER LOOKUP
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
    ptSubscriptionId: number
  ): string {

    const subscription =
      this.getSubscription(
        ptSubscriptionId
      );


    if (!subscription) {

      return 'Unknown Member';

    }


    const member =
      this.getMember(
        subscription.memberId
      );


    if (!member) {

      return 'Unknown Member';

    }


    return (
      `${member.firstName} ${member.lastName}`
    );

  }


  getMemberCode(
    ptSubscriptionId: number
  ): string {

    const subscription =
      this.getSubscription(
        ptSubscriptionId
      );


    if (!subscription) {

      return '';

    }


    return (
      this.getMember(
        subscription.memberId
      )
        ?.memberCode
      ?? ''
    );

  }


  // =====================================================
  // PACKAGE LOOKUP
  // =====================================================

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
    ptSubscriptionId: number
  ): string {

    const subscription =
      this.getSubscription(
        ptSubscriptionId
      );


    if (!subscription) {

      return 'Unknown Package';

    }


    return (
      this.getPackage(
        subscription.packageId
      )
        ?.packageName
      ??
      'Unknown Package'
    );

  }


  // =====================================================
  // TRAINER LOOKUP
  // =====================================================

  getTrainer(
    trainerId: number
  ): Trainer | undefined {

    return this.trainers
      .find(
        item =>
          item.trainerId ===
          trainerId
      );

  }


  getTrainerName(
    trainerId: number
  ): string {

    return (
      this.getTrainer(
        trainerId
      )
        ?.fullName
      ??
      'Unknown Trainer'
    );

  }


  // =====================================================
  // TIME DISPLAY
  // =====================================================

  formatTime(
    value: string
  ): string {

    if (!value) {

      return '';

    }


    const parts =
      value.split(':');


    const hours =
      Number(parts[0]);


    const minutes =
      parts[1] ?? '00';


    if (
      !Number.isFinite(hours)
    ) {

      return value;

    }


    const period =
      hours >= 12
        ? 'PM'
        : 'AM';


    const displayHour =
      hours % 12 || 12;


    return (
      `${displayHour}:${minutes} ${period}`
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


  updateDateFilter(
    event: Event
  ): void {

    const input =
      event.target as
        HTMLInputElement;


    this.dateFilter =
      input.value;

  }


  clearDateFilter(): void {

    this.dateFilter = '';

  }

}