import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  AttendanceReportData,
  DailyFinancialReport,
  FinancialReportData,
  MembershipReportData,
  ReportFilter,
  ReportLocation,
  ReportType,
  StaffReportData,
  VisitorReportData
} from '../../models/report.model';

import {
  ReportService
} from '../../services/report.service';


@Component({
  selector:
    'app-reports-dashboard',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './reports-dashboard.html',

  styleUrl:
    './reports-dashboard.scss'
})
export class ReportsDashboardComponent
  implements OnInit {


  readonly tenantId = 1;


  activeReport:
    ReportType =
    'financial';


  loading = false;


  locations:
    ReportLocation[] = [

      {
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        locationId: 2,
        locationName: 'Branch 2'
      }

    ];


  filter:
    ReportFilter = {

      fromDate:
        this.firstDayOfCurrentMonth(),

      toDate:
        this.today(),

      locationId:
        null,

      reportType:
        'financial'

    };


  financialReport?:
    FinancialReportData;


  membershipReport?:
    MembershipReportData;


  attendanceReport?:
    AttendanceReportData;


  staffReport?:
    StaffReportData;


  visitorReport?:
    VisitorReportData;


  constructor(
    private readonly reportService:
      ReportService
  ) {}


  ngOnInit(): void {

    this.loadReport();

  }


  /* =====================================================
     REPORT TYPE
  ===================================================== */

  setReport(
    type: ReportType
  ): void {


    this.activeReport =
      type;


    this.filter.reportType =
      type;


    this.loadReport();

  }


  /* =====================================================
     LOAD
  ===================================================== */

  loadReport(): void {


    if (
      !this.filter.fromDate
      ||
      !this.filter.toDate
    ) {

      return;

    }


    if (
      this.filter.fromDate >
      this.filter.toDate
    ) {

      alert(
        'From Date cannot be after To Date.'
      );

      return;

    }


    this.loading =
      true;


    if (
      this.activeReport ===
      'financial'
    ) {

      this.reportService
        .getFinancialReport(
          this.tenantId,
          this.filter
        )
        .subscribe(
          report => {

            this.financialReport =
              report;

            this.loading =
              false;

          }
        );

      return;

    }


    if (
      this.activeReport ===
      'membership'
    ) {

      this.membershipReport =
        this.reportService
          .getMembershipReport(
            this.filter
          );

      this.loading =
        false;

      return;

    }


    if (
      this.activeReport ===
      'attendance'
    ) {

      this.attendanceReport =
        this.reportService
          .getAttendanceReport(
            this.filter
          );

      this.loading =
        false;

      return;

    }


    if (
      this.activeReport ===
      'staff'
    ) {

      this.staffReport =
        this.reportService
          .getStaffReport(
            this.filter
          );

      this.loading =
        false;

      return;

    }


    this.visitorReport =
      this.reportService
        .getVisitorReport(
          this.filter
        );


    this.loading =
      false;

  }


  /* =====================================================
     CLEAR
  ===================================================== */

  clearFilters(): void {


    this.filter = {

      fromDate:
        this.firstDayOfCurrentMonth(),

      toDate:
        this.today(),

      locationId:
        null,

      reportType:
        this.activeReport

    };


    this.loadReport();

  }


  /* =====================================================
     FINANCIAL CHART
  ===================================================== */

  getRevenueHeight(
    point:
      DailyFinancialReport
  ): number {


    if (
      !this.financialReport
    ) {

      return 0;

    }


    const max =
      Math.max(

        1,

        ...this.financialReport
          .daily
          .map(
            item =>
              Math.max(
                item.revenue,
                item.expenses
              )
          )

      );


    return (
      point.revenue /
      max
    ) * 100;

  }


  getExpenseHeight(
    point:
      DailyFinancialReport
  ): number {


    if (
      !this.financialReport
    ) {

      return 0;

    }


    const max =
      Math.max(

        1,

        ...this.financialReport
          .daily
          .map(
            item =>
              Math.max(
                item.revenue,
                item.expenses
              )
          )

      );


    return (
      point.expenses /
      max
    ) * 100;

  }


  /* =====================================================
     EXPORT
  ===================================================== */

  exportCsv(): void {


    let rows:
      string[][] = [];


    if (
      this.activeReport ===
        'financial'
      &&
      this.financialReport
    ) {

      rows = [

        [
          'Date',
          'Revenue',
          'Refunds',
          'Expenses',
          'Net'
        ],

        ...this.financialReport
          .daily
          .map(
            row => [

              row.date,

              String(
                row.revenue
              ),

              String(
                row.refunds
              ),

              String(
                row.expenses
              ),

              String(
                row.net
              )

            ]
          )

      ];

    }


    if (
      this.activeReport ===
        'membership'
      &&
      this.membershipReport
    ) {

      rows = [

        [
          'Code',
          'Member',
          'Plan',
          'Location',
          'Joined',
          'Expiry',
          'Status'
        ],

        ...this.membershipReport
          .members
          .map(
            member => [

              member.memberCode,

              member.memberName,

              member.planName,

              member.locationName,

              member.joinedDate,

              member.expiryDate,

              member.status

            ]
          )

      ];

    }


    if (
      this.activeReport ===
        'attendance'
      &&
      this.attendanceReport
    ) {

      rows = [

        [
          'Code',
          'Name',
          'Type',
          'Location',
          'Present',
          'Absent',
          'Rate'
        ],

        ...this.attendanceReport
          .rows
          .map(
            row => [

              row.code,

              row.name,

              row.personType,

              row.locationName,

              String(
                row.present
              ),

              String(
                row.absent
              ),

              `${row.attendanceRate}%`

            ]
          )

      ];

    }


    if (
      this.activeReport ===
        'staff'
      &&
      this.staffReport
    ) {

      rows = [

        [
          'Staff Code',
          'Name',
          'Role',
          'Location',
          'Present',
          'Absent',
          'Rate',
          'Status'
        ],

        ...this.staffReport
          .rows
          .map(
            row => [

              row.staffCode,

              row.staffName,

              row.role,

              row.locationName,

              String(
                row.present
              ),

              String(
                row.absent
              ),

              `${row.attendanceRate}%`,

              row.status

            ]
          )

      ];

    }


    if (
      this.activeReport ===
        'visitors'
      &&
      this.visitorReport
    ) {

      rows = [

        [
          'Name',
          'Phone',
          'Date',
          'Location',
          'Source',
          'Plan',
          'Follow Up',
          'Status'
        ],

        ...this.visitorReport
          .rows
          .map(
            row => [

              row.name,

              row.phone,

              row.enquiryDate,

              row.locationName,

              row.source,

              row.interestedPlan,

              row.followUpDate
                ?? '',

              row.status

            ]
          )

      ];

    }


    if (
      !rows.length
    ) {

      return;

    }


    const csv =
      rows
        .map(
          row =>
            row
              .map(
                value =>
                  `"${String(value)
                    .replace(
                      /"/g,
                      '""'
                    )}"`
              )
              .join(',')
        )
        .join('\n');


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    link.download =
      `${this.activeReport}-report-${this.filter.fromDate}-${this.filter.toDate}.csv`;


    document.body
      .appendChild(
        link
      );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );

  }


  printReport(): void {

    window.print();

  }


  /* =====================================================
     DATE
  ===================================================== */

  private today(): string {


    return this.toDateKey(
      new Date()
    );

  }


  private firstDayOfCurrentMonth():
    string {


    const date =
      new Date();


    return [

      date.getFullYear(),

      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      ),

      '01'

    ].join('-');

  }


  private toDateKey(
    date: Date
  ): string {


    return [

      date.getFullYear(),

      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      ),

      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      )

    ].join('-');

  }

}