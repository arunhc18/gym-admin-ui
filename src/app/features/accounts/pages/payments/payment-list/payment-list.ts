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
  Router
} from '@angular/router';

import {
  PaymentMethod,
  PaymentStatus,
  PaymentView
} from '../../../models/payment.model';

import {
  PaymentService
} from '../../../services/payment.service';


@Component({
  selector: 'app-gym-payment-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './payment-list.html',

  styleUrl:
    './payment-list.scss'
})
export class PaymentListComponent
  implements OnInit {


  // =====================================================
  // TEMPORARY TENANT
  //
  // Later this should come from login / tenant context.
  // =====================================================

  readonly tenantId = 1;


  // =====================================================
  // DATA
  // =====================================================

  payments:
    PaymentView[] = [];


  filteredPayments:
    PaymentView[] = [];


  paymentMethods:
    PaymentMethod[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchText = '';

  selectedStatus = '';

  selectedMethod = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private readonly paymentService:
      PaymentService,

    private readonly router:
      Router

  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadPaymentMethods();

    this.loadPayments();

  }


  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  private loadPayments(): void {


    this.paymentService
      .getPaymentViews(
        this.tenantId
      )
      .subscribe(
        payments => {


          this.payments =
            payments;


          this.applyFilters();

        }
      );

  }


  // =====================================================
  // LOAD PAYMENT METHODS
  // =====================================================

  private loadPaymentMethods(): void {


    this.paymentService
      .getPaymentMethods(
        this.tenantId
      )
      .subscribe(
        methods => {


          this.paymentMethods =
            methods;

        }
      );

  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(): void {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredPayments =
      this.payments.filter(
        payment => {


          const paymentNumber =
            payment.paymentNumber
              .toLowerCase();


          const invoiceNumber =
            (
              payment.invoiceNumber
              ?? ''
            )
              .toLowerCase();


          const methodName =
            (
              payment.paymentMethodName
              ?? ''
            )
              .toLowerCase();


          const transactionId =
            (
              payment.transactionId
              ?? ''
            )
              .toLowerCase();


          const referenceNumber =
            (
              payment.referenceNumber
              ?? ''
            )
              .toLowerCase();


          const memberId =
            String(
              payment.memberId
              ?? ''
            );


          // =================================================
          // SEARCH
          // =================================================

          const matchesSearch =

            !search

            ||

            paymentNumber.includes(
              search
            )

            ||

            invoiceNumber.includes(
              search
            )

            ||

            methodName.includes(
              search
            )

            ||

            transactionId.includes(
              search
            )

            ||

            referenceNumber.includes(
              search
            )

            ||

            memberId.includes(
              search
            );


          // =================================================
          // STATUS
          // =================================================

          const matchesStatus =

            !this.selectedStatus

            ||

            payment.paymentStatus ===
              this.selectedStatus;


          // =================================================
          // PAYMENT METHOD
          // =================================================

          const matchesMethod =

            !this.selectedMethod

            ||

            payment.paymentMethodId ===
              Number(
                this.selectedMethod
              );


          return (

            matchesSearch

            &&

            matchesStatus

            &&

            matchesMethod

          );

        }
      );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {


    this.searchText = '';

    this.selectedStatus = '';

    this.selectedMethod = '';


    this.applyFilters();

  }


  // =====================================================
  // OPEN INVOICE
  // =====================================================

  openInvoice(
    event: Event,
    payment: PaymentView
  ): void {


    event.stopPropagation();


    if (
      !payment.invoiceId
    ) {

      return;

    }


    this.router.navigate([

      '/accounts/invoices',

      payment.invoiceId

    ]);

  }


  // =====================================================
  // CAN REFUND
  // =====================================================

  canRefund(
    payment: PaymentView
  ): boolean {


    /*
     * Completed payments can be refunded.
     *
     * Once a payment is fully refunded,
     * RefundService changes its status
     * to "refunded".
     *
     * Therefore the Refund button disappears.
     */

    return (

      payment.paymentStatus ===
      'completed'

    );

  }


  // =====================================================
  // REFUND PAYMENT
  // =====================================================

  refundPayment(
    event: Event,
    payment: PaymentView
  ): void {


    event.stopPropagation();


    if (
      !this.canRefund(
        payment
      )
    ) {

      return;

    }


    this.router.navigate([

      '/accounts/refunds/new',

      payment.paymentId

    ]);

  }


  // =====================================================
  // GO TO INVOICES
  // =====================================================

  goToInvoices(): void {


    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  // =====================================================
  // GET PAYMENT METHOD NAME
  // =====================================================

  getPaymentMethodName(
    payment: PaymentView
  ): string {


    return (

      payment.paymentMethodName

      ??

      `Method #${payment.paymentMethodId}`

    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: PaymentStatus
  ): string {


    return status;

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
  // TOTAL COMPLETED AMOUNT
  // =====================================================

  get totalCompletedAmount():
    number {


    return this.filteredPayments

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
      );

  }


  // =====================================================
  // TOTAL TRANSACTIONS
  // =====================================================

  get totalTransactions():
    number {


    return this.filteredPayments.length;

  }


  // =====================================================
  // COMPLETED COUNT
  // =====================================================

  get completedCount():
    number {


    return this.filteredPayments

      .filter(
        payment =>
          payment.paymentStatus ===
          'completed'
      )

      .length;

  }


  // =====================================================
  // REFUNDED COUNT
  // =====================================================

  get refundedCount():
    number {


    return this.filteredPayments

      .filter(
        payment =>
          payment.paymentStatus ===
          'refunded'
      )

      .length;

  }


  // =====================================================
  // PENDING COUNT
  // =====================================================

  get pendingCount():
    number {


    return this.filteredPayments

      .filter(
        payment =>
          payment.paymentStatus ===
          'pending'
      )

      .length;

  }

}