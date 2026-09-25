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
  Router
} from '@angular/router';

import {
  CreateExpenseRequest
} from '../../../../models/expense.model';

import {
  PaymentMethod
} from '../../../../models/payment.model';

import {
  ExpenseService
} from '../../../../services/expense.service';

import {
  PaymentService
} from '../../../../services/payment.service';


@Component({
  selector:
    'app-expense-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './expense-form.html',

  styleUrl:
    './expense-form.scss'
})
export class ExpenseFormComponent
  implements OnInit {


  private readonly fb =
    inject(FormBuilder);


  readonly tenantId = 1;


  saving = false;

  submitted = false;


  paymentMethods:
    PaymentMethod[] = [];


  readonly categories = [

    'Utilities',

    'Maintenance',

    'Rent',

    'Salary',

    'Supplies',

    'Equipment',

    'Marketing',

    'Cleaning',

    'Other'

  ];


  readonly locations = [

    {
      id: 1,
      name: 'Main Branch'
    },

    {
      id: 2,
      name: 'Branch 2'
    }

  ];


  expenseForm =
    this.fb.group({


      locationId: [
        null as number | null,
        Validators.required
      ],


      expenseDate: [
        this.today(),
        Validators.required
      ],


      category: [
        '',
        Validators.required
      ],


      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],


      amount: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],


      paymentMethodId: [
        null as number | null
      ],


      payee: [
        ''
      ],


      referenceNumber: [
        ''
      ],


      notes: [
        ''
      ]


    });


  constructor(

    private readonly expenseService:
      ExpenseService,

    private readonly paymentService:
      PaymentService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {


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


  save(): void {


    this.submitted = true;


    if (
      this.expenseForm.invalid
    ) {

      this.expenseForm
        .markAllAsTouched();

      return;

    }


    this.saving = true;


    const value =
      this.expenseForm
        .getRawValue();


    try {


      const request:
        CreateExpenseRequest = {

        tenantId:
          this.tenantId,

        locationId:
          Number(
            value.locationId
          ),

        expenseDate:
          String(
            value.expenseDate
          ),

        category:
          String(
            value.category
          ),

        description:
          String(
            value.description
          ).trim(),

        amount:
          Number(
            value.amount
          ),

        paymentMethodId:
          value.paymentMethodId
            ? Number(
                value.paymentMethodId
              )
            : null,

        payee:
          value.payee
            ? String(
                value.payee
              ).trim()
            : null,

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


      this.expenseService
        .createExpense(
          request
        );


      this.router.navigate([
        '/accounts/expenses'
      ]);


    }
    catch (
      error
    ) {


      alert(

        error instanceof Error
          ? error.message
          : 'Unable to create expense.'

      );


      this.saving = false;

    }

  }


  cancel(): void {

    this.router.navigate([
      '/accounts/expenses'
    ]);

  }


  isInvalid(
    controlName:
      keyof typeof this.expenseForm.controls
  ): boolean {


    const control =
      this.expenseForm
        .controls[
          controlName
        ];


    return (

      (
        control.touched
        ||
        this.submitted
      )

      &&

      control.invalid

    );

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