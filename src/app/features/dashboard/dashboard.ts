import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  Member,
  MemberService
} from '../members/services/member.service';

interface RecentMember {
  id: number;
  initials: string;
  name: string;
  memberId: string;
  joinedDate: string;
  status: string;
}

interface Renewal {
  id: number;
  name: string;
  memberId: string;
  expiryDate: string;
  daysLeft: number;
}

interface LocationRevenue {
  name: string;
  revenue: number;
  members: number;
  colorClass: string;
}

interface GrowthData {
  month: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {

  today = new Date();

  // =====================================================
  // MEMBERS FROM SHARED SERVICE
  // =====================================================

  members: Member[] = [];


  // =====================================================
  // DASHBOARD COUNTS
  // These are calculated from MemberService data
  // =====================================================

  get totalMembers(): number {

    return this.members.length;
  }


  get activeMembers(): number {

    return this.members.filter(
      member =>
        member.status.toLowerCase() === 'active'
    ).length;
  }


  get expiringSoon(): number {

    return this.members.filter(
      member =>
        member.status.toLowerCase() === 'expiring'
    ).length;
  }


  get expiredMembers(): number {

    return this.members.filter(
      member =>
        member.status.toLowerCase() === 'expired'
    ).length;
  }


  // =====================================================
  // PERCENTAGE VALUES
  // These are currently demo values.
  // Later these can come from backend reports.
  // =====================================================

  totalMembersChange = 12;

  activeMembersChange = 8;

  expiringChange = 3;

  expiredChange = 5;


  // =====================================================
  // FINANCIAL DATA
  // =====================================================

  revenue = 245000;

  expenses = 68500;

  get netProfit(): number {

    return (
      this.revenue -
      this.expenses
    );
  }

  revenueChange = 18;

  expenseChange = 6;

  profitChange = 20;


  // =====================================================
  // ATTENDANCE
  // =====================================================

  checkedIn = 86;

  notCheckedIn = 24;


  // =====================================================
  // MEMBER GROWTH
  // =====================================================

  memberGrowth: GrowthData[] = [

    {
      month: 'Mar',
      value: 10
    },

    {
      month: 'Apr',
      value: 20
    },

    {
      month: 'May',
      value: 23
    },

    {
      month: 'Jun',
      value: 22
    },

    {
      month: 'Jul',
      value: 28
    },

    {
      month: 'Aug',
      value: 35
    }

  ];


  // =====================================================
  // RECENT MEMBERS
  // Generated from MemberService
  // =====================================================

  recentMembers: RecentMember[] = [];


  // =====================================================
  // UPCOMING RENEWALS
  // Generated from MemberService
  // =====================================================

  renewals: Renewal[] = [];


  // =====================================================
  // REVENUE BY LOCATION
  // =====================================================

  locationRevenue: LocationRevenue[] = [

    {
      name: 'Main Branch',
      revenue: 48200,
      members: 46,
      colorClass: 'red'
    },

    {
      name: 'Indiranagar',
      revenue: 32650,
      members: 28,
      colorClass: 'blue'
    },

    {
      name: 'HSR Layout',
      revenue: 24300,
      members: 20,
      colorClass: 'green'
    },

    {
      name: 'North Branch',
      revenue: 18400,
      members: 16,
      colorClass: 'yellow'
    },

    {
      name: 'South Branch',
      revenue: 12750,
      members: 14,
      colorClass: 'purple'
    }

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private memberService: MemberService,
    private router: Router
  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {

    this.memberService
      .getMembers()
      .subscribe({

        next: (
          members: Member[]
        ) => {

          this.members = members;

          this.prepareRecentMembers();

          this.prepareUpcomingRenewals();
        },

        error: error => {

          console.error(
            'Error loading dashboard members:',
            error
          );

          this.members = [];

          this.recentMembers = [];

          this.renewals = [];
        }

      });
  }


  // =====================================================
  // PREPARE RECENT MEMBERS
  // =====================================================

  private prepareRecentMembers(): void {

    this.recentMembers = [

      ...this.members

    ]

      .sort(
        (
          firstMember,
          secondMember
        ) => {

          const firstDate =
            new Date(
              firstMember.joinedDate
            ).getTime();

          const secondDate =
            new Date(
              secondMember.joinedDate
            ).getTime();

          return (
            secondDate -
            firstDate
          );
        }
      )

      .slice(0, 5)

      .map(
        member => ({

          id:
            member.memberId,

          initials:
            this.getInitials(
              member
            ),

          name:
            this.getFullName(
              member
            ),

          memberId:
            member.memberCode,

          joinedDate:
            this.formatDisplayDate(
              member.joinedDate
            ),

          status:
            member.status

        })
      );
  }


  // =====================================================
  // PREPARE UPCOMING RENEWALS
  // =====================================================

  private prepareUpcomingRenewals(): void {

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    this.renewals = this.members

      .filter(
        member =>
          member.status
            .toLowerCase() ===
          'expiring'
      )

      .filter(
        member =>
          !!member.expiryDate
      )

      .map(
        member => {

          const expiry =
            new Date(
              member.expiryDate!
            );

          expiry.setHours(
            0,
            0,
            0,
            0
          );


          const millisecondsPerDay =
            1000 *
            60 *
            60 *
            24;


          const daysLeft =
            Math.max(
              0,
              Math.ceil(
                (
                  expiry.getTime() -
                  today.getTime()
                ) /
                millisecondsPerDay
              )
            );


          return {

            id:
              member.memberId,

            name:
              this.getFullName(
                member
              ),

            memberId:
              member.memberCode,

            expiryDate:
              this.formatDisplayDate(
                member.expiryDate!
              ),

            daysLeft

          };

        }
      )

      .sort(
        (
          first,
          second
        ) =>
          first.daysLeft -
          second.daysLeft
      )

      .slice(
        0,
        5
      );
  }


  // =====================================================
  // KPI NAVIGATION
  // =====================================================

  viewAllMembers(): void {

    this.router.navigate([
      '/members'
    ]);
  }


  viewActiveMembers(): void {

    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status: 'Active'
        }
      }
    );
  }


  viewExpiringMembers(): void {

    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status: 'Expiring'
        }
      }
    );
  }


  viewExpiredMembers(): void {

    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status: 'Expired'
        }
      }
    );
  }


  // =====================================================
  // RECENT MEMBER NAVIGATION
  // =====================================================

  openMember(
    member: RecentMember
  ): void {

    this.router.navigate([
      '/members',
      member.id
    ]);
  }


  // =====================================================
  // RENEWAL MEMBER NAVIGATION
  // =====================================================

  openRenewalMember(
    renewal: Renewal
  ): void {

    this.router.navigate([
      '/members',
      renewal.id
    ]);
  }


  // =====================================================
  // VIEW ALL RECENT MEMBERS
  // =====================================================

  viewAllRecentMembers(): void {

    this.router.navigate([
      '/members'
    ]);
  }


  // =====================================================
  // VIEW ALL RENEWALS
  // =====================================================

  viewAllRenewals(): void {

    this.router.navigate(
      [
        '/members'
      ],
      {
        queryParams: {
          status: 'Expiring'
        }
      }
    );
  }


  // =====================================================
  // TOTAL ATTENDANCE
  // =====================================================

  get totalAttendance(): number {

    return (
      this.checkedIn +
      this.notCheckedIn
    );
  }


  // =====================================================
  // CHECKED IN %
  // =====================================================

  get checkedInPercentage(): number {

    if (
      this.totalAttendance === 0
    ) {

      return 0;
    }


    return Math.round(

      (
        this.checkedIn /
        this.totalAttendance
      )

      * 100

    );
  }


  // =====================================================
  // NOT CHECKED IN %
  // =====================================================

  get notCheckedInPercentage(): number {

    return (
      100 -
      this.checkedInPercentage
    );
  }


  // =====================================================
  // ATTENDANCE RING
  // =====================================================

  get attendanceRingBackground(): string {

    return `conic-gradient(
      #00c896 0% ${this.checkedInPercentage}%,
      #637180 ${this.checkedInPercentage}% 100%
    )`;
  }


  // =====================================================
  // MEMBER GROWTH POINTS
  // =====================================================

  get growthPoints(): {
    x: number;
    y: number;
    month: string;
    value: number;
  }[] {

    const chartWidth = 640;

    const leftPadding = 40;

    const availableWidth =
      chartWidth -
      (
        leftPadding *
        2
      );

    const maxValue = 40;

    const chartBottom = 180;

    const chartHeight = 150;


    return this.memberGrowth.map(
      (
        item,
        index
      ) => {

        const x =
          leftPadding +
          (
            index *
            (
              availableWidth /
              (
                this.memberGrowth.length -
                1
              )
            )
          );


        const y =
          chartBottom -
          (
            item.value /
            maxValue
          ) *
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


  // =====================================================
  // SVG POLYLINE POINTS
  // =====================================================

  get memberGrowthPoints(): string {

    return this.growthPoints

      .map(
        point =>
          `${point.x},${point.y}`
      )

      .join(' ');
  }


  // =====================================================
  // SVG AREA PATH
  // =====================================================

  get memberGrowthAreaPath(): string {

    const points =
      this.growthPoints;


    if (
      points.length === 0
    ) {

      return '';
    }


    const first =
      points[0];


    const last =
      points[
        points.length - 1
      ];


    const linePath =
      points

        .map(
          point =>
            `L ${point.x} ${point.y}`
        )

        .join(' ');


    return `
      M ${first.x} 180
      ${linePath}
      L ${last.x} 180
      Z
    `;
  }


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  formatCurrency(
    value: number
  ): string {

    return new Intl.NumberFormat(
      'en-IN'
    ).format(
      value
    );
  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  private formatDisplayDate(
    value: string
  ): string {

    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;
    }


    return new Intl.DateTimeFormat(
      'en-GB',
      {
        day: '2-digit',

        month: 'short',

        year: 'numeric'
      }
    ).format(
      date
    );
  }


  // =====================================================
  // FULL NAME
  // =====================================================

  private getFullName(
    member: Member
  ): string {

    return (
      `${member.firstName} ${member.lastName}`
    );
  }


  // =====================================================
  // INITIALS
  // =====================================================

  private getInitials(
    member: Member
  ): string {

    const first =
      member.firstName
        ?.charAt(0) ??
      '';


    const last =
      member.lastName
        ?.charAt(0) ??
      '';


    return (
      first +
      last
    ).toUpperCase();
  }


  // =====================================================
  // MEMBER STATUS CLASS
  // =====================================================

  getMemberStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase();
  }


  // =====================================================
  // DAYS CLASS
  // =====================================================

  getDaysClass(
    days: number
  ): string {

    if (
      days <= 30
    ) {

      return 'urgent';
    }


    return 'normal';
  }
}