import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Invoice
} from '../../../models/invoice.model';

import {
  CreatePaymentRequest,
  PaymentMethod
} from '../../../models/payment.model';

import {
  InvoiceService
} from '../../../services/invoice.service';

import {
  PaymentService
} from '../../../services/payment.service';


@Component({
  selector:
    'app-gym-payment-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './payment-form.html',

  styleUrl:
    './payment-form.scss'
})
export class PaymentFormComponent
  implements OnInit {


  /*
   * TEMPORARY
   *
   * Later get tenantId from
   * authentication / tenant context.
   */
  readonly tenantId = 1;


  invoiceId = 0;


  invoice?:
    Invoice;


  paymentMethods:
    PaymentMethod[] = [];


  submitted = false;

  saving = false;


  readonly paymentForm;


  constructor(

    private readonly fb:
      FormBuilder,

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly invoiceService:
      InvoiceService,

    private readonly paymentService:
      PaymentService

  ) {

    this.paymentForm =
      this.fb.group({

        paymentDate: [
          this.today(),
          Validators.required
        ],

        paymentMethodId: [
          null as number | null,
          Validators.required
        ],

        amount: [
          null as number | null,
          [
            Validators.required,
            Validators.min(0.01)
          ]
        ],

        transactionId: [
          '',
          Validators.maxLength(100)
        ],

        referenceNumber: [
          '',
          Validators.maxLength(100)
        ],

        notes: [
          '',
          Validators.maxLength(2000)
        ]

      });

  }


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

      this.goToInvoices();

      return;

    }


    this.loadInvoice();

    this.loadPaymentMethods();

  }


  // =====================================================
  // LOAD INVOICE
  // =====================================================

  private loadInvoice(): void {


    this.invoice =
      this.invoiceService
        .getInvoiceById(
          this.invoiceId,
          this.tenantId
        );


    if (
      !this.invoice
    ) {

      this.goToInvoices();

      return;

    }


    // Do not allow payment for paid invoice
    if (
      this.invoice.status ===
        'paid'
    ) {

      this.goToInvoice();

      return;

    }


    // Do not allow payment for cancelled invoice
    if (
      this.invoice.status ===
        'cancelled'
    ) {

      this.goToInvoice();

      return;

    }


    /*
     * Default amount to remaining balance.
     *
     * Manager can reduce it for
     * a partial payment.
     */
    this.paymentForm.patchValue({

      amount:
        this.invoice.balanceAmount

    });

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
  // SAVE PAYMENT
  // =====================================================

  savePayment(): void {


    this.submitted = true;


    if (
      this.paymentForm.invalid
    ) {

      this.paymentForm
        .markAllAsTouched();

      return;

    }


    if (
      !this.invoice
    ) {

      return;

    }


    const value =
      this.paymentForm
        .getRawValue();


    const amount =
      Number(
        value.amount
      );


    // ===================================================
    // VALIDATE AMOUNT
    // ===================================================

    if (
      amount <= 0
    ) {

      alert(
        'Payment amount must be greater than zero.'
      );

      return;

    }


    if (
      amount >
      this.invoice.balanceAmount
    ) {

      alert(
        `Payment cannot exceed the outstanding balance of ₹${this.invoice.balanceAmount.toFixed(2)}.`
      );

      return;

    }


    this.saving = true;


    try {


      const request:
        CreatePaymentRequest = {


        tenantId:
          this.tenantId,


        locationId:
          this.invoice.locationId,


        paymentDate:
          String(
            value.paymentDate
          ),


        memberId:
          this.invoice.memberId,


        invoiceId:
          this.invoice.invoiceId,


        /*
         * IMPORTANT:
         *
         * We store payment_method_id,
         * NOT "Cash", "UPI", etc.
         */
        paymentMethodId:
          Number(
            value.paymentMethodId
          ),


        amount,


        transactionId:

          value.transactionId
            ? String(
                value.transactionId
              ).trim()
            : null,


        paymentStatus:
          'completed',


        referenceNumber:

          value.referenceNumber
            ? String(
                value.referenceNumber
              ).trim()
            : null,


        notes:

          value.notes
            ? String(
                value.notes
              ).trim()
            : null


      };


      this.paymentService
        .createPayment(
          request
        );


      /*
       * PaymentService already calls:
       *
       * invoiceService.applyPayment(...)
       *
       * Therefore:
       *
       * paid_amount
       * balance_amount
       * invoice status
       *
       * are automatically updated.
       */


      this.router.navigate([

        '/accounts/invoices',

        this.invoice.invoiceId

      ]);


    }
    catch (
      error
    ) {


      console.error(
        error
      );


      const message =

        error instanceof Error

          ? error.message

          : 'Unable to record payment.';


      alert(
        message
      );


      this.saving = false;

    }

  }


  // =====================================================
  // FULL BALANCE
  // =====================================================

  useFullBalance(): void {


    if (
      !this.invoice
    ) {

      return;

    }


    this.paymentForm.patchValue({

      amount:
        this.invoice.balanceAmount

    });

  }


  // =====================================================
  // CANCEL
  // =====================================================

  goToInvoice(): void {


    if (
      !this.invoiceId
    ) {

      this.goToInvoices();

      return;

    }


    this.router.navigate([

      '/accounts/invoices',

      this.invoiceId

    ]);

  }


  private goToInvoices(): void {

    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  // =====================================================
  // INVALID
  // =====================================================

  isInvalid(
    controlName:
      keyof typeof this.paymentForm.controls
  ): boolean {


    const control =
      this.paymentForm
        .controls[
          controlName
        ];


    return (

      (
        this.submitted

        ||

        control.touched
      )

      &&

      control.invalid

    );

  }


  // =====================================================
  // REMAINING AFTER THIS PAYMENT
  // =====================================================

  get remainingBalance():
    number {


    if (
      !this.invoice
    ) {

      return 0;

    }


    const amount =
      Number(
        this.paymentForm
          .controls
          .amount
          .value
      ) || 0;


    return Math.max(

      0,

      this.invoice.balanceAmount -
      amount

    );

  }


  // =====================================================
  // PAYMENT RESULT
  // =====================================================

  get resultingStatus():
    string {


    if (
      !this.invoice
    ) {

      return '-';

    }


    if (
      this.remainingBalance === 0
    ) {

      return 'Paid';

    }


    return 'Partial';

  }


  // =====================================================
  // TODAY
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

}