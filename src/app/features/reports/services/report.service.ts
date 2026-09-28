import {
  Injectable
} from '@angular/core';

import {
  combineLatest,
  map,
  Observable
} from 'rxjs';

import {
  InvoiceService
} from '../../accounts/services/invoice.service';

import {
  PaymentService
} from '../../accounts/services/payment.service';

import {
  ExpenseService
} from '../../accounts/services/expense.service';

import {
  RefundService
} from '../../accounts/services/refund.service';

import {
  AttendanceReportData,
  AttendanceReportRow,
  EnquirySourceReport,
  FinancialReportData,
  FinancialTransactionRow,
  MembershipPlanReport,
  MembershipReportData,
  MembershipReportRow,
  PaymentMethodReport,
  ReportFilter,
  StaffReportData,
  StaffReportRow,
  StaffRoleReport,
  VisitorEnquiryReportRow,
  VisitorReportData
} from '../models/report.model';


@Injectable({
  providedIn: 'root'
})
export class ReportService {


  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly paymentService: PaymentService,
    private readonly expenseService: ExpenseService,
    private readonly refundService: RefundService
  ) {}


  /* =====================================================
     FINANCIAL REPORT
  ===================================================== */

  getFinancialReport(
    tenantId: number,
    filter: ReportFilter
  ): Observable<FinancialReportData> {


    return combineLatest([

      this.invoiceService
        .getInvoices(
          tenantId
        ),

      this.paymentService
        .getPaymentViews(
          tenantId
        ),

      this.expenseService
        .getExpenses(
          tenantId
        ),

      this.refundService
        .getRefunds(
          tenantId
        )

    ])
      .pipe(

        map(([
          invoices,
          payments,
          expenses,
          refunds
        ]) => {


          const filteredPayments =
            payments.filter(
              payment =>

                this.inDateRange(
                  payment.paymentDate,
                  filter
                )

                &&

                this.matchesLocation(
                  payment.locationId,
                  filter.locationId
                )

                &&

                (
                  payment.paymentStatus === 'completed'
                  ||
                  payment.paymentStatus === 'refunded'
                )
            );


          const filteredExpenses =
            expenses.filter(
              expense =>

                this.inDateRange(
                  expense.expenseDate,
                  filter
                )

                &&

                this.matchesLocation(
                  expense.locationId,
                  filter.locationId
                )

                &&

                expense.status === 'approved'
            );


          const filteredRefunds =
            refunds.filter(
              refund => {


                if (
                  refund.refundStatus !==
                  'processed'
                ) {
                  return false;
                }


                if (
                  !this.inDateRange(
                    refund.refundDate,
                    filter
                  )
                ) {
                  return false;
                }


                const payment =
                  this.paymentService
                    .getPaymentById(
                      refund.paymentId,
                      tenantId
                    );


                if (!payment) {
                  return false;
                }


                return this.matchesLocation(
                  payment.locationId,
                  filter.locationId
                );

              }
            );


          const filteredInvoices =
            invoices.filter(
              invoice =>

                this.inDateRange(
                  invoice.invoiceDate,
                  filter
                )

                &&

                this.matchesLocation(
                  invoice.locationId,
                  filter.locationId
                )
            );


          const grossCollections =
            this.round(

              filteredPayments.reduce(
                (
                  total,
                  payment
                ) =>
                  total +
                  payment.amount,
                0
              )

            );


          const refundAmount =
            this.round(

              filteredRefunds.reduce(
                (
                  total,
                  refund
                ) =>
                  total +
                  refund.refundAmount,
                0
              )

            );


          const netCollections =
            this.round(
              grossCollections -
              refundAmount
            );


          const expenseAmount =
            this.round(

              filteredExpenses.reduce(
                (
                  total,
                  expense
                ) =>
                  total +
                  expense.amount,
                0
              )

            );


          const netCashFlow =
            this.round(
              netCollections -
              expenseAmount
            );


          const outstandingAmount =
            this.round(

              filteredInvoices
                .filter(
                  invoice =>
                    invoice.status === 'pending'
                    ||
                    invoice.status === 'partial'
                )
                .reduce(
                  (
                    total,
                    invoice
                  ) =>
                    total +
                    invoice.balanceAmount,
                  0
                )

            );


          /* =================================================
             DAILY REPORT
          ================================================= */

          const dates =
            this.getDateRange(
              filter.fromDate,
              filter.toDate
            );


          const daily =
            dates.map(
              date => {


                const revenue =
                  this.round(

                    filteredPayments
                      .filter(
                        payment =>
                          payment.paymentDate ===
                          date
                      )
                      .reduce(
                        (
                          total,
                          payment
                        ) =>
                          total +
                          payment.amount,
                        0
                      )

                  );


                const dayRefunds =
                  this.round(

                    filteredRefunds
                      .filter(
                        refund =>
                          refund.refundDate ===
                          date
                      )
                      .reduce(
                        (
                          total,
                          refund
                        ) =>
                          total +
                          refund.refundAmount,
                        0
                      )

                  );


                const dayExpenses =
                  this.round(

                    filteredExpenses
                      .filter(
                        expense =>
                          expense.expenseDate ===
                          date
                      )
                      .reduce(
                        (
                          total,
                          expense
                        ) =>
                          total +
                          expense.amount,
                        0
                      )

                  );


                return {

                  date,

                  revenue,

                  refunds:
                    dayRefunds,

                  expenses:
                    dayExpenses,

                  net:
                    this.round(
                      revenue -
                      dayRefunds -
                      dayExpenses
                    )

                };

              }
            );


          /* =================================================
             PAYMENT METHODS
          ================================================= */

          const methodMap =
            new Map<
              number,
              {
                name: string;
                count: number;
                amount: number;
              }
            >();


          filteredPayments
            .forEach(
              payment => {


                const current =
                  methodMap.get(
                    payment.paymentMethodId
                  );


                if (current) {

                  current.count++;

                  current.amount +=
                    payment.amount;

                }
                else {

                  methodMap.set(
                    payment.paymentMethodId,
                    {
                      name:
                        payment.paymentMethodName,

                      count:
                        1,

                      amount:
                        payment.amount
                    }
                  );

                }

              }
            );


          const paymentMethods:
            PaymentMethodReport[] =

            Array
              .from(
                methodMap.entries()
              )
              .map(
                ([
                  paymentMethodId,
                  value
                ]) => ({

                  paymentMethodId,

                  paymentMethodName:
                    value.name,

                  transactionCount:
                    value.count,

                  amount:
                    this.round(
                      value.amount
                    ),

                  percentage:
                    grossCollections > 0
                      ? Math.round(
                          (
                            value.amount /
                            grossCollections
                          )
                          *
                          100
                        )
                      : 0

                })
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  b.amount -
                  a.amount
              );


          /* =================================================
             TRANSACTIONS
          ================================================= */

          const transactions:
            FinancialTransactionRow[] = [];


          filteredPayments
            .forEach(
              payment => {

                transactions.push({

                  id:
                    payment.paymentNumber,

                  date:
                    payment.paymentDate,

                  type:
                    'payment',

                  description:
                    payment.invoiceNumber !== '-'
                      ? payment.invoiceNumber
                      : 'Payment',

                  method:
                    payment.paymentMethodName,

                  amount:
                    payment.amount

                });

              }
            );


          filteredExpenses
            .forEach(
              expense => {

                transactions.push({

                  id:
                    `EXP-${expense.expenseId}`,

                  date:
                    expense.expenseDate,

                  type:
                    'expense',

                  description:
                    expense.description,

                  method:
                    expense.category,

                  amount:
                    expense.amount

                });

              }
            );


          filteredRefunds
            .forEach(
              refund => {

                transactions.push({

                  id:
                    `REF-${refund.refundId}`,

                  date:
                    refund.refundDate,

                  type:
                    'refund',

                  description:
                    refund.paymentNumber,

                  method:
                    refund.paymentMethodName,

                  amount:
                    refund.refundAmount

                });

              }
            );


          transactions.sort(
            (
              a,
              b
            ) =>
              b.date.localeCompare(
                a.date
              )
          );


          return {

            summary: {

              grossCollections,

              refunds:
                refundAmount,

              netCollections,

              expenses:
                expenseAmount,

              netCashFlow,

              outstandingAmount

            },

            daily,

            paymentMethods,

            transactions:
              transactions.slice(
                0,
                15
              )

          };

        })

      );

  }


  /* =====================================================
     MEMBERSHIP REPORT

     Temporary frontend data.
     Replace using MemberService later.
  ===================================================== */

  getMembershipReport(
    filter: ReportFilter
  ): MembershipReportData {


    const members:
      MembershipReportRow[] = [

      {
        memberId: 101,
        memberCode: 'MEM-001',
        memberName: 'Arun Kumar',
        planName: 'Gold',
        locationId: 1,
        locationName: 'Main Branch',
        joinedDate: '2026-01-12',
        expiryDate: '2027-01-11',
        renewalDate: '2026-09-12',
        status: 'active'
      },

      {
        memberId: 102,
        memberCode: 'MEM-002',
        memberName: 'Rahul Sharma',
        planName: 'Premium',
        locationId: 1,
        locationName: 'Main Branch',
        joinedDate: '2026-03-03',
        expiryDate: '2026-10-02',
        renewalDate: '2026-09-03',
        status: 'expiring'
      },

      {
        memberId: 103,
        memberCode: 'MEM-003',
        memberName: 'Kiran R',
        planName: 'Monthly',
        locationId: 2,
        locationName: 'Branch 2',
        joinedDate: '2026-09-05',
        expiryDate: '2026-10-04',
        renewalDate: null,
        status: 'active'
      },

      {
        memberId: 104,
        memberCode: 'MEM-004',
        memberName: 'Sandeep Kumar',
        planName: 'Gold',
        locationId: 1,
        locationName: 'Main Branch',
        joinedDate: '2025-09-01',
        expiryDate: '2026-08-31',
        renewalDate: null,
        status: 'expired'
      },

      {
        memberId: 105,
        memberCode: 'MEM-005',
        memberName: 'Priya S',
        planName: 'Premium',
        locationId: 2,
        locationName: 'Branch 2',
        joinedDate: '2026-09-18',
        expiryDate: '2027-09-17',
        renewalDate: null,
        status: 'active'
      },

      {
        memberId: 106,
        memberCode: 'MEM-006',
        memberName: 'Naveen K',
        planName: 'Monthly',
        locationId: 1,
        locationName: 'Main Branch',
        joinedDate: '2026-09-20',
        expiryDate: '2026-10-19',
        renewalDate: null,
        status: 'active'
      }

    ];


    const filtered =
      members.filter(
        member =>
          this.matchesLocation(
            member.locationId,
            filter.locationId
          )
      );


    const newMembers =
      filtered.filter(
        member =>
          this.inDateRange(
            member.joinedDate,
            filter
          )
      ).length;


    const renewals =
      filtered.filter(
        member =>
          !!member.renewalDate
          &&
          this.inDateRange(
            member.renewalDate!,
            filter
          )
      ).length;


    const planMap =
      new Map<
        string,
        number
      >();


    filtered.forEach(
      member => {

        planMap.set(

          member.planName,

          (
            planMap.get(
              member.planName
            )
            ?? 0
          ) + 1

        );

      }
    );


    const plans:
      MembershipPlanReport[] =

      Array
        .from(
          planMap.entries()
        )
        .map(
          ([
            planName,
            memberCount
          ]) => ({

            planName,

            memberCount,

            percentage:
              filtered.length > 0
                ? Math.round(
                    (
                      memberCount /
                      filtered.length
                    )
                    *
                    100
                  )
                : 0

          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.memberCount -
            a.memberCount
        );


    return {

      summary: {

        totalMembers:
          filtered.length,

        activeMembers:
          filtered.filter(
            member =>
              member.status ===
              'active'
          ).length,

        expiredMembers:
          filtered.filter(
            member =>
              member.status ===
              'expired'
          ).length,

        expiringSoon:
          filtered.filter(
            member =>
              member.status ===
              'expiring'
          ).length,

        newMembers,

        renewals

      },

      members:
        filtered,

      plans

    };

  }


  /* =====================================================
     ATTENDANCE REPORT
  ===================================================== */

  getAttendanceReport(
    filter: ReportFilter
  ): AttendanceReportData {


    const people = [

      {
        personId: 101,
        code: 'MEM-001',
        name: 'Arun Kumar',
        personType: 'member' as const,
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        personId: 102,
        code: 'MEM-002',
        name: 'Rahul Sharma',
        personType: 'member' as const,
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        personId: 103,
        code: 'MEM-003',
        name: 'Kiran R',
        personType: 'member' as const,
        locationId: 2,
        locationName: 'Branch 2'
      },

      {
        personId: 104,
        code: 'MEM-004',
        name: 'Sandeep Kumar',
        personType: 'member' as const,
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        personId: 105,
        code: 'MEM-005',
        name: 'Priya S',
        personType: 'member' as const,
        locationId: 2,
        locationName: 'Branch 2'
      },

      {
        personId: 201,
        code: 'STF-001',
        name: 'Ravi Kumar',
        personType: 'staff' as const,
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        personId: 202,
        code: 'STF-002',
        name: 'Anil S',
        personType: 'staff' as const,
        locationId: 1,
        locationName: 'Main Branch'
      },

      {
        personId: 203,
        code: 'STF-003',
        name: 'Megha R',
        personType: 'staff' as const,
        locationId: 2,
        locationName: 'Branch 2'
      }

    ];


    const totalDays =
      Math.max(
        1,
        this.getDateRange(
          filter.fromDate,
          filter.toDate
        ).length
      );


    const rows:
      AttendanceReportRow[] =

      people
        .filter(
          person =>
            this.matchesLocation(
              person.locationId,
              filter.locationId
            )
        )
        .map(
          (
            person,
            index
          ) => {


            const absent =
              Math.min(
                totalDays,
                (
                  index %
                  4
                ) + 1
              );


            const present =
              Math.max(
                0,
                totalDays -
                absent
              );


            const marked =
              present +
              absent;


            return {

              ...person,

              present,

              absent,

              attendanceRate:
                marked > 0
                  ? Math.round(
                      (
                        present /
                        marked
                      )
                      *
                      100
                    )
                  : 0

            };

          }
        );


    const totalPresent =
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          row.present,
        0
      );


    const totalAbsent =
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          row.absent,
        0
      );


    const totalMarked =
      totalPresent +
      totalAbsent;


    return {

      summary: {

        totalPeople:
          rows.length,

        totalPresent,

        totalAbsent,

        attendanceRate:
          totalMarked > 0
            ? Math.round(
                (
                  totalPresent /
                  totalMarked
                )
                *
                100
              )
            : 0

      },

      rows

    };

  }


  /* =====================================================
     STAFF REPORT
  ===================================================== */

  getStaffReport(
    filter: ReportFilter
  ): StaffReportData {


    const staffSource = [

      {
        staffId: 201,
        staffCode: 'STF-001',
        staffName: 'Ravi Kumar',
        role: 'Trainer',
        locationId: 1,
        locationName: 'Main Branch',
        joiningDate: '2025-06-10',
        status: 'active' as const
      },

      {
        staffId: 202,
        staffCode: 'STF-002',
        staffName: 'Anil S',
        role: 'Manager',
        locationId: 1,
        locationName: 'Main Branch',
        joiningDate: '2024-11-15',
        status: 'active' as const
      },

      {
        staffId: 203,
        staffCode: 'STF-003',
        staffName: 'Megha R',
        role: 'Trainer',
        locationId: 2,
        locationName: 'Branch 2',
        joiningDate: '2026-02-01',
        status: 'active' as const
      },

      {
        staffId: 204,
        staffCode: 'STF-004',
        staffName: 'Karthik M',
        role: 'Receptionist',
        locationId: 1,
        locationName: 'Main Branch',
        joiningDate: '2026-03-18',
        status: 'active' as const
      },

      {
        staffId: 205,
        staffCode: 'STF-005',
        staffName: 'Divya S',
        role: 'Trainer',
        locationId: 2,
        locationName: 'Branch 2',
        joiningDate: '2025-08-12',
        status: 'inactive' as const
      }

    ];


    const totalDays =
      Math.max(
        1,
        this.getDateRange(
          filter.fromDate,
          filter.toDate
        ).length
      );


    const rows:
      StaffReportRow[] =

      staffSource
        .filter(
          staff =>
            this.matchesLocation(
              staff.locationId,
              filter.locationId
            )
        )
        .map(
          (
            staff,
            index
          ) => {


            const absent =
              Math.min(
                totalDays,
                (
                  index %
                  4
                ) + 1
              );


            const present =
              Math.max(
                0,
                totalDays -
                absent
              );


            return {

              ...staff,

              present,

              absent,

              attendanceRate:
                Math.round(
                  (
                    present /
                    totalDays
                  )
                  *
                  100
                )

            };

          }
        );


    const totalPresent =
      rows.reduce(
        (
          total,
          item
        ) =>
          total +
          item.present,
        0
      );


    const totalAbsent =
      rows.reduce(
        (
          total,
          item
        ) =>
          total +
          item.absent,
        0
      );


    const totalMarked =
      totalPresent +
      totalAbsent;


    const roleMap =
      new Map<
        string,
        number
      >();


    rows.forEach(
      item => {

        roleMap.set(

          item.role,

          (
            roleMap.get(
              item.role
            )
            ?? 0
          ) + 1

        );

      }
    );


    const roles:
      StaffRoleReport[] =

      Array
        .from(
          roleMap.entries()
        )
        .map(
          ([
            role,
            count
          ]) => ({

            role,

            count,

            percentage:
              rows.length > 0
                ? Math.round(
                    (
                      count /
                      rows.length
                    )
                    *
                    100
                  )
                : 0

          })
        );


    return {

      summary: {

        totalStaff:
          rows.length,

        activeStaff:
          rows.filter(
            item =>
              item.status === 'active'
          ).length,

        trainers:
          rows.filter(
            item =>
              item.role === 'Trainer'
          ).length,

        managers:
          rows.filter(
            item =>
              item.role === 'Manager'
          ).length,

        totalPresent,

        totalAbsent,

        attendanceRate:
          totalMarked > 0
            ? Math.round(
                (
                  totalPresent /
                  totalMarked
                )
                *
                100
              )
            : 0

      },

      rows,

      roles

    };

  }


  /* =====================================================
     VISITORS / ENQUIRIES
  ===================================================== */

  getVisitorReport(
    filter: ReportFilter
  ): VisitorReportData {


    const enquiries:
      VisitorEnquiryReportRow[] = [

      {
        enquiryId: 1,
        name: 'Aditya Rao',
        phone: '9876543210',
        enquiryDate: '2026-09-03',
        locationId: 1,
        locationName: 'Main Branch',
        source: 'Walk-in',
        interestedPlan: 'Gold',
        status: 'converted',
        followUpDate: null
      },

      {
        enquiryId: 2,
        name: 'Sneha K',
        phone: '9876543211',
        enquiryDate: '2026-09-05',
        locationId: 1,
        locationName: 'Main Branch',
        source: 'Instagram',
        interestedPlan: 'Premium',
        status: 'follow_up',
        followUpDate: '2026-09-29'
      },

      {
        enquiryId: 3,
        name: 'Manoj R',
        phone: '9876543212',
        enquiryDate: '2026-09-08',
        locationId: 2,
        locationName: 'Branch 2',
        source: 'Referral',
        interestedPlan: 'Monthly',
        status: 'visited',
        followUpDate: '2026-09-30'
      },

      {
        enquiryId: 4,
        name: 'Anusha S',
        phone: '9876543213',
        enquiryDate: '2026-09-11',
        locationId: 1,
        locationName: 'Main Branch',
        source: 'Google',
        interestedPlan: 'Premium',
        status: 'converted',
        followUpDate: null
      },

      {
        enquiryId: 5,
        name: 'Vijay Kumar',
        phone: '9876543214',
        enquiryDate: '2026-09-16',
        locationId: 2,
        locationName: 'Branch 2',
        source: 'Walk-in',
        interestedPlan: 'Gold',
        status: 'new',
        followUpDate: '2026-09-29'
      },

      {
        enquiryId: 6,
        name: 'Deepa M',
        phone: '9876543215',
        enquiryDate: '2026-09-18',
        locationId: 1,
        locationName: 'Main Branch',
        source: 'Referral',
        interestedPlan: 'Monthly',
        status: 'lost',
        followUpDate: null
      },

      {
        enquiryId: 7,
        name: 'Suresh B',
        phone: '9876543216',
        enquiryDate: '2026-09-22',
        locationId: 1,
        locationName: 'Main Branch',
        source: 'Instagram',
        interestedPlan: 'Gold',
        status: 'visited',
        followUpDate: '2026-09-29'
      }

    ];


    const filtered =
      enquiries.filter(
        item =>

          this.inDateRange(
            item.enquiryDate,
            filter
          )

          &&

          this.matchesLocation(
            item.locationId,
            filter.locationId
          )
      );


    const converted =
      filtered.filter(
        item =>
          item.status ===
          'converted'
      ).length;


    const visitors =
      filtered.filter(
        item =>
          item.status ===
            'visited'
          ||
          item.status ===
            'converted'
      ).length;


    const pending =
      filtered.filter(
        item =>
          item.status === 'new'
          ||
          item.status === 'follow_up'
          ||
          item.status === 'visited'
      ).length;


    const lost =
      filtered.filter(
        item =>
          item.status ===
          'lost'
      ).length;


    const sourceMap =
      new Map<
        string,
        number
      >();


    filtered.forEach(
      item => {

        sourceMap.set(

          item.source,

          (
            sourceMap.get(
              item.source
            )
            ?? 0
          ) + 1

        );

      }
    );


    const sources:
      EnquirySourceReport[] =

      Array
        .from(
          sourceMap.entries()
        )
        .map(
          ([
            source,
            count
          ]) => ({

            source,

            count,

            percentage:
              filtered.length > 0
                ? Math.round(
                    (
                      count /
                      filtered.length
                    )
                    *
                    100
                  )
                : 0

          })
        );


    return {

      summary: {

        totalEnquiries:
          filtered.length,

        totalVisitors:
          visitors,

        convertedMembers:
          converted,

        pendingFollowUps:
          pending,

        lostEnquiries:
          lost,

        conversionRate:
          filtered.length > 0
            ? Math.round(
                (
                  converted /
                  filtered.length
                )
                *
                100
              )
            : 0

      },

      rows:
        filtered,

      sources

    };

  }


  /* =====================================================
     HELPERS
  ===================================================== */

  private matchesLocation(
    locationId: number,
    selectedLocation: number | null
  ): boolean {


    return (
      !selectedLocation
      ||
      locationId ===
      selectedLocation
    );

  }


  private inDateRange(
    date: string,
    filter: ReportFilter
  ): boolean {


    return (
      date >=
      filter.fromDate
      &&
      date <=
      filter.toDate
    );

  }


  private getDateRange(
    fromDate: string,
    toDate: string
  ): string[] {


    const result:
      string[] = [];


    const current =
      new Date(
        `${fromDate}T00:00:00`
      );


    const end =
      new Date(
        `${toDate}T00:00:00`
      );


    let count = 0;


    while (
      current <= end
      &&
      count < 370
    ) {


      result.push(
        this.toDateKey(
          current
        )
      );


      current.setDate(
        current.getDate() + 1
      );


      count++;

    }


    return result;

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


  private round(
    value: number
  ): number {


    return Math.round(
      (
        value +
        Number.EPSILON
      )
      *
      100
    ) / 100;

  }

}