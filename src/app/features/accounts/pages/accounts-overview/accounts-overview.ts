import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  combineLatest
} from 'rxjs';

import {
  Invoice
} from '../../models/invoice.model';

import {
  PaymentView
} from '../../models/payment.model';

import {
  Expense
} from '../../models/expense.model';

import {
  InvoiceService
} from '../../services/invoice.service';

import {
  PaymentService
} from '../../services/payment.service';

import {
  ExpenseService
} from '../../services/expense.service';


interface PaymentMethodSummary {

  paymentMethodId: number;

  paymentMethodName: string;

  transactionCount: number;

  amount: number;

  percentage: number;

}


@Component({
  selector:
    'app-accounts-overview',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './accounts-overview.html',

  styleUrl:
    './accounts-overview.scss'
})
export class AccountsOverviewComponent
  implements OnInit {


  // =====================================================
  // TENANT
  //
  // TEMPORARY:
  // Later this should come from logged-in user /
  // authenticated tenant context.
  // =====================================================

  readonly tenantId = 1;


  // =====================================================
  // DATA
  // =====================================================

  invoices:
    Invoice[] = [];


  payments:
    PaymentView[] = [];


  expenses:
    Expense[] = [];


  recentPayments:
    PaymentView[] = [];


  outstandingInvoices:
    Invoice[] = [];


  paymentMethodSummary:
    PaymentMethodSummary[] = [];


  // =====================================================
  // SUMMARY VALUES
  // =====================================================

  todayRevenue = 0;


  todayExpenses = 0;


  netCollection = 0;


  totalCollected = 0;


  outstandingAmount = 0;


  // =====================================================
  // INVOICE COUNTS
  // =====================================================

  pendingInvoiceCount = 0;


  partialInvoiceCount = 0;


  paidInvoiceCount = 0;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly invoiceService:
      InvoiceService,

    private readonly paymentService:
      PaymentService,

    private readonly expenseService:
      ExpenseService,

    private readonly router:
      Router

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadDashboard();

  }


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  private loadDashboard(): void {


    /*
     * Load:
     *
     * 1. Invoices
     * 2. Payments
     * 3. Expenses
     *
     * together.
     *
     * Whenever any service emits updated data,
     * the dashboard automatically recalculates.
     */

    combineLatest([

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
        )

    ])
      .subscribe(
        ([
          invoices,
          payments,
          expenses
        ]) => {


          this.invoices =
            invoices;


          this.payments =
            payments;


          this.expenses =
            expenses;


          this.calculateDashboard();

        }
      );

  }


  // =====================================================
  // CALCULATE DASHBOARD
  // =====================================================

  private calculateDashboard():
    void {


    const today =
      this.today();


    // ===================================================
    // TODAY'S REVENUE
    //
    // Only completed payments made today.
    // ===================================================

    this.todayRevenue =
      this.round(

        this.payments

          .filter(
            payment =>

              payment.paymentStatus ===
                'completed'

              &&

              payment.paymentDate ===
                today
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


    // ===================================================
    // TODAY'S EXPENSES
    //
    // Only approved expenses for today.
    // ===================================================

    this.todayExpenses =
      this.round(

        this.expenses

          .filter(
            expense =>

              expense.status ===
                'approved'

              &&

              expense.expenseDate ===
                today
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


    // ===================================================
    // NET COLLECTION
    //
    // Revenue - Expenses
    // ===================================================

    this.netCollection =
      this.round(

        this.todayRevenue -
        this.todayExpenses

      );


    // ===================================================
    // TOTAL COLLECTED
    //
    // All completed payments.
    // ===================================================

    this.totalCollected =
      this.round(

        this.payments

          .filter(
            payment =>
              payment.paymentStatus ===
              'completed'
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


    // ===================================================
    // OUTSTANDING AMOUNT
    //
    // Pending + Partial invoice balances.
    // ===================================================

    this.outstandingAmount =
      this.round(

        this.invoices

          .filter(
            invoice =>

              invoice.status ===
                'pending'

              ||

              invoice.status ===
                'partial'
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


    // ===================================================
    // INVOICE COUNTS
    // ===================================================

    this.pendingInvoiceCount =
      this.invoices
        .filter(
          invoice =>
            invoice.status ===
            'pending'
        )
        .length;


    this.partialInvoiceCount =
      this.invoices
        .filter(
          invoice =>
            invoice.status ===
            'partial'
        )
        .length;


    this.paidInvoiceCount =
      this.invoices
        .filter(
          invoice =>
            invoice.status ===
            'paid'
        )
        .length;


    // ===================================================
    // RECENT PAYMENTS
    //
    // Latest 5 payments.
    // ===================================================

    this.recentPayments =
      [...this.payments]

        .sort(
          (
            a,
            b
          ) => {


            const dateCompare =
              b.paymentDate
                .localeCompare(
                  a.paymentDate
                );


            if (
              dateCompare !== 0
            ) {

              return dateCompare;

            }


            return (

              b.paymentId -
              a.paymentId

            );

          }
        )

        .slice(
          0,
          5
        );


    // ===================================================
    // OUTSTANDING INVOICES
    //
    // Show highest outstanding balances first.
    // ===================================================

    this.outstandingInvoices =
      this.invoices

        .filter(
          invoice =>

            invoice.status ===
              'pending'

            ||

            invoice.status ===
              'partial'
        )

        .sort(
          (
            a,
            b
          ) =>

            b.balanceAmount -
            a.balanceAmount
        )

        .slice(
          0,
          5
        );


    // ===================================================
    // PAYMENT METHOD BREAKDOWN
    // ===================================================

    this.calculatePaymentMethods();

  }


  // =====================================================
  // PAYMENT METHOD BREAKDOWN
  // =====================================================

  private calculatePaymentMethods():
    void {


    /*
     * Only completed payments should count
     * toward actual collected revenue.
     */

    const completedPayments =
      this.payments
        .filter(
          payment =>
            payment.paymentStatus ===
            'completed'
        );


    const totalCompletedAmount =
      completedPayments
        .reduce(
          (
            total,
            payment
          ) =>

            total +
            payment.amount,

          0
        );


    const summary =
      new Map<
        number,
        PaymentMethodSummary
      >();


    for (
      const payment
      of completedPayments
    ) {


      const existing =
        summary.get(
          payment.paymentMethodId
        );


      if (
        existing
      ) {


        existing.transactionCount +=
          1;


        existing.amount +=
          payment.amount;


      }
      else {


        summary.set(
          payment.paymentMethodId,
          {

            paymentMethodId:
              payment.paymentMethodId,

            paymentMethodName:

              payment.paymentMethodName

              ??

              `Method #${payment.paymentMethodId}`,

            transactionCount:
              1,

            amount:
              payment.amount,

            percentage:
              0

          }
        );

      }

    }


    this.paymentMethodSummary =
      Array.from(
        summary.values()
      )

        .map(
          item => ({


            ...item,


            amount:
              this.round(
                item.amount
              ),


            percentage:

              totalCompletedAmount > 0

                ? Math.round(

                    (
                      item.amount /
                      totalCompletedAmount
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

  }


  // =====================================================
  // CREATE INVOICE
  // =====================================================

  createInvoice(): void {

    this.router.navigate([
      '/accounts/invoices/new'
    ]);

  }


  // =====================================================
  // VIEW INVOICES
  // =====================================================

  viewInvoices(): void {

    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  // =====================================================
  // VIEW PAYMENTS
  // =====================================================

  viewPayments(): void {

    this.router.navigate([
      '/accounts/payments'
    ]);

  }


  // =====================================================
  // VIEW EXPENSES
  // =====================================================

  viewExpenses(): void {

    this.router.navigate([
      '/accounts/expenses'
    ]);

  }


  // =====================================================
  // ADD EXPENSE
  // =====================================================

  createExpense(): void {

    this.router.navigate([
      '/accounts/expenses/new'
    ]);

  }


  // =====================================================
  // OPEN INVOICE
  // =====================================================

  openInvoice(
    invoiceId: number
  ): void {

    this.router.navigate([

      '/accounts/invoices',

      invoiceId

    ]);

  }


  // =====================================================
  // OPEN PAYMENT INVOICE
  // =====================================================

  openPaymentInvoice(
    payment:
      PaymentView
  ): void {


    if (
      !payment.invoiceId
    ) {

      return;

    }


    this.openInvoice(
      payment.invoiceId
    );

  }


  // =====================================================
  // MEMBER DISPLAY
  // =====================================================

  getMemberDisplay(
    memberId:
      number | null
  ): string {


    if (
      !memberId
    ) {

      return '-';

    }


    return (
      `Member #${memberId}`
    );

  }


  // =====================================================
  // TOTAL EXPENSES
  //
  // Useful later for Owner/Manager dashboard.
  // =====================================================

  get totalExpenses():
    number {

    return this.round(

      this.expenses

        .filter(
          expense =>
            expense.status ===
            'approved'
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


  // =====================================================
  // CURRENT MONTH REVENUE
  //
  // Prepared for later financial cards/reports.
  // =====================================================

  get currentMonthRevenue():
    number {


    const currentMonth =
      this.currentMonth();


    return this.round(

      this.payments

        .filter(
          payment =>

            payment.paymentStatus ===
              'completed'

            &&

            payment.paymentDate
              .startsWith(
                currentMonth
              )
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

  }


  // =====================================================
  // CURRENT MONTH EXPENSES
  // =====================================================

  get currentMonthExpenses():
    number {


    const currentMonth =
      this.currentMonth();


    return this.round(

      this.expenses

        .filter(
          expense =>

            expense.status ===
              'approved'

            &&

            expense.expenseDate
              .startsWith(
                currentMonth
              )
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


  // =====================================================
  // CURRENT MONTH NET
  // =====================================================

  get currentMonthNet():
    number {

    return this.round(

      this.currentMonthRevenue -
      this.currentMonthExpenses

    );

  }


  // =====================================================
  // DATE HELPERS
  // =====================================================

  private today():
    string {


    const date =
      new Date();


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      )
        .padStart(
          2,
          '0'
        );


    const day =
      String(
        date.getDate()
      )
        .padStart(
          2,
          '0'
        );


    return (
      `${year}-${month}-${day}`
    );

  }


  private currentMonth():
    string {


    const date =
      new Date();


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      )
        .padStart(
          2,
          '0'
        );


    return (
      `${year}-${month}`
    );

  }


  // =====================================================
  // MONEY ROUNDING
  // =====================================================

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