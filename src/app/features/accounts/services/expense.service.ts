import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  CreateExpenseRequest,
  Expense
} from '../models/expense.model';


@Injectable({
  providedIn: 'root'
})
export class ExpenseService {


  private readonly expensesSubject =
    new BehaviorSubject<Expense[]>([

      {
        expenseId: 1,

        tenantId: 1,

        locationId: 1,

        expenseDate:
          '2026-09-24',

        category:
          'Utilities',

        description:
          'Electricity Bill',

        amount:
          8500,

        paymentMethodId:
          2,

        payee:
          'BESCOM',

        referenceNumber:
          'ELEC-SEP-2026',

        notes:
          'September electricity bill',

        status:
          'approved'
      },


      {
        expenseId: 2,

        tenantId: 1,

        locationId: 1,

        expenseDate:
          '2026-09-24',

        category:
          'Maintenance',

        description:
          'Treadmill Service',

        amount:
          2500,

        paymentMethodId:
          1,

        payee:
          'Fitness Equipment Service',

        referenceNumber:
          null,

        notes:
          'Routine treadmill maintenance',

        status:
          'approved'
      },


      {
        expenseId: 3,

        tenantId: 1,

        locationId: 1,

        expenseDate:
          '2026-09-23',

        category:
          'Supplies',

        description:
          'Cleaning Supplies',

        amount:
          1800,

        paymentMethodId:
          1,

        payee:
          'Local Supplier',

        referenceNumber:
          null,

        notes:
          null,

        status:
          'approved'
      }

    ]);


  // =====================================================
  // GET EXPENSES
  // =====================================================

  getExpenses(
    tenantId: number
  ): Observable<Expense[]> {

    return this.expensesSubject.pipe(

      map(
        expenses =>

          expenses

            .filter(
              expense =>
                expense.tenantId ===
                tenantId
            )

            .sort(
              (
                a,
                b
              ) => {

                const dateCompare =
                  b.expenseDate
                    .localeCompare(
                      a.expenseDate
                    );


                return dateCompare !== 0
                  ? dateCompare
                  : b.expenseId -
                    a.expenseId;

              }
            )

      )

    );

  }


  // =====================================================
  // GET EXPENSE
  // =====================================================

  getExpenseById(
    expenseId: number,
    tenantId: number
  ): Expense | undefined {

    return this.expensesSubject
      .value
      .find(
        expense =>

          expense.expenseId ===
            expenseId

          &&

          expense.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // CREATE EXPENSE
  // =====================================================

  createExpense(
    request:
      CreateExpenseRequest
  ): Expense {


    if (
      request.amount <= 0
    ) {

      throw new Error(
        'Expense amount must be greater than zero.'
      );

    }


    const expenses =
      this.expensesSubject.value;


    const nextId =

      expenses.length === 0

        ? 1

        : Math.max(
            ...expenses.map(
              expense =>
                expense.expenseId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const expense:
      Expense = {

      expenseId:
        nextId,

      tenantId:
        request.tenantId,

      locationId:
        request.locationId,

      expenseDate:
        request.expenseDate,

      category:
        request.category,

      description:
        request.description,

      amount:
        request.amount,

      paymentMethodId:
        request.paymentMethodId,

      payee:
        request.payee,

      referenceNumber:
        request.referenceNumber,

      notes:
        request.notes,

      status:
        'approved',

      createdAt:
        now,

      updatedAt:
        now

    };


    this.expensesSubject.next([

      expense,

      ...expenses

    ]);


    return expense;

  }


  // =====================================================
  // TODAY EXPENSES
  // =====================================================

  getTodayExpenseTotal(
    tenantId: number
  ): number {


    const today =
      this.today();


    return this.round(

      this.expensesSubject
        .value

        .filter(
          expense =>

            expense.tenantId ===
              tenantId

            &&

            expense.status ===
              'approved'

            &&

            expense.expenseDate ===
              today
        )

        .reduce(
          (
            total,
            expense
          ) =>

            total +
            expense.amount,

          0
        )

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

    ].join('-');

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