import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Invoice,
  InvoiceItem,
  InvoiceItemType
} from '../../../models/invoice.model';

import {
  Payment
} from '../../../models/payment.model';

import {
  InvoiceService
} from '../../../services/invoice.service';

import {
  PaymentService
} from '../../../services/payment.service';


@Component({
  selector:
    'app-gym-invoice-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './invoice-details.html',

  styleUrl:
    './invoice-details.scss'
})
export class InvoiceDetailsComponent
  implements OnInit {


  /*
   * TEMPORARY
   *
   * Later tenantId should come from
   * authenticated user context.
   */
  readonly tenantId = 1;


  invoice?:
    Invoice;


  invoiceItems:
    InvoiceItem[] = [];


  payments:
    Payment[] = [];


  invoiceId = 0;


  loading = true;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly invoiceService:
      InvoiceService,

    private readonly paymentService:
      PaymentService

  ) {}


  ngOnInit(): void {


    this.invoiceId =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !this.invoiceId ||
      Number.isNaN(
        this.invoiceId
      )
    ) {

      this.goBack();

      return;

    }


    this.loadInvoice();


    const shouldPrint =
      this.route.snapshot
        .queryParamMap
        .get('print') ===
      'true';


    if (
      shouldPrint
    ) {

      window.setTimeout(
        () => {

          this.printInvoice();

        },
        300
      );

    }

  }


  // =====================================================
  // LOAD INVOICE
  // =====================================================

  private loadInvoice(): void {


    const details =
      this.invoiceService
        .getInvoiceDetails(
          this.invoiceId,
          this.tenantId
        );


    if (
      !details
    ) {

      this.loading = false;

      this.goBack();

      return;

    }


    this.invoice =
      details.invoice;


    this.invoiceItems =
      details.items;


    this.payments =
      this.paymentService
        .getPaymentsForInvoice(
          this.invoiceId
        );


    this.loading = false;

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  recordPayment(): void {


    if (
      !this.invoice
    ) {

      return;

    }


    if (
      this.invoice.status ===
        'paid'

      ||

      this.invoice.status ===
        'cancelled'
    ) {

      return;

    }


    this.router.navigate([

      '/accounts/invoices',

      this.invoice.invoiceId,

      'payment'

    ]);

  }


  // =====================================================
  // PRINT
  // =====================================================

  printInvoice(): void {

    window.print();

  }


  // =====================================================
  // PAYMENT METHOD
  // =====================================================

  getPaymentMethodName(
    paymentMethodId: number
  ): string {

    return (

      this.paymentService
        .getPaymentMethodById(
          paymentMethodId,
          this.tenantId
        )
        ?.methodName

      ??

      `Method #${paymentMethodId}`

    );

  }


  // =====================================================
  // ITEM TYPE
  // =====================================================

  getItemTypeLabel(
    type:
      InvoiceItemType | null
  ): string {


    switch (
      type
    ) {

      case 'membership':
        return 'Membership';

      case 'pt_session':
        return 'PT Session';

      case 'product':
        return 'Product';

      case 'service':
        return 'Service';

      default:
        return '-';

    }

  }


  // =====================================================
  // INVOICE TYPE
  // =====================================================

  getInvoiceTypeLabel(): string {


    if (
      !this.invoice
    ) {

      return '-';

    }


    switch (
      this.invoice.invoiceType
    ) {

      case 'membership':
        return 'Membership';

      case 'pt_package':
        return 'PT Package';

      case 'retail':
        return 'Retail';

      case 'other':
        return 'Other';

      default:
        return '-';

    }

  }


  // =====================================================
  // PAYMENT AVAILABLE
  // =====================================================

  canRecordPayment(): boolean {


    return (

      this.invoice?.status ===
        'pending'

      ||

      this.invoice?.status ===
        'partial'

    );

  }

}