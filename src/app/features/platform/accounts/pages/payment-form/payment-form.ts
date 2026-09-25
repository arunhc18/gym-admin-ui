import { CommonModule } from '@angular/common';

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
  Router
} from '@angular/router';

import {
  Invoice,
  PaymentMethod,
  PaymentRequest,
  PaymentStatus
} from '../../models/accounts.models';

import {
  AccountsService
} from '../../models/services/accounts.service';

import {
  Tenant
} from '../../../tenants/models/tenant.model';

import {
  TenantService
} from '../../../tenants/services/tenant';


@Component({
  selector: 'app-platform-payment-form',

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


  tenants: Tenant[] = [];

  paymentMethods:
    PaymentMethod[] = [];

  invoices:
    Invoice[] = [];


  submitted = false;

  isSubmitting = false;


  readonly paymentForm;


  constructor(

    private readonly fb:
      FormBuilder,

    private readonly accountsService:
      AccountsService,

    private readonly tenantService:
      TenantService,

    private readonly router:
      Router

  ) {


    this.paymentForm =
      this.fb.group({


        tenantId: [

          null as number | null,

          [
            Validators.required,
            Validators.min(1)
          ]

        ],


        locationId: [

          null as number | null,

          [
            Validators.required,
            Validators.min(1)
          ]

        ],


        paymentNumber: [
          ''
        ],


        paymentDate: [

          this.getToday(),

          [
            Validators.required
          ]

        ],


        memberId: [

          null as number | null,

          [
            Validators.min(1)
          ]

        ],


        invoiceId: [

          null as number | null,

          [
            Validators.min(1)
          ]

        ],


        paymentMethodId: [

          null as number | null,

          [
            Validators.required,
            Validators.min(1)
          ]

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

          [
            Validators.maxLength(100)
          ]

        ],


        paymentStatus: [

          'completed' as PaymentStatus,

          [
            Validators.required
          ]

        ],


        referenceNumber: [

          '',

          [
            Validators.maxLength(100)
          ]

        ],


        notes: [

          '',

          [
            Validators.maxLength(
              2000
            )
          ]

        ]


      });

  }


  ngOnInit(): void {

    this.accountsService
      .getPaymentMethods()
      .subscribe(
        methods => {

          this.paymentMethods =
            methods;

        }
      );


    this.tenantService
      .getTenants()
      .subscribe(
        tenants => {

          this.tenants =
            tenants.filter(
              tenant =>
                tenant.isActive
            );

        }
      );

  }


  // =====================================================
  // TENANT CHANGE
  // =====================================================

  onTenantChange(): void {

    const tenantId =
      Number(
        this.paymentForm
          .controls
          .tenantId
          .value
      );


    if (!tenantId) {

      this.accountsService
        .getPaymentMethods()
        .subscribe(
          methods => {

            this.paymentMethods =
              methods;

          }
        );

      this.invoices = [];

      return;

    }


    this.paymentMethods =
      this.accountsService
        .getPaymentMethodsForTenant(
          tenantId
        );


    // Only unpaid invoices should be selectable
    this.invoices =
      this.accountsService
        .getInvoicesForTenant(
          tenantId
        )
        .filter(
          invoice =>

            invoice.status !==
              'cancelled' &&

            invoice.balanceAmount > 0
        );


    this.paymentForm.patchValue({


      locationId:
        null,


      paymentMethodId:
        null,


      invoiceId:
        null,


      memberId:
        null,


      amount:
        null,


      transactionId:
        '',


      referenceNumber:
        '',


      paymentNumber:
        this.accountsService
          .generatePaymentNumber(
            tenantId
          )


    });

  }


  // =====================================================
  // INVOICE CHANGE
  // =====================================================

  onInvoiceChange(): void {

    const invoiceId =
      Number(
        this.paymentForm
          .controls
          .invoiceId
          .value
      );


    if (!invoiceId) {

      return;

    }


    const invoice =
      this.invoices.find(
        item =>
          item.invoiceId ===
          invoiceId
      );


    if (!invoice) {

      return;

    }


    this.paymentForm.patchValue({


      locationId:
        invoice.locationId,


      memberId:
        invoice.memberId ??
        null,


      amount:
        invoice.balanceAmount


    });

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.submitted = true;


    if (
      this.paymentForm.invalid
    ) {

      this.paymentForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.paymentForm
        .getRawValue();


    const request:
      PaymentRequest = {


      tenantId:
        Number(
          value.tenantId
        ),


      locationId:
        Number(
          value.locationId
        ),


      paymentNumber:
        String(
          value.paymentNumber ??
          ''
        )
          .trim(),


      paymentDate:
        String(
          value.paymentDate ??
          ''
        ),


      memberId:

        value.memberId

          ? Number(
              value.memberId
            )

          : null,


      invoiceId:

        value.invoiceId

          ? Number(
              value.invoiceId
            )

          : null,


      paymentMethodId:
        Number(
          value.paymentMethodId
        ),


      amount:
        Number(
          value.amount
        ),


      transactionId:

        String(
          value.transactionId ??
          ''
        )
          .trim()

        ||

        null,


      paymentStatus:
        (value.paymentStatus ?? 'completed') as PaymentStatus,


      referenceNumber:

        String(
          value.referenceNumber ??
          ''
        )
          .trim()

        ||

        null,


      notes:

        String(
          value.notes ??
          ''
        )
          .trim()

        ||

        null


    };


    this.isSubmitting =
      true;


    this.accountsService
      .createPayment(
        request
      );


    this.router.navigate([
      '/platform/accounts/payments'
    ]);

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/platform/accounts/payments'
    ]);

  }


  // =====================================================
  // VALIDATION
  // =====================================================

  isInvalid(
    controlName:
      keyof typeof this.paymentForm.controls
  ): boolean {

    const control =
      this.paymentForm.controls[
        controlName
      ];


    return (

      (
        this.submitted ||

        control.touched ||

        control.dirty
      )

      &&

      control.invalid

    );

  }


  hasError(
    controlName:
      keyof typeof this.paymentForm.controls,

    errorName: string
  ): boolean {

    const control =
      this.paymentForm.controls[
        controlName
      ];


    return (

      this.isInvalid(
        controlName
      )

      &&

      control.hasError(
        errorName
      )

    );

  }


  // =====================================================
  // TODAY
  // =====================================================

  private getToday(): string {

    const today =
      new Date();


    return [

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

    ].join('-');

  }

}