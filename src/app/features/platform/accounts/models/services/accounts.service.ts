import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map,
  of
} from 'rxjs';

import {
  Invoice,
  InvoiceItem,
  Payment,
  PaymentMethod,
  PaymentRequest,
  ReminderChannel,
  ReminderResult
} from '../accounts.models';


@Injectable({
  providedIn: 'root'
})
export class AccountsService {


  // =====================================================
  // PAYMENT METHODS
  // TEMPORARY MOCK DATA
  // =====================================================

  private readonly paymentMethodsSubject =
    new BehaviorSubject<PaymentMethod[]>([


      // TENANT 1
      {
        paymentMethodId: 1,

        tenantId: 1,

        methodName:
          'Cash',

        methodType:
          'cash',

        isActive:
          true
      },


      {
        paymentMethodId: 2,

        tenantId: 1,

        methodName:
          'UPI',

        methodType:
          'upi',

        isActive:
          true
      },


      {
        paymentMethodId: 3,

        tenantId: 1,

        methodName:
          'Card',

        methodType:
          'card',

        isActive:
          true
      },


      // TENANT 2
      {
        paymentMethodId: 4,

        tenantId: 2,

        methodName:
          'Cash',

        methodType:
          'cash',

        isActive:
          true
      },


      {
        paymentMethodId: 5,

        tenantId: 2,

        methodName:
          'UPI',

        methodType:
          'upi',

        isActive:
          true
      },


      // TENANT 3
      {
        paymentMethodId: 6,

        tenantId: 3,

        methodName:
          'UPI',

        methodType:
          'upi',

        isActive:
          true
      },


      {
        paymentMethodId: 7,

        tenantId: 1,

        methodName:
          'Wallet',

        methodType:
          'wallet',

        isActive:
          true
      },


      {
        paymentMethodId: 8,

        tenantId: 1,

        methodName:
          'Net Banking',

        methodType:
          'netbanking',

        isActive:
          true
      },


      {
        paymentMethodId: 9,

        tenantId: 2,

        methodName:
          'Wallet',

        methodType:
          'wallet',

        isActive:
          true
      },


      {
        paymentMethodId: 10,

        tenantId: 2,

        methodName:
          'Net Banking',

        methodType:
          'netbanking',

        isActive:
          true
      },


      {
        paymentMethodId: 11,

        tenantId: 3,

        methodName:
          'Card',

        methodType:
          'card',

        isActive:
          true
      },


      {
        paymentMethodId: 12,

        tenantId: 3,

        methodName:
          'Wallet',

        methodType:
          'wallet',

        isActive:
          true
      },


      {
        paymentMethodId: 13,

        tenantId: 3,

        methodName:
          'Net Banking',

        methodType:
          'netbanking',

        isActive:
          true
      }


    ]);


  // =====================================================
  // INVOICES
  // TEMPORARY MOCK DATA
  // =====================================================

  private readonly invoicesSubject =
    new BehaviorSubject<Invoice[]>([


      {
        invoiceId: 1,

        tenantId: 1,

        locationId: 1,

        invoiceNumber:
          'INV-2026-1001',

        invoiceDate:
          '2026-09-20',

        memberId: 101,

        invoiceType:
          'membership',

        subtotal:
          5000,

        discountAmount:
          500,

        taxAmount:
          810,

        totalAmount:
          5310,

        paidAmount:
          5310,

        balanceAmount:
          0,

        status:
          'paid',

        dueDate:
          '2026-09-20',

        notes:
          'Annual membership renewal',

        createdAt:
          '2026-09-20T10:00:00+05:30',

        updatedAt:
          '2026-09-20T10:30:00+05:30'
      },


      {
        invoiceId: 2,

        tenantId: 2,

        locationId: 1,

        invoiceNumber:
          'INV-2026-1002',

        invoiceDate:
          '2026-09-19',

        memberId: 204,

        invoiceType:
          'membership',

        subtotal:
          3000,

        discountAmount:
          0,

        taxAmount:
          540,

        totalAmount:
          3540,

        paidAmount:
          2000,

        balanceAmount:
          1540,

        status:
          'partial',

        dueDate:
          '2026-09-25',

        notes:
          'Quarterly membership',

        createdAt:
          '2026-09-19T09:30:00+05:30',

        updatedAt:
          '2026-09-19T16:00:00+05:30'
      },


      {
        invoiceId: 3,

        tenantId: 3,

        locationId: 2,

        invoiceNumber:
          'INV-2026-1003',

        invoiceDate:
          '2026-09-18',

        memberId: 308,

        invoiceType:
          'pt_package',

        subtotal:
          8000,

        discountAmount:
          1000,

        taxAmount:
          1260,

        totalAmount:
          8260,

        paidAmount:
          0,

        balanceAmount:
          8260,

        status:
          'pending',

        dueDate:
          '2026-09-28',

        notes:
          'Personal training package',

        createdAt:
          '2026-09-18T11:00:00+05:30',

        updatedAt:
          '2026-09-18T11:00:00+05:30'
      }


    ]);


