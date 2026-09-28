import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  CreatePaymentRequest,
  Payment,
  PaymentMethod,
  PaymentMethodType,
  PaymentView
} from '../models/payment.model';

import {
  InvoiceService
} from './invoice.service';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {


  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  private readonly paymentMethodsSubject =
    new BehaviorSubject<PaymentMethod[]>([

      {
        paymentMethodId: 1,
        tenantId: 1,
        methodName: 'Cash',
        methodType: 'cash',
        isActive: true
      },

      {
        paymentMethodId: 2,
        tenantId: 1,
        methodName: 'UPI',
        methodType: 'upi',
        isActive: true
      },

      {
        paymentMethodId: 3,
        tenantId: 1,
        methodName: 'Credit / Debit Card',
        methodType: 'card',
        isActive: true
      },

      {
        paymentMethodId: 4,
        tenantId: 1,
        methodName: 'Net Banking',
        methodType: 'netbanking',
        isActive: true
      },

      {
        paymentMethodId: 5,
        tenantId: 1,
        methodName: 'Wallet',
        methodType: 'wallet',
        isActive: true
      }

    ]);


  // =====================================================
  // PAYMENTS
  // =====================================================

  private readonly paymentsSubject =
    new BehaviorSubject<Payment[]>([

      {
        paymentId: 1,

        tenantId: 1,

        locationId: 1,

        paymentNumber:
          'PAY-20260924-0001',

        paymentDate:
          '2026-09-24',

        memberId: 1,

        invoiceId: 1,

        paymentMethodId: 2,

        amount: 12980,

        transactionId:
          'UPI-20260924-001',

        paymentStatus:
          'completed',

        referenceNumber:
          null,

        notes:
          'Membership payment'
      },

      {
        paymentId: 2,

        tenantId: 1,

        locationId: 1,

        paymentNumber:
          'PAY-20260924-0002',

        paymentDate:
          '2026-09-24',

        memberId: 2,

        invoiceId: 2,

        paymentMethodId: 1,

        amount: 3000,

        transactionId:
          null,

        paymentStatus:
          'completed',

        referenceNumber:
          null,

        notes:
          'Partial PT payment'
      }

    ]);


  constructor(

    private readonly invoiceService:
      InvoiceService

  ) {}


  // =====================================================
  // GET PAYMENTS
  // =====================================================

  getPayments(
    tenantId: number
  ): Observable<Payment[]> {


    return this.paymentsSubject
      .pipe(

        map(
          payments =>

            payments
              .filter(
                payment =>
                  payment.tenantId ===
                  tenantId
              )
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


                  return dateCompare !== 0

                    ? dateCompare

                    : b.paymentId -
                      a.paymentId;

                }
              )

        )

      );

  }


  // =====================================================
  // PAYMENT VIEWS
  // =====================================================

  getPaymentViews(
    tenantId: number
  ): Observable<PaymentView[]> {


    return this.paymentsSubject
      .pipe(

        map(
          payments =>

            payments

              .filter(
                payment =>
                  payment.tenantId ===
                  tenantId
              )

              .map(
                payment => {


                  const method =
                    this.getPaymentMethodById(
                      payment.paymentMethodId,
                      tenantId
                    );


                  const invoice =
                    payment.invoiceId

                      ? this.invoiceService
                          .getInvoiceById(
                            payment.invoiceId,
                            tenantId
                          )

                      : undefined;


                  return {

                    ...payment,

                    paymentMethodName:
                      method?.methodName
                      ?? `Method #${payment.paymentMethodId}`,

                    invoiceNumber:
                      invoice?.invoiceNumber
                      ?? '-',

                    paymentAmount:
                      payment.amount

                  };

                }
              )

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


                  return dateCompare !== 0

                    ? dateCompare

                    : b.paymentId -
                      a.paymentId;

                }
              )

        )

      );

  }


  // =====================================================
  // GET PAYMENT
  // =====================================================

  getPaymentById(
    paymentId: number,
    tenantId: number
  ): Payment | undefined {


    return this.paymentsSubject
      .value
      .find(
        payment =>

          payment.paymentId ===
            paymentId

          &&

          payment.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // ACTIVE PAYMENT METHODS
  //
  // Used by:
  // Invoice Form
  // Record Payment
  // Expense Form
  // =====================================================

  getPaymentMethods(
    tenantId: number
  ): Observable<PaymentMethod[]> {


    return this.paymentMethodsSubject
      .pipe(

        map(
          methods =>

            methods.filter(
              method =>

                method.tenantId ===
                  tenantId

                &&

                method.isActive
            )

        )

      );

  }


  // =====================================================
  // ALL PAYMENT METHODS
  //
  // Used by Payment Methods management page.
  // =====================================================

  getAllPaymentMethods(
    tenantId: number
  ): Observable<PaymentMethod[]> {


    return this.paymentMethodsSubject
      .pipe(

        map(
          methods =>

            methods
              .filter(
                method =>
                  method.tenantId ===
                  tenantId
              )
              .sort(
                (
                  a,
                  b
                ) =>

                  a.paymentMethodId -
                  b.paymentMethodId
              )

        )

      );

  }


  // =====================================================
  // GET PAYMENT METHOD BY ID
  //
  // Includes inactive methods because old financial
  // transactions must still display their method.
  // =====================================================

  getPaymentMethodById(
    paymentMethodId: number,
    tenantId: number
  ): PaymentMethod | undefined {


    return this.paymentMethodsSubject
      .value
      .find(
        method =>

          method.paymentMethodId ===
            paymentMethodId

          &&

          method.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // CREATE PAYMENT METHOD
  // =====================================================

  createPaymentMethod(
    tenantId: number,
    methodName: string,
    methodType: PaymentMethodType
  ): PaymentMethod {


    const cleanName =
      methodName.trim();


    if (
      !cleanName
    ) {

      throw new Error(
        'Payment method name is required.'
      );

    }


    const methods =
      this.paymentMethodsSubject.value;


    const duplicate =
      methods.some(
        method =>

          method.tenantId ===
            tenantId

          &&

          method.methodName
            .trim()
            .toLowerCase() ===
          cleanName
            .toLowerCase()
      );


    if (
      duplicate
    ) {

      throw new Error(
        'A payment method with this name already exists.'
      );

    }


    const nextId =

      methods.length === 0

        ? 1

        : Math.max(
            ...methods.map(
              method =>
                method.paymentMethodId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const paymentMethod:
      PaymentMethod = {

      paymentMethodId:
        nextId,

      tenantId,

      methodName:
        cleanName,

      methodType,

      isActive:
        true,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.paymentMethodsSubject.next([

      ...methods,

      paymentMethod

    ]);


    return paymentMethod;

  }


  // =====================================================
  // UPDATE PAYMENT METHOD
  // =====================================================

  updatePaymentMethod(
    paymentMethodId: number,
    tenantId: number,
    methodName: string,
    methodType: PaymentMethodType
  ): PaymentMethod {


    const cleanName =
      methodName.trim();


    if (
      !cleanName
    ) {

      throw new Error(
        'Payment method name is required.'
      );

    }


    const methods =
      this.paymentMethodsSubject.value;


    const index =
      methods.findIndex(
        method =>

          method.paymentMethodId ===
            paymentMethodId

          &&

          method.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Payment method not found.'
      );

    }


    const duplicate =
      methods.some(
        method =>

          method.tenantId ===
            tenantId

          &&

          method.paymentMethodId !==
            paymentMethodId

          &&

          method.methodName
            .trim()
            .toLowerCase() ===
          cleanName
            .toLowerCase()
      );


    if (
      duplicate
    ) {

      throw new Error(
        'A payment method with this name already exists.'
      );

    }


    const updated:
      PaymentMethod = {

      ...methods[index],

      methodName:
        cleanName,

      methodType,

      updatedAt:
        new Date()
          .toISOString()

    };


    const updatedMethods =
      [...methods];


    updatedMethods[index] =
      updated;


    this.paymentMethodsSubject.next(
      updatedMethods
    );


    return updated;

  }


  // =====================================================
  // ACTIVATE / DEACTIVATE PAYMENT METHOD
  // =====================================================

  togglePaymentMethod(
    paymentMethodId: number,
    tenantId: number
  ): void {


    const methods =
      this.paymentMethodsSubject.value;


    const index =
      methods.findIndex(
        method =>

          method.paymentMethodId ===
            paymentMethodId

          &&

          method.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Payment method not found.'
      );

    }


    const updatedMethods =
      [...methods];


    updatedMethods[index] = {

      ...updatedMethods[index],

      isActive:
        !updatedMethods[index]
          .isActive,

      updatedAt:
        new Date()
          .toISOString()

    };


    this.paymentMethodsSubject.next(
      updatedMethods
    );

  }


  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  createPayment(
    request:
      CreatePaymentRequest
  ): Payment {


    if (
      request.amount <= 0
    ) {

      throw new Error(
        'Payment amount must be greater than zero.'
      );

    }


    const paymentMethod =
      this.getPaymentMethodById(
        request.paymentMethodId,
        request.tenantId
      );


    if (
      !paymentMethod
    ) {

      throw new Error(
        'Payment method not found.'
      );

    }


    if (
      !paymentMethod.isActive
    ) {

      throw new Error(
        'Selected payment method is inactive.'
      );

    }


    if (
      request.invoiceId
    ) {


      const invoice =
        this.invoiceService
          .getInvoiceById(
            request.invoiceId,
            request.tenantId
          );


      if (
        !invoice
      ) {

        throw new Error(
          'Invoice not found.'
        );

      }


      if (
        invoice.locationId !==
        request.locationId
      ) {

        throw new Error(
          'Payment location does not match invoice location.'
        );

      }


      if (
        request.amount >
        invoice.balanceAmount
      ) {

        throw new Error(
          'Payment amount exceeds invoice balance.'
        );

      }

    }


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


    const payment:
      Payment = {

      paymentId:
        nextId,

      tenantId:
        request.tenantId,

      locationId:
        request.locationId,

      paymentNumber:
        this.generatePaymentNumber(
          nextId
        ),

      paymentDate:
        request.paymentDate,

      memberId:
        request.memberId,

      invoiceId:
        request.invoiceId,

      paymentMethodId:
        request.paymentMethodId,

      amount:
        this.round(
          request.amount
        ),

      transactionId:
        request.transactionId,

      paymentStatus:
        request.paymentStatus,

      referenceNumber:
        request.referenceNumber,

      notes:
        request.notes,

      createdAt:
        now,

      updatedAt:
        now

    };


    /*
     * Update invoice only when payment
     * has actually completed.
     */

    if (
      payment.paymentStatus ===
        'completed'

      &&

      payment.invoiceId
    ) {

      this.invoiceService
        .applyPayment(

          payment.invoiceId,

          payment.tenantId,

          payment.amount

        );

    }


    this.paymentsSubject.next([

      payment,

      ...payments

    ]);


    return payment;

  }


  // =====================================================
  // PAYMENTS FOR INVOICE
  // =====================================================

  getPaymentsForInvoice(
    invoiceId: number
  ): Payment[] {


    return this.paymentsSubject
      .value
      .filter(
        payment =>
          payment.invoiceId ===
          invoiceId
      )
      .sort(
        (
          a,
          b
        ) =>

          b.paymentId -
          a.paymentId
      );

  }


  // =====================================================
  // MARK FULLY REFUNDED
  // =====================================================

  markPaymentAsRefunded(
    paymentId: number,
    tenantId: number
  ): void {


    const payments =
      this.paymentsSubject.value;


    const index =
      payments.findIndex(
        payment =>

          payment.paymentId ===
            paymentId

          &&

          payment.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Payment not found.'
      );

    }


    const updatedPayments =
      [...payments];


    updatedPayments[index] = {

      ...updatedPayments[index],

      paymentStatus:
        'refunded',

      updatedAt:
        new Date()
          .toISOString()

    };


    this.paymentsSubject.next(
      updatedPayments
    );

  }


  // =====================================================
  // GENERATE PAYMENT NUMBER
  // =====================================================

  private generatePaymentNumber(
    sequence: number
  ): string {


    const date =
      new Date();


    const datePart = [

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

    ].join('');


    const sequencePart =
      String(
        sequence
      )
        .padStart(
          4,
          '0'
        );


    return (
      `PAY-${datePart}-${sequencePart}`
    );

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