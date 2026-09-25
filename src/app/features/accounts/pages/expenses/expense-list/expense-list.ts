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
  Expense
} from '../../../models/expense.model';

import {
  ExpenseService
} from '../../../services/expense.service';

import {
  PaymentService
} from '../../../services/payment.service';


@Component({
  selector:
    'app-expense-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './expense-list.html',

  styleUrl:
    './expense-list.scss'
})
export class ExpenseListComponent
  implements OnInit {


  readonly tenantId = 1;


  expenses:
    Expense[] = [];


  filteredExpenses:
    Expense[] = [];


  searchText = '';

  selectedCategory = '';

  selectedStatus = '';


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


  constructor(

    private readonly expenseService:
      ExpenseService,

    private readonly paymentService:
      PaymentService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {

    this.loadExpenses();

  }


  loadExpenses(): void {

    this.expenseService
      .getExpenses(
        this.tenantId
      )
      .subscribe(
        expenses => {

          this.expenses =
            expenses;

          this.applyFilters();

        }
      );

  }


  applyFilters(): void {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredExpenses =
      this.expenses.filter(
        expense => {


          const matchesSearch =

            !search

            ||

            expense.description
              .toLowerCase()
              .includes(
                search
              )

            ||

            expense.category
              .toLowerCase()
              .includes(
                search
              )

            ||

            (
              expense.payee
              ?? ''
            )
              .toLowerCase()
              .includes(
                search
              )

            ||

            (
              expense.referenceNumber
              ?? ''
            )
              .toLowerCase()
              .includes(
                search
              );


          const matchesCategory =

            !this.selectedCategory

            ||

            expense.category ===
              this.selectedCategory;


          const matchesStatus =

            !this.selectedStatus

            ||

            expense.status ===
              this.selectedStatus;


          return (

            matchesSearch

            &&

            matchesCategory

            &&

            matchesStatus

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedCategory = '';

    this.selectedStatus = '';

    this.applyFilters();

  }


  createExpense(): void {

    this.router.navigate([
      '/accounts/expenses/new'
    ]);

  }


  getPaymentMethod(
    paymentMethodId:
      number | null
  ): string {


    if (
      !paymentMethodId
    ) {

      return '-';

    }


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


  get totalExpenses():
    number {

    return this.filteredExpenses

      .filter(
        expense =>
          expense.status ===
          'approved'
      )

      .reduce(
        (
          total,
          expense
        ) =>

          total +
          expense.amount,

        0
      );

  }

}