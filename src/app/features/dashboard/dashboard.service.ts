import {
  Injectable
} from '@angular/core';

import {
  combineLatest,
  map,
  Observable,
  shareReplay
} from 'rxjs';

import {
  Member,
  MemberService
} from '../members/services/member.service';

import {
  Invoice
} from '../accounts/models/invoice.model';

import {
  PaymentView
} from '../accounts/models/payment.model';

import {
  Expense
} from '../accounts/models/expense.model';

import {
  RefundView
} from '../accounts/models/refund.model';

import {
  InvoiceService
} from '../accounts/services/invoice.service';

import {
  PaymentService
} from '../accounts/services/payment.service';

import {
  ExpenseService
} from '../accounts/services/expense.service';

import {
  RefundService
} from '../accounts/services/refund.service';

import {
  AttendancePerson,
  AttendanceRecord,
  AttendanceService
} from '../attendance/services/attendance.service';

import {
  Enquiry,
  EnquiryService
} from '../enquiries/services/enquiry.service';


export interface DashboardRecentMember {

  id: number;

  initials: string;

  name: string;

  memberId: string;

  joinedDate: string;

  status: string;

}


export interface DashboardRenewal {

  id: number;

  name: string;

  memberId: string;

  expiryDate: string;

  daysLeft: number;

}


export interface DashboardLocationRevenue {

  name: string;

  revenue: number;

  members: number;

  colorClass: string;

}


export interface DashboardGrowthData {

  month: string;

  value: number;

}


export interface DashboardOverduePayment {

  invoiceId: number;

  memberIdNumber:
    number | null;

  initials: string;

  name: string;

  memberId: string;

  amountDue: number;

  daysOverdue: number;

}


export interface DashboardSnapshot {

  totalMembers: number;

  activeMembers: number;

  expiringSoon: number;

  expiredMembers: number;

  totalMembersChange: number;

  activeMembersChange: number;

  expiringChange: number;

  expiredChange: number;


  revenue: number;

  expenses: number;

  netProfit: number;

  revenueChange: number;

  expenseChange: number;

  profitChange: number;


  checkedIn: number;

  notCheckedIn: number;


  totalEnquiries: number;

  convertedEnquiries: number;


  memberGrowth:
    DashboardGrowthData[];

  recentMembers:
    DashboardRecentMember[];

  renewals:
    DashboardRenewal[];

  overduePayments:
    DashboardOverduePayment[];