  // =====================================================
  // INVOICE ITEMS
  // =====================================================

  private readonly invoiceItemsSubject =
    new BehaviorSubject<InvoiceItem[]>([


      // INVOICE 1
      {
        invoiceItemId: 1,

        invoiceId: 1,

        itemDescription:
          'Annual Membership Plan',

        itemType:
          'membership',

        referenceId: 1,

        quantity: 1,

        unitPrice:
          5000,

        discountAmount:
          500,

        taxPercentage:
          18,

        taxAmount:
          810,

        totalAmount:
          5310
      },


      // INVOICE 2
      {
        invoiceItemId: 2,

        invoiceId: 2,

        itemDescription:
          'Quarterly Membership Plan',

        itemType:
          'membership',

        referenceId: 2,

        quantity: 1,

        unitPrice:
          3000,

        discountAmount:
          0,

        taxPercentage:
          18,

        taxAmount:
          540,

        totalAmount:
          3540
      },


      // INVOICE 3
      {
        invoiceItemId: 3,

        invoiceId: 3,

        itemDescription:
          'Personal Training Package',

        itemType:
          'service',

        referenceId: 3,

        quantity: 1,

        unitPrice:
          8000,

        discountAmount:
          1000,

        taxPercentage:
          18,

        taxAmount:
          1260,

        totalAmount:
          8260
      }


    ]);


  // =====================================================
  // PAYMENTS
  // TEMPORARY MOCK DATA
  // =====================================================

  private readonly paymentsSubject =
    new BehaviorSubject<Payment[]>([


      {
        paymentId: 1,

        tenantId: 1,

        locationId: 1,

        paymentNumber:
          'PAY-20260920-0001',

        paymentDate:
          '2026-09-20',

        memberId: 101,

        invoiceId: 1,

        paymentMethodId: 2,

        amount:
          5310,

        transactionId:
          'UPI20260920001',

        paymentStatus:
          'completed',

        referenceNumber:
          'REF-1001',

        notes:
          'Membership renewal payment',

        createdAt:
          '2026-09-20T10:30:00+05:30',

        updatedAt:
          '2026-09-20T10:30:00+05:30'
      },


      {
        paymentId: 2,

        tenantId: 2,

        locationId: 1,

        paymentNumber:
          'PAY-20260919-0002',

        paymentDate:
          '2026-09-19',

        memberId: 204,

        invoiceId: 2,

        paymentMethodId: 5,

        amount:
          2000,

        transactionId:
          'UPI20260919002',

        paymentStatus:
          'completed',

        referenceNumber:
          'REF-1002',

        notes:
          'Partial membership payment',

        createdAt:
          '2026-09-19T16:00:00+05:30',

        updatedAt:
          '2026-09-19T16:00:00+05:30'
      },


      {
        paymentId: 3,

        tenantId: 3,

        locationId: 2,

        paymentNumber:
          'PAY-20260918-0003',

        paymentDate:
          '2026-09-18',

        memberId: 308,

        invoiceId: 3,

        paymentMethodId: 6,

        amount:
          8260,

        transactionId:
          'UPI20260918003',

        paymentStatus:
          'pending',

        referenceNumber:
          'REF-1003',

        notes:
          'Awaiting gateway confirmation',

        createdAt:
          '2026-09-18T12:15:00+05:30',

        updatedAt:
          '2026-09-18T12:15:00+05:30'
      }


    ]);


