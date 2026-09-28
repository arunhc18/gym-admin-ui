import {
  CommonModule
} from '@angular/common';

import {
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  DashboardGrowthData,
  DashboardLocationRevenue,
  DashboardOverduePayment,
  DashboardRecentMember,
  DashboardRenewal,
  DashboardService
} from './dashboard.service';


@Component({
  selector:
    'app-dashboard',

  standalone:
    true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './dashboard.html',

  styleUrl:
    './dashboard.scss'
})
export class DashboardComponent
  implements OnInit {


  private readonly destroyRef =
    inject(
      DestroyRef
    );


  today =
    new Date();


  // =====================================================
  // MEMBERS
  // =====================================================

  totalMembers =
    0;


  activeMembers =
    0;


  expiringSoon =
    0;


  expiredMembers =
    0;


  totalMembersChange =
    0;


  activeMembersChange =
    0;


  expiringChange =
    0;


  expiredChange =
    0;


  // =====================================================
  // FINANCE
  // =====================================================

  revenue =
    0;


  expenses =
    0;


  netProfit =
    0;


  revenueChange =
    0;


  expenseChange =
    0;


  profitChange =
    0;


  // =====================================================
  // ATTENDANCE
  // =====================================================

  checkedIn =
    0;


  notCheckedIn =
    0;


  // =====================================================
  // ENQUIRIES
  // =====================================================

  totalEnquiries =
    0;


  convertedEnquiries =
    0;


  // =====================================================
  // TABLES / CHARTS
  // =====================================================

  memberGrowth:
    DashboardGrowthData[] =
    [];


  recentMembers:
    DashboardRecentMember[] =
    [];


  renewals:
    DashboardRenewal[] =
    [];


  overduePayments:
    DashboardOverduePayment[] =
    [];


  locationRevenue:
    DashboardLocationRevenue[] =
    [];


  constructor(

    private readonly dashboardService:
      DashboardService,

    private readonly router:
      Router

  ) {}


  ngOnInit():
    void {


    this.dashboardService
      .getDashboard()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe(
        dashboard => {


          this.totalMembers =
            dashboard.totalMembers;


          this.activeMembers =
            dashboard.activeMembers;


          this.expiringSoon =
            dashboard.expiringSoon;


          this.expiredMembers =
            dashboard.expiredMembers;


          this.totalMembersChange =
            dashboard.totalMembersChange;


          this.activeMembersChange =
            dashboard.activeMembersChange;


          this.expiringChange =
            dashboard.expiringChange;


          this.expiredChange =
            dashboard.expiredChange;


          this.revenue =
            dashboard.revenue;


          this.expenses =
            dashboard.expenses;


          this.netProfit =
            dashboard.netProfit;


          this.revenueChange =
            dashboard.revenueChange;


          this.expenseChange =
            dashboard.expenseChange;


          this.profitChange =
            dashboard.profitChange;


          this.checkedIn =
            dashboard.checkedIn;


          this.notCheckedIn =
            dashboard.notCheckedIn;


          this.totalEnquiries =
            dashboard.totalEnquiries;


          this.convertedEnquiries =
            dashboard.convertedEnquiries;


          this.memberGrowth =
            dashboard.memberGrowth;


          this.recentMembers =
            dashboard.recentMembers;


          this.renewals =
            dashboard.renewals;


          this.overduePayments =
            dashboard.overduePayments;


          this.locationRevenue =
            dashboard.locationRevenue;

        }
      );

  }


  viewAllMembers():
    void {


    this.router.navigate([
      '/members'
    ]);

  }


  viewActiveMembers():
    void {


    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status:
            'Active'
        }
      }
    );

  }


  viewExpiringMembers():
    void {


    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status:
            'Expiring'
        }
      }
    );

  }


  viewExpiredMembers():
    void {


    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status:
            'Expired'
        }
      }
    );

  }


  openMember(
    member:
      DashboardRecentMember
  ):
    void {


    this.router.navigate([
      '/members',
      member.id
    ]);

  }


  openRenewalMember(
    renewal:
      DashboardRenewal
  ):
    void {


    this.router.navigate([
      '/members',
      renewal.id
    ]);

  }


  viewAllRenewals():
    void {


    this.router.navigate([
      '/renewals'
    ]);

  }


  openOverduePayment(
    payment:
      DashboardOverduePayment
  ):
    void {


    this.router.navigate([
      '/accounts/invoices',
      payment.invoiceId
    ]);

  }


  viewOverduePayments():
    void {


    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  viewAllRecentMembers():
    void {


    this.router.navigate([
      '/members'
    ]);

  }


  viewEnquiries():
    void {


    this.router.navigate([
      '/enquiries'
    ]);

  }


  viewAttendance():
    void {


    this.router.navigate([
      '/attendance'
    ]);

  }


  viewReports():
    void {


    this.router.navigate([
      '/reports'
    ]);

  }


  get conversionRate():
    number {


    if (
      this.totalEnquiries ===
      0
    ) {

      return 0;

    }


    return Math.round(

      (
        this.convertedEnquiries
        /
        this.totalEnquiries
      )

      *

      100

    );

  }


  get totalAttendance():
    number {


    return (

      this.checkedIn +
      this.notCheckedIn

    );

  }


  get checkedInPercentage():
    number {


    if (
      this.totalAttendance ===
      0
    ) {

      return 0;

    }


    return Math.round(

      (
        this.checkedIn /
        this.totalAttendance
      )

      *

      100

    );

  }


  get notCheckedInPercentage():
    number {


    return (

      100 -
      this.checkedInPercentage

    );

  }


  get attendanceRingBackground():
    string {


    return `conic-gradient(
      #00c896 0% ${this.checkedInPercentage}%,
      #637180 ${this.checkedInPercentage}% 100%
    )`;

  }


  get growthScaleMax():
    number {


    const highest =
      Math.max(

        0,

        ...this.memberGrowth
          .map(
            item =>
              item.value
          )

      );


    return Math.max(

      10,

      Math.ceil(
        highest /
        10
      )

      *

      10

    );

  }


  get growthAxisValues():
    number[] {


    const max =
      this.growthScaleMax;


    return [

      max,

      Math.round(
        max *
        .75
      ),

      Math.round(
        max *
        .5
      ),

      Math.round(
        max *
        .25
      ),

      0

    ];

  }


  get growthPoints(): {

    x:
      number;

    y:
      number;

    month:
      string;

    value:
      number;

  }[] {


    const chartWidth =
      640;


    const leftPadding =
      40;


    const availableWidth =

      chartWidth -

      (
        leftPadding *
        2
      );


    const chartBottom =
      180;


    const chartHeight =
      150;


    if (
      !this.memberGrowth.length
    ) {

      return [];

    }


    return this.memberGrowth
      .map(
        (
          item,
          index
        ) => {


          const divisor =
            Math.max(

              1,

              this.memberGrowth.length -
              1

            );


          const x =

            leftPadding

            +

            (
              index *

              (
                availableWidth /
                divisor
              )
            );


          const y =

            chartBottom

            -

            (
              item.value /
              this.growthScaleMax
            )

            *

            chartHeight;


          return {

            x,

            y,

            month:
              item.month,

            value:
              item.value

          };

        }
      );

  }


  get memberGrowthPoints():
    string {


    return this.growthPoints

      .map(
        point =>
          `${point.x},${point.y}`
      )

      .join(' ');

  }


  get memberGrowthAreaPath():
    string {


    const points =
      this.growthPoints;


    if (
      !points.length
    ) {

      return '';

    }


    const first =
      points[0];


    const last =
      points[
        points.length -
        1
      ];


    const line =
      points

        .map(
          point =>
            `L ${point.x} ${point.y}`
        )

        .join(' ');


    return `
      M ${first.x} 180
      ${line}
      L ${last.x} 180
      Z
    `;

  }


  formatCurrency(
    value:
      number
  ):
    string {


    return new Intl.NumberFormat(
      'en-IN'
    )
      .format(
        value
      );

  }


  getMemberStatusClass(
    status:
      string
  ):
    string {


    return status
      .toLowerCase();

  }


  getDaysClass(
    days:
      number
  ):
    string {


    return days <=
      30

      ? 'urgent'

      : 'normal';

  }


  getChangeClass(

    value:
      number,

    inverse:
      boolean =
      false

  ):
    string {


    if (
      value ===
      0
    ) {

      return '';

    }


    const good =

      inverse

        ? value <
          0

        : value >
          0;


    return good

      ? 'positive'

      : 'negative';

  }


  getChangeArrow(
    value:
      number
  ):
    string {


    if (
      value >
      0
    ) {

      return '↑';

    }


    if (
      value <
      0
    ) {

      return '↓';

    }


    return '–';

  }


  absolute(
    value:
      number
  ):
    number {


    return Math.abs(
      value
    );

  }

}