  locationRevenue:
    DashboardLocationRevenue[];

}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {


  private readonly tenantId =
    1;


  constructor(

    private readonly memberService:
      MemberService,

    private readonly invoiceService:
      InvoiceService,

    private readonly paymentService:
      PaymentService,

    private readonly expenseService:
      ExpenseService,

    private readonly refundService:
      RefundService,

    private readonly attendanceService:
      AttendanceService,

    private readonly enquiryService:
      EnquiryService

  ) {}


  /*
   * Dashboard has no separate business data anymore.
   *
   * It reacts whenever any shared service changes.
   */
  getDashboard():
    Observable<
      DashboardSnapshot
    > {


    return combineLatest([

      this.memberService
        .getMembers(),

      this.invoiceService
        .getInvoices(
          this.tenantId
        ),

      this.paymentService
        .getPaymentViews(
          this.tenantId
        ),

      this.expenseService
        .getExpenses(
          this.tenantId
        ),

      this.refundService
        .getRefunds(
          this.tenantId
        ),

      this.attendanceService
        .getPeople(),

      this.attendanceService
        .getAttendance(),

      this.enquiryService
        .getEnquiriesObservable()

    ])
      .pipe(

        map(
          ([
            members,
            invoices,
            payments,
            expenses,
            refunds,
            attendancePeople,
            attendance,
            enquiries
          ]) =>

            this.buildDashboard(

              members,

              invoices,

              payments,

              expenses,

              refunds,

              attendancePeople,

              attendance,

              enquiries

            )
        ),

        shareReplay({
          bufferSize:
            1,

          refCount:
            true
        })

      );

  }


  private buildDashboard(

    members:
      Member[],

    invoices:
      Invoice[],

    payments:
      PaymentView[],

    expenses:
      Expense[],

    refunds:
      RefundView[],

    attendancePeople:
      AttendancePerson[],

    attendance:
      AttendanceRecord[],

    enquiries:
      Enquiry[]

  ):
    DashboardSnapshot {


    const now =
      new Date();


    const today =
      this.toDateKey(
        now
      );


    // ===================================================
    // MEMBERS
    // ===================================================

    const totalMembers =
      members.length;


    const activeMembers =
      this.countMemberStatus(
        members,
        'active'
      );


    const expiringSoon =
      this.countMemberStatus(
        members,
        'expiring'
      );


    const expiredMembers =
      this.countMemberStatus(
        members,
        'expired'
      );


    const memberChanges =
      this.calculateMemberChanges(

        members,

        {
          totalMembers,
          activeMembers,
          expiringSoon,
          expiredMembers
        },

        now

      );


    // ===================================================
    // FINANCE - LAST SIX MONTHS
    // ===================================================

    const sixMonthStart =
      new Date(

        now.getFullYear(),

        now.getMonth() -
        5,

        1

      );


    const sixMonthStartKey =
      this.toDateKey(
        sixMonthStart
      );


    const revenue =
      this.calculateNetRevenue(

        payments,

        refunds,

        sixMonthStartKey,

        today

      );


    const expenseTotal =
      this.calculateExpenses(

        expenses,

        sixMonthStartKey,

        today

      );


    const netProfit =
      this.round(

        revenue -
        expenseTotal

      );


    const financeChanges =
      this.calculateFinancialChanges(

        payments,

        refunds,

        expenses,

        now

      );


    // ===================================================
    // TODAY ATTENDANCE
    // ===================================================

    const activePeople =
      attendancePeople
        .filter(
          person =>
            person.isActive
        );


    const activePersonIds =
      new Set(
        activePeople.map(
          person =>
            person.id
        )
      );


    const todaysAttendance =
      attendance
        .filter(
          record =>

            record.date ===
              today

            &&

            activePersonIds.has(
              record.personId
            )
        );


    const checkedIn =
      todaysAttendance
        .filter(
          record =>
            record.status ===
            'present'
        )
        .length;


    const notCheckedIn =
      Math.max(

        0,

        activePeople.length -
        checkedIn

      );


    // ===================================================
    // CURRENT MONTH ENQUIRIES
    // ===================================================

    const currentMonthStart =
      this.toDateKey(

        new Date(

          now.getFullYear(),

          now.getMonth(),

          1

        )

      );


    const currentEnquiries =
      enquiries
        .filter(
          enquiry =>

            enquiry.enquiryDate >=
              currentMonthStart

            &&

            enquiry.enquiryDate <=
              today
        );


    const convertedEnquiries =
      currentEnquiries
        .filter(
          enquiry =>
            enquiry.status ===
            'Converted'
        )
        .length;


    return {

      totalMembers,

      activeMembers,

      expiringSoon,

      expiredMembers,


      totalMembersChange:
        memberChanges
          .totalMembersChange,

      activeMembersChange:
        memberChanges
          .activeMembersChange,

      expiringChange:
        memberChanges
          .expiringChange,

      expiredChange:
        memberChanges
          .expiredChange,


      revenue,

      expenses:
        expenseTotal,

      netProfit,

      revenueChange:
        financeChanges
          .revenueChange,

      expenseChange:
        financeChanges
          .expenseChange,

      profitChange:
        financeChanges
          .profitChange,


      checkedIn,

      notCheckedIn,


      totalEnquiries:
        currentEnquiries.length,

      convertedEnquiries,


      memberGrowth:
        this.prepareMemberGrowth(
          members,
          now
        ),


      recentMembers:
        this.prepareRecentMembers(
          members
        ),


      renewals:
        this.prepareUpcomingRenewals(
          members,
          now
        ),


      overduePayments:
        this.prepareOverduePayments(

          invoices,

          members,

          today

        ),


      locationRevenue:
        this.prepareLocationRevenue(

          members,

          payments,

          refunds,

          sixMonthStartKey,

          today

        )

    };

  }


  private countMemberStatus(

    members:
      Member[],

    status:
      string

  ):
    number {


    return members
      .filter(
        member =>

          member.status
            .toLowerCase() ===
          status
      )
      .length;

  }


  private calculateMemberChanges(

    members:
      Member[],

    current: {

      totalMembers:
        number;

      activeMembers:
        number;

      expiringSoon:
        number;

      expiredMembers:
        number;

    },

    now:
      Date

  ) {


    const previousMonthEnd =
      new Date(

        now.getFullYear(),

        now.getMonth(),

        0

      );


    const previousKey =
      this.toDateKey(
        previousMonthEnd
      );


    const expiryLimit =
      new Date(
        previousMonthEnd
      );


    expiryLimit.setDate(

      expiryLimit.getDate()

      +

      30

    );


    const expiryLimitKey =
      this.toDateKey(
        expiryLimit
      );


    const previousMembers =
      members.filter(
        member =>

          member.joinedDate <=
          previousKey
      );


    const previousTotal =
      previousMembers.length;


    const previousExpired =
      previousMembers
        .filter(
          member =>

            !!member.expiryDate

            &&

            member.expiryDate <
            previousKey
        )
        .length;


    const previousExpiring =
      previousMembers
        .filter(
          member =>

            !!member.expiryDate

            &&

            member.expiryDate >=
            previousKey

            &&

            member.expiryDate <=
            expiryLimitKey
        )
        .length;


    const previousActive =
      Math.max(

        0,

        previousTotal -
        previousExpired -
        previousExpiring

      );


    return {

      totalMembersChange:
        this.percentageChange(
          current.totalMembers,
          previousTotal
        ),

      activeMembersChange:
        this.percentageChange(
          current.activeMembers,
          previousActive
        ),

      expiringChange:
        this.percentageChange(
          current.expiringSoon,
          previousExpiring
        ),

      expiredChange:
        this.percentageChange(
          current.expiredMembers,
          previousExpired
        )

    };

  }


  private prepareRecentMembers(
    members:
      Member[]
  ):
    DashboardRecentMember[] {


    return [

      ...members

    ]

      .sort(
        (
          a,
          b
        ) =>

          b.joinedDate
            .localeCompare(
              a.joinedDate
            )
      )

      .slice(
        0,
        5
      )

      .map(
        member => ({

          id:
            member.memberId,

          initials:
            this.getInitials(

              member.firstName,

              member.lastName

            ),

          name:
            `${member.firstName} ${member.lastName}`,

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


  private prepareUpcomingRenewals(

    members:
      Member[],

    now:
      Date

  ):
    DashboardRenewal[] {


    const today =
      this.startOfDay(
        now
      );


    return members

      .filter(
        member =>

          member.status
            .toLowerCase() ===
            'expiring'

          &&

          !!member.expiryDate
      )

      .map(
        member => {


          const expiry =
            this.startOfDay(

              new Date(
                `${member.expiryDate}T00:00:00`
              )

            );


          const daysLeft =
            Math.max(

              0,

              Math.ceil(

                (
                  expiry.getTime() -
                  today.getTime()
                )

                /

                86400000

              )

            );


          return {

            id:
              member.memberId,

            name:
              `${member.firstName} ${member.lastName}`,

            memberId:
              member.memberCode,

            expiryDate:
              this.formatDisplayDate(
                member.expiryDate
              ),

            daysLeft

          };

        }
      )

      .sort(
        (
          a,
          b
        ) =>

          a.daysLeft -
          b.daysLeft
      )

      .slice(
        0,
        5
      );

  }


  private prepareMemberGrowth(

    members:
      Member[],

    now:
      Date

  ):
    DashboardGrowthData[] {


    const result:
      DashboardGrowthData[] =
      [];


    for (
      let offset = 5;
      offset >= 0;
      offset--
    ) {


      const date =
        new Date(

          now.getFullYear(),

          now.getMonth() -
          offset,

          1

        );


      const year =
        date.getFullYear();


      const month =
        date.getMonth();


      const count =
        members
          .filter(
            member => {


              const joined =
                new Date(
                  `${member.joinedDate}T00:00:00`
                );


              return (

                joined.getFullYear() ===
                  year

                &&

                joined.getMonth() ===
                  month

              );

            }
          )
          .length;


      result.push({

        month:
          date.toLocaleDateString(
            'en-IN',
            {
              month:
                'short'
            }
          ),

        value:
          count

      });

    }


    return result;

  }


  private prepareOverduePayments(

    invoices:
      Invoice[],

    members:
      Member[],

    today:
      string

  ):
    DashboardOverduePayment[] {


    return invoices

      .filter(
        invoice =>

          (
            invoice.status ===
              'pending'

            ||

            invoice.status ===
              'partial'
          )

          &&

          invoice.balanceAmount >
            0

          &&

          !!invoice.dueDate

          &&

          invoice.dueDate <
            today
      )

      .map(
        invoice => {


          const member =
            invoice.memberId

              ? members.find(
                  item =>
                    item.memberId ===
                    invoice.memberId
                )

              : undefined;


          return {

            invoiceId:
              invoice.invoiceId,

            memberIdNumber:
              member?.memberId
              ??
              null,

            initials:

              member

                ? this.getInitials(

                    member.firstName,

                    member.lastName

                  )

                : '--',

            name:

              member

                ? `${member.firstName} ${member.lastName}`

                : 'Unknown Member',

            memberId:
              member?.memberCode
              ??
              '-',

            amountDue:
              invoice.balanceAmount,

            daysOverdue:
              this.daysBetween(

                invoice.dueDate!,

                today

              )

          };

        }
      )

      .sort(
        (
          a,
          b
        ) =>

          b.daysOverdue -
          a.daysOverdue
      )

      .slice(
        0,
        5
      );

  }


  private calculateNetRevenue(

    payments:
      PaymentView[],

    refunds:
      RefundView[],

    fromDate:
      string,

    toDate:
      string

  ):
    number {


    const gross =
      payments

        .filter(
          payment =>

            (
              payment.paymentStatus ===
                'completed'

              ||

              payment.paymentStatus ===
                'refunded'
            )

            &&

            payment.paymentDate >=
              fromDate

            &&

            payment.paymentDate <=
              toDate
        )

        .reduce(
          (
            total,
            payment
          ) =>

            total +
            payment.amount,

          0
        );


    const refunded =
      refunds

        .filter(
          refund =>

            refund.refundStatus ===
              'processed'

            &&

            refund.refundDate >=
              fromDate

            &&

            refund.refundDate <=
              toDate
        )

        .reduce(
          (
            total,
            refund
          ) =>

            total +
            refund.refundAmount,

          0
        );


    return this.round(

      gross -
      refunded

    );

  }


  private calculateExpenses(

    expenses:
      Expense[],

    fromDate:
      string,

    toDate:
      string

  ):
    number {


    return this.round(

      expenses

        .filter(
          expense =>

            expense.status ===
              'approved'

            &&

            expense.expenseDate >=
              fromDate

            &&

            expense.expenseDate <=
              toDate
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

  }


  private calculateFinancialChanges(

    payments:
      PaymentView[],

    refunds:
      RefundView[],

    expenses:
      Expense[],

    now:
      Date

  ) {


    const currentStart =
      new Date(

        now.getFullYear(),

        now.getMonth(),

        1

      );


    const previousStart =
      new Date(

        now.getFullYear(),

        now.getMonth() -
        1,

        1

      );


    const previousEnd =
      new Date(

        now.getFullYear(),

        now.getMonth(),

        0

      );


    const currentRevenue =
      this.calculateNetRevenue(

        payments,

        refunds,

        this.toDateKey(
          currentStart
        ),

        this.toDateKey(
          now
        )

      );


    const previousRevenue =
      this.calculateNetRevenue(

        payments,

        refunds,

        this.toDateKey(
          previousStart
        ),

        this.toDateKey(
          previousEnd
        )

      );


    const currentExpenses =
      this.calculateExpenses(

        expenses,

        this.toDateKey(
          currentStart
        ),

        this.toDateKey(
          now
        )

      );


    const previousExpenses =
      this.calculateExpenses(

        expenses,

        this.toDateKey(
          previousStart
        ),

        this.toDateKey(
          previousEnd
        )

      );


    const currentProfit =
      currentRevenue -
      currentExpenses;


    const previousProfit =
      previousRevenue -
      previousExpenses;


    return {

      revenueChange:
        this.percentageChange(

          currentRevenue,

          previousRevenue

        ),

      expenseChange:
        this.percentageChange(

          currentExpenses,

          previousExpenses

        ),

      profitChange:
        this.percentageChange(

          currentProfit,

          previousProfit

        )

    };

  }


  private prepareLocationRevenue(

    members:
      Member[],

    payments:
      PaymentView[],

    refunds:
      RefundView[],

    fromDate:
      string,

    toDate:
      string

  ):
    DashboardLocationRevenue[] {


    const membersById =
      new Map<
        number,
        Member
      >();


    members.forEach(
      member => {

        membersById.set(

          member.memberId,

          member

        );

      }
    );


    const paymentsById =
      new Map<
        number,
        PaymentView
      >();


    payments.forEach(
      payment => {

        paymentsById.set(

          payment.paymentId,

          payment

        );

      }
    );


    const revenueByLocation =
      new Map<
        string,
        number
      >();


    const getPaymentLocation =
      (
        payment:
          PaymentView
      ): string => {


        const member =

          payment.memberId

            ? membersById.get(
                payment.memberId
              )

            : undefined;


        return (

          member?.locationName

          ||

          member?.location

          ||

          `Location ${payment.locationId}`

        );

      };


    payments

      .filter(
        payment =>

          (
            payment.paymentStatus ===
              'completed'

            ||

            payment.paymentStatus ===
              'refunded'
          )

          &&

          payment.paymentDate >=
            fromDate

          &&

          payment.paymentDate <=
            toDate
      )

      .forEach(
        payment => {


          const location =
            getPaymentLocation(
              payment
            );


          revenueByLocation.set(

            location,

            (
              revenueByLocation.get(
                location
              )

              ??

              0
            )

            +

            payment.amount

          );

        }
      );


    refunds

      .filter(
        refund =>

          refund.refundStatus ===
            'processed'

          &&

          refund.refundDate >=
            fromDate

          &&

          refund.refundDate <=
            toDate
      )

      .forEach(
        refund => {


          const payment =
            paymentsById.get(
              refund.paymentId
            );


          if (
            !payment
          ) {

            return;

          }


          const location =
            getPaymentLocation(
              payment
            );


          revenueByLocation.set(

            location,

            (
              revenueByLocation.get(
                location
              )

              ??

              0
            )

            -

            refund.refundAmount

          );

        }
      );


    const colors = [

      'red',
      'blue',
      'green',
      'yellow',
      'purple'

    ];


    return Array
      .from(
        revenueByLocation
          .entries()
      )

      .map(
        ([
          name,
          revenue
        ]) => ({


          name,


          revenue:
            this.round(
              revenue
            ),


          members:
            members
              .filter(
                member =>

                  (
                    member.locationName
                    ||
                    member.location
                  )

                  ===

                  name
              )
              .length,


          colorClass:
            ''

        })
      )

      .sort(
        (
          a,
          b
        ) =>

          b.revenue -
          a.revenue
      )

      .slice(
        0,
        5
      )

      .map(
        (
          item,
          index
        ) => ({

          ...item,

          colorClass:
            colors[
              index %
              colors.length
            ]

        })
      );

  }


  private percentageChange(

    current:
      number,

    previous:
      number

  ):
    number {


    if (
      previous ===
      0
    ) {

      return current ===
        0

        ? 0

        : 100;

    }


    return Math.round(

      (
        (
          current -
          previous
        )

        /

        Math.abs(
          previous
        )
      )

      *

      100

    );

  }


  private daysBetween(

    from:
      string,

    to:
      string

  ):
    number {


    const first =
      new Date(
        `${from}T00:00:00`
      );


    const second =
      new Date(
        `${to}T00:00:00`
      );


    return Math.max(

      0,

      Math.floor(

        (
          second.getTime() -
          first.getTime()
        )

        /

        86400000

      )

    );

  }


  private getInitials(

    firstName:
      string,

    lastName:
      string

  ):
    string {


    return (

      (
        firstName
          ?.charAt(0)

        ??

        ''
      )

      +

      (
        lastName
          ?.charAt(0)

        ??

        ''
      )

    )
      .toUpperCase();

  }


  private formatDisplayDate(
    value:
      string
  ):
    string {


    const date =
      new Date(
        `${value}T00:00:00`
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return date
      .toLocaleDateString(
        'en-GB',
        {
          day:
            '2-digit',

          month:
            'short',

          year:
            'numeric'
        }
      );

  }


  private toDateKey(
    date:
      Date
  ):
    string {


    return [

      date.getFullYear(),

      String(
        date.getMonth() +
        1
      )
        .padStart(
          2,
          '0'
        ),

      String(
        date.getDate()
      )
        .padStart(
          2,
          '0'
        )

    ].join('-');

  }


  private startOfDay(
    source:
      Date
  ):
    Date {


    const date =
      new Date(
        source
      );


    date.setHours(
      0,
      0,
      0,
      0
    );


    return date;

  }


  private round(
    value:
      number
  ):
    number {


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