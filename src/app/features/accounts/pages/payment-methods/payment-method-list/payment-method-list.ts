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
  PaymentMethod,
  PaymentMethodType
} from '../../../models/payment.model';

import {
  PaymentService
} from '../../../services/payment.service';


@Component({
  selector:
    'app-payment-method-list',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './payment-method-list.html',

  styleUrl:
    './payment-method-list.scss'
})
export class PaymentMethodListComponent
  implements OnInit {


  private readonly fb =
    inject(FormBuilder);


  readonly tenantId = 1;


  paymentMethods:
    PaymentMethod[] = [];


  showForm = false;

  submitted = false;

  editingId:
    number | null = null;


  readonly methodTypes:
    {
      value: PaymentMethodType;
      label: string;
    }[] = [

      {
        value: 'cash',
        label: 'Cash'
      },

      {
        value: 'card',
        label: 'Card'
      },

      {
        value: 'upi',
        label: 'UPI'
      },

      {
        value: 'netbanking',
        label: 'Net Banking'
      },

      {
        value: 'wallet',
        label: 'Wallet'
      }

    ];


  methodForm =
    this.fb.group({

      methodName: [
        '',
        [
          Validators.required,
          Validators.maxLength(
            100
          )
        ]
      ],

      methodType: [
        '' as PaymentMethodType | '',
        Validators.required
      ]

    });


  constructor(

    private readonly paymentService:
      PaymentService

  ) {}


  ngOnInit(): void {

    this.paymentService
      .getAllPaymentMethods(
        this.tenantId
      )
      .subscribe(
        methods => {

          this.paymentMethods =
            methods;

        }
      );

  }


  addMethod(): void {

    this.editingId =
      null;

    this.submitted =
      false;

    this.methodForm.reset({

      methodName: '',

      methodType: ''

    });

    this.showForm =
      true;

  }


  editMethod(
    method: PaymentMethod
  ): void {

    this.editingId =
      method.paymentMethodId;

    this.submitted =
      false;

    this.methodForm.setValue({

      methodName:
        method.methodName,

      methodType:
        method.methodType

    });

    this.showForm =
      true;

  }


  cancel(): void {

    this.showForm =
      false;

    this.editingId =
      null;

    this.submitted =
      false;

    this.methodForm.reset();

  }


  save(): void {


    this.submitted =
      true;


    if (
      this.methodForm.invalid
    ) {

      this.methodForm
        .markAllAsTouched();

      return;

    }


    const value =
      this.methodForm
        .getRawValue();


    try {


      if (
        this.editingId
      ) {

        this.paymentService
          .updatePaymentMethod(

            this.editingId,

            this.tenantId,

            String(
              value.methodName
            ),

            value.methodType as
              PaymentMethodType

          );

      }
      else {

        this.paymentService
          .createPaymentMethod(

            this.tenantId,

            String(
              value.methodName
            ),

            value.methodType as
              PaymentMethodType

          );

      }


      this.cancel();


    }
    catch (
      error
    ) {

      alert(

        error instanceof Error

          ? error.message

          : 'Unable to save payment method.'

      );

    }

  }


  toggleStatus(
    method: PaymentMethod
  ): void {


    const message =

      method.isActive

        ? `Deactivate ${method.methodName}?`

        : `Activate ${method.methodName}?`;


    if (
      !confirm(
        message
      )
    ) {

      return;

    }


    this.paymentService
      .togglePaymentMethod(

        method.paymentMethodId,

        this.tenantId

      );

  }


  getTypeLabel(
    type: PaymentMethodType
  ): string {


    return this.methodTypes
      .find(
        item =>
          item.value === type
      )
      ?.label

      ?? type;

  }


  isInvalid(
    name:
      keyof typeof this.methodForm.controls
  ): boolean {


    const control =
      this.methodForm
        .controls[name];


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

}