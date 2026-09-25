import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  CreateRefundRequest,
  Refund,
  RefundView
} from '../models/refund.model';

import {
  PaymentService
} from './payment.service';

import {
  InvoiceService
} from './invoice.service';


@Injectable({
  providedIn: 'root'
})
export class RefundService {


  // =====================================================
  // MOCK REFUNDS
  //
  // Later replace with ASP.NET Core API.
  // =====================================================

  private readonly refundsSubject =
    new BehaviorSubject<Refund[]>([]);


  constructor(

    private readonly paymentService:
      PaymentService,

    private readonly invoiceService:
      InvoiceService

  ) {}


  // =====================================================
  // GET REFUNDS
  // =====================================================

  getRefunds(
    tenantId: number
  ): Observable<RefundView[]> {

    return this.refundsSubject.pipe(

      map(
        refunds =>

          refunds

            .map(
              refund => {


                const payment =
                  this.paymentService
                    .getPaymentById(
                      refund.paymentId,
                      tenantId
                    );


                if (
                  !payment
                ) {

                  return null;

                }


                const invoice =
                  payment.invoiceId

                    ? this.invoiceService
                        .getInvoiceById(
                          payment.invoiceId,
                          tenantId
                        )

                    : undefined;


                const method =
                  this.paymentService
                    .getPaymentMethodById(
                      payment.paymentMethodId,
                      tenantId
                    );


                const view:
                  RefundView = {

                  ...refund,

                  paymentNumber:
                    payment.paymentNumber,

                  invoiceId:
                    payment.invoiceId,

                  invoiceNumber:
                    invoice?.invoiceNumber
                    ?? '-',

                  memberId:
                    payment.memberId,

                  paymentAmount:
                    payment.amount,

                  paymentMethodName:
                    method?.methodName
                    ?? '-'

                };


                return view;

              }
            )

            .filter(
              (
                refund
              ): refund is RefundView =>
                refund !== null
            )

            .sort(
              (
                a,
                b
              ) => {

                const dateCompare =
                  b.refundDate
                    .localeCompare(
                      a.refundDate
                    );


                return dateCompare !== 0

                  ? dateCompare

                  : b.refundId -
                    a.refundId;

              }
            )

      )

    );

  }


  // =====================================================
  // GET REFUNDS FOR PAYMENT
  // =====================================================

  getRefundsForPayment(
    paymentId: number
  ): Refund[] {

    return this.refundsSubject
      .value
      .filter(
        refund =>
          refund.paymentId ===
          paymentId
      );

  }


  // =====================================================
  // PROCESSED REFUND TOTAL
  // =====================================================

  getProcessedRefundAmount(
    paymentId: number
  ): number {

    return this.round(

      this.getRefundsForPayment(
        paymentId
      )

        .filter(
          refund =>
            refund.refundStatus ===
            'processed'
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

  }


  // =====================================================
  // REFUNDABLE BALANCE
  // =====================================================

  getRefundableAmount(
    paymentId: number,
    tenantId: number
  ): number {


    const payment =
      this.paymentService
        .getPaymentById(
          paymentId,
          tenantId
        );


    if (
      !payment
    ) {

      return 0;

    }


    const refunded =
      this.getProcessedRefundAmount(
        paymentId
      );


    return this.round(

      Math.max(
        0,
        payment.amount -
        refunded
      )

    );

  }


  // =====================================================
  // CREATE REFUND
  // =====================================================

  createRefund(
    request:
      CreateRefundRequest,
    tenantId: number
  ): Refund {


    const payment =
      this.paymentService
        .getPaymentById(
          request.paymentId,
          tenantId
        );


    if (
      !payment
    ) {

      throw new Error(
        'Payment not found.'
      );

    }


    if (
      payment.paymentStatus !==
        'completed'

      &&

      payment.paymentStatus !==
        'refunded'
    ) {

      throw new Error(
        'Only completed payments can be refunded.'
      );

    }


    if (
      request.refundAmount <= 0
    ) {

      throw new Error(
        'Refund amount must be greater than zero.'
      );

    }


    const refundableAmount =
      this.getRefundableAmount(
        request.paymentId,
        tenantId
      );


    if (
      request.refundAmount >
      refundableAmount
    ) {

      throw new Error(
        `Refund cannot exceed ₹${refundableAmount.toFixed(2)}.`
      );

    }


    if (
      !request.refundReason
        .trim()
    ) {

      throw new Error(
        'Refund reason is required.'
      );

    }


    const refunds =
      this.refundsSubject.value;


    const nextRefundId =

      refunds.length === 0

        ? 1

        : Math.max(
            ...refunds.map(
              refund =>
                refund.refundId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    /*
     * For the frontend prototype,
     * we immediately process the refund.
     *
     * Later backend workflow can create
     * it as pending and require approval.
     */

    const refund:
      Refund = {

      refundId:
        nextRefundId,

      paymentId:
        request.paymentId,

      refundDate:
        request.refundDate,

      refundAmount:
        request.refundAmount,

      refundReason:
        request.refundReason
          .trim(),

      refundStatus:
        'processed',

      processedDate:
        request.refundDate,

      createdAt:
        now,

      updatedAt:
        now

    };


    this.refundsSubject.next([

      refund,

      ...refunds

    ]);


    /*
     * If the entire payment amount
     * has now been refunded,
     * mark the payment as refunded.
     */

    const remaining =
      this.getRefundableAmount(
        request.paymentId,
        tenantId
      );


    if (
      remaining <= 0
    ) {

      this.paymentService
        .markPaymentAsRefunded(
          request.paymentId,
          tenantId
        );

    }


    return refund;

  }


  // =====================================================
  // TOTAL PROCESSED REFUNDS
  // =====================================================

  getTotalRefunded(
    tenantId: number
  ): number {


    let total = 0;


    for (
      const refund
      of this.refundsSubject.value
    ) {


      if (
        refund.refundStatus !==
          'processed'
      ) {

        continue;

      }


      const payment =
        this.paymentService
          .getPaymentById(
            refund.paymentId,
            tenantId
          );


      if (
        payment
      ) {

        total +=
          refund.refundAmount;

      }

    }


    return this.round(
      total
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