  // =====================================================
  // GET ALL PAYMENTS
  // LATEST FIRST
  // =====================================================

  getPayments():
    Observable<Payment[]> {

    return this.paymentsSubject.pipe(

      map(
        payments =>

          [...payments].sort(
            (a, b) => {

              const dateCompare =
                b.paymentDate
                  .localeCompare(
                    a.paymentDate
                  );


              return (

                dateCompare !== 0

                  ? dateCompare

                  : b.paymentId -
                    a.paymentId

              );

            }
          )

      )

    );

  }


  // =====================================================
  // GET PAYMENT BY ID
  // =====================================================

  getPaymentById(
    paymentId: number
  ): Payment | undefined {

    return this.paymentsSubject
      .value
      .find(
        payment =>

          payment.paymentId ===
            paymentId
      );

  }


  // =====================================================
  // GET ALL INVOICES
  // LATEST FIRST
  // =====================================================

  getInvoices():
    Observable<Invoice[]> {

    return this.invoicesSubject.pipe(

      map(
        invoices =>

          [...invoices].sort(
            (a, b) => {

              const dateCompare =
                b.invoiceDate
                  .localeCompare(
                    a.invoiceDate
                  );


              return (

                dateCompare !== 0

                  ? dateCompare

                  : b.invoiceId -
                    a.invoiceId

              );

            }
          )

      )

    );

  }


  // =====================================================
  // GET INVOICE BY ID
  // =====================================================

  getInvoiceById(
    invoiceId: number
  ): Invoice | undefined {

    return this.invoicesSubject
      .value
      .find(
        invoice =>

          invoice.invoiceId ===
            invoiceId
      );

  }


  // =====================================================
  // GET INVOICE ITEMS
  // =====================================================

  getInvoiceItemsByInvoiceId(
    invoiceId: number
  ): InvoiceItem[] {

    return this.invoiceItemsSubject
      .value
      .filter(
        item =>

          item.invoiceId ===
            invoiceId
      );

  }


  // =====================================================
  // GET PAYMENT METHODS
  // =====================================================

  getPaymentMethods(
    tenantId?: number
  ): Observable<PaymentMethod[]> {

    return this.paymentMethodsSubject.pipe(

      map(
        methods =>

          methods.filter(
            method =>

              method.isActive

              &&

              (
                !tenantId

                ||

                method.tenantId ===
                  tenantId
              )

          )
      )

    );

  }


  // =====================================================
  // GET PAYMENT METHODS FOR TENANT
  // =====================================================

