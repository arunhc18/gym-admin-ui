import {
  CommonModule
} from '@angular/common';

import {
  Component,
  inject,
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
  PaymentView
} from '../../../models/payment.model';

import {
  PaymentService
} from '../../../services/payment.service';

import {
  RefundService
} from '../../../services/refund.service';


@Component({
  selector:
    'app-refund-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './refund-form.html',

  styleUrl:
    './refund-form.scss'
})
export class RefundFormComponent
  implements OnInit {


  private readonly fb =
    inject(FormBuilder);


  readonly tenantId = 1;


  paymentId = 0;


  payment?:
    PaymentView;


  refundableAmount = 0;


  submitted = false;

  saving = false;


  refundForm =
    this.fb.group({


      refundDate: [
        this.today(),
        Validators.required
      ],


      refundAmount: [
        null as number | null,
        [
          Validators.required,
          Validators.min(
            0.01
          )
        ]
      ],


      refundReason: [
        '',
        [
          Validators.required,
          Validators.minLength(
            3
          ),
          Validators.maxLength(
            2000
          )
        ]
      ]


    });


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly paymentService:
      PaymentService,

    private readonly refundService:
      RefundService

  ) {}


  ngOnInit(): void {


    this.paymentId =
      Number(
        this.route.snapshot
          .paramMap
          .get('paymentId')
      );


    if (
      !this.paymentId
    ) {

      this.goBack();

      return;

    }


    this.loadPayment();

  }


  private loadPayment(): void {


    this.paymentService
      .getPaymentViews(
        this.tenantId
      )
      .subscribe(
        payments => {


          this.payment =
            payments.find(
              payment =>
                payment.paymentId ===
                this.paymentId
            );


          if (
            !this.payment
          ) {

            this.goBack();

            return;

          }


          this.refundableAmount =
            this.refundService
              .getRefundableAmount(
                this.paymentId,
                this.tenantId
              );


          this.refundForm.patchValue({

            refundAmount:
              this.refundableAmount

          });

        }
      );

  }


  save(): void {


    this.submitted =
      true;


    if (
      this.refundForm.invalid
    ) {

      this.refundForm
        .markAllAsTouched();

      return;

    }


    if (
      !this.payment
    ) {

      return;

    }


    const value =
      this.refundForm
        .getRawValue();


    const amount =
      Number(
        value.refundAmount
      );


    if (
      amount >
      this.refundableAmount
    ) {

      alert(
        `Maximum refundable amount is ₹${this.refundableAmount.toFixed(2)}.`
      );

      return;

    }


    this.saving =
      true;


    try {


      this.refundService
        .createRefund(
          {

            paymentId:
              this.payment.paymentId,

            refundDate:
              String(
                value.refundDate
              ),

            refundAmount:
              amount,

            refundReason:
              String(
                value.refundReason
              )

          },

          this.tenantId
        );


      this.router.navigate([
        '/accounts/refunds'
      ]);


    }
    catch (
      error
    ) {


      alert(

        error instanceof Error

          ? error.message

          : 'Unable to process refund.'

      );


      this.saving =
        false;

    }

  }


  useFullAmount(): void {

    this.refundForm.patchValue({

      refundAmount:
        this.refundableAmount

    });

  }


  goBack(): void {

    this.router.navigate([
      '/accounts/payments'
    ]);

  }


  private today():
    string {


    const date =
      new Date();


    return [

      date.getFullYear(),

      String(
        date.getMonth() + 1
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

}