  getPaymentMethodsForTenant(
    tenantId: number
  ): PaymentMethod[] {

    return this.paymentMethodsSubject
      .value
      .filter(
        method =>

          method.isActive

          &&

          method.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // GET INVOICES FOR TENANT
  // =====================================================

  getInvoicesForTenant(
    tenantId: number
  ): Invoice[] {

    return this.invoicesSubject
      .value
      .filter(
        invoice =>

          invoice.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // GET PAYMENT METHOD NAME
  // =====================================================

  getPaymentMethodName(
    paymentMethodId: number
  ): string {

    return (

      this.paymentMethodsSubject
        .value
        .find(
          method =>

            method.paymentMethodId ===
              paymentMethodId
        )
        ?.methodName

      ??

      '-'

    );

  }


  // =====================================================
  // GENERATE PAYMENT NUMBER
  // =====================================================

  generatePaymentNumber(
    tenantId: number
  ): string {

    const today =
      new Date();


    const datePart =
      [

        today.getFullYear(),

        String(
          today.getMonth() + 1
        )
          .padStart(
            2,
            '0'
          ),

        String(
          today.getDate()
        )
          .padStart(
            2,
            '0'
          )

      ].join('');


    const tenantPaymentCount =

      this.paymentsSubject
        .value
        .filter(
          payment =>

            payment.tenantId ===
              tenantId
        )
        .length

      + 1;


    return (

      `PAY-${datePart}-`

      +

      String(
        tenantPaymentCount
      )
        .padStart(
          4,
          '0'
        )

    );

  }


  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  createPayment(
    request: PaymentRequest
  ): Payment {


    const payments =
      this.paymentsSubject.value;


    const nextId =

      payments.length === 0

        ? 1

        : Math.max(

            ...payments.map(
              payment =>
                payment.paymentId
            )

          ) + 1;


    const now =
      new Date()
        .toISOString();


    const created:
      Payment = {


      paymentId:
        nextId,


      ...request,


      paymentNumber:

        request
          .paymentNumber
          .trim()

        ||

        this.generatePaymentNumber(
          request.tenantId
        ),


      createdAt:
        now,


      updatedAt:
        now


    };


    this.paymentsSubject.next([

      created,

      ...payments

    ]);


    // ===================================================
    // UPDATE LINKED INVOICE FOR COMPLETED PAYMENT
    // ===================================================

    if (

      created.invoiceId

      &&

      created.paymentStatus ===
        'completed'

    ) {

      this.applyPaymentToInvoice(
        created.invoiceId,
        created.amount
      );

    }


    return created;

  }


  // =====================================================
  // UPDATE INVOICE AFTER PAYMENT
  // =====================================================

  private applyPaymentToInvoice(
    invoiceId: number,
    amount: number
  ): void {


    const invoices =
      this.invoicesSubject.value;


    const index =
      invoices.findIndex(
        invoice =>

          invoice.invoiceId ===
            invoiceId
      );


    if (
      index === -1
    ) {

      return;

    }


    const invoice =
      invoices[index];


    if (
      invoice.status ===
        'cancelled'
    ) {

      return;

    }


    const newPaidAmount =
      Math.min(

        invoice.totalAmount,

        invoice.paidAmount +
          amount

      );


    const newBalanceAmount =
      Math.max(

        0,

        invoice.totalAmount -
          newPaidAmount

      );


    let newStatus:
      Invoice['status'];


    if (
      newBalanceAmount === 0
    ) {

      newStatus =
        'paid';

    }
    else if (
      newPaidAmount > 0
    ) {

      newStatus =
        'partial';

    }
    else {

      newStatus =
        'pending';

    }


    const updatedInvoice:
      Invoice = {

      ...invoice,

      paidAmount:
        newPaidAmount,

      balanceAmount:
        newBalanceAmount,

      status:
        newStatus,

      updatedAt:
        new Date()
          .toISOString()

    };


    const updatedInvoices =
      [...invoices];


    updatedInvoices[index] =
      updatedInvoice;


    this.invoicesSubject.next(
      updatedInvoices
    );

  }


  // =====================================================
  // MEMBERSHIP RENEWAL REMINDER
  // FRONTEND MOCK
  // =====================================================

  sendRenewalReminder(
    paymentId: number,
    channel: ReminderChannel
  ): Observable<ReminderResult> {


    const payment =
      this.paymentsSubject
        .value
        .find(
          item =>

            item.paymentId ===
              paymentId
        );


    if (
      !payment
    ) {

      return of({

        success:
          false,

        message:
          'Payment could not be found.'

      });

    }


    if (
      !payment.memberId
    ) {

      return of({

        success:
          false,

        message:
          'This payment is not linked to a member.'

      });

    }


    /*
      ==================================================
      FUTURE ASP.NET CORE INTEGRATION
      ==================================================

      Replace this mock with HttpClient.

      POST:
      /api/platform/notifications/membership-renewal

      BODY:

      {
        tenantId: payment.tenantId,
        memberId: payment.memberId,
        paymentId: payment.paymentId,
        channel: channel
      }

      IMPORTANT:

      SMTP credentials,
      SendGrid API keys,
      Twilio credentials,
      MSG91 credentials,

      must stay inside ASP.NET Core.

      Never store provider secrets in Angular.
    */


    const channelName =

      channel ===
        'email'

        ? 'Email'

        : 'SMS';


    return of({

      success:
        true,

      message:
        `${channelName} renewal reminder prepared for member #${payment.memberId}.`

    });

  }

}