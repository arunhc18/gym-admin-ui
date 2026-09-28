import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  map
} from 'rxjs';

import {
  CreateInvoiceItemRequest,
  CreateInvoiceRequest,
  Invoice,
  InvoiceDetails,
  InvoiceItem,
  InvoiceStatus,
  InvoiceTotals
} from '../models/invoice.model';


@Injectable({
  providedIn: 'root'
})
export class InvoiceService {


  // =====================================================
  // MOCK INVOICES
  // Later replace with ASP.NET Core HttpClient.
  // =====================================================

  private readonly invoicesSubject =
    new BehaviorSubject<Invoice[]>([

      {
        invoiceId: 1,

        tenantId: 1,

        locationId: 1,

        invoiceNumber:
          'INV-2026-0001',

        invoiceDate:
          '2026-09-20',

        memberId: 1,

        invoiceType:
          'membership',

        subtotal:
          12000,

        discountAmount:
          1000,

        taxAmount:
          1980,

        totalAmount:
          12980,

        paidAmount:
          12980,

        balanceAmount:
          0,

        status:
          'paid',

        dueDate:
          '2026-09-20',

        notes:
          'Annual membership invoice'
      },


      {
        invoiceId: 2,

        tenantId: 1,

        locationId: 1,

        invoiceNumber:
          'INV-2026-0002',

        invoiceDate:
          '2026-09-21',

        memberId: 2,

        invoiceType:
          'pt_package',

        subtotal:
          5000,

        discountAmount:
          0,

        taxAmount:
          900,

        totalAmount:
          5900,

        paidAmount:
          3000,

        balanceAmount:
          2900,

        status:
          'partial',

        dueDate:
          '2026-09-28',

        notes:
          'Personal training package'
      }

    ]);


  // =====================================================
  // MOCK INVOICE ITEMS
  // =====================================================

  private readonly invoiceItemsSubject =
    new BehaviorSubject<InvoiceItem[]>([

      {
        invoiceItemId: 1,

        invoiceId: 1,

        itemDescription:
          'Gold Membership - 12 Months',

        itemType:
          'membership',

        referenceId: 12,

        quantity: 1,

        unitPrice:
          12000,

        discountAmount:
          1000,

        taxPercentage:
          18,

        taxAmount:
          1980,

        totalAmount:
          12980
      },


      {
        invoiceItemId: 2,

        invoiceId: 2,

        itemDescription:
          'Personal Training - 10 Sessions',

        itemType:
          'pt_session',

        referenceId: 25,

        quantity: 10,

        unitPrice:
          500,

        discountAmount:
          0,

        taxPercentage:
          18,

        taxAmount:
          900,

        totalAmount:
          5900
      }

    ]);


  // =====================================================
  // GET INVOICES
  // =====================================================

  getInvoices(
    tenantId: number
  ): Observable<Invoice[]> {

    return this.invoicesSubject.pipe(

      map(
        invoices =>

          invoices

            .filter(
              invoice =>
                invoice.tenantId ===
                tenantId
            )

            .sort(
              (a, b) => {

                const dateCompare =
                  b.invoiceDate
                    .localeCompare(
                      a.invoiceDate
                    );


                return dateCompare !== 0

                  ? dateCompare

                  : b.invoiceId -
                    a.invoiceId;

              }
            )

      )

    );

  }


  // =====================================================
  // GET INVOICE
  // =====================================================

  getInvoiceById(
    invoiceId: number,
    tenantId: number
  ): Invoice | undefined {

    return this.invoicesSubject
      .value
      .find(
        invoice =>

          invoice.invoiceId ===
            invoiceId

          &&

          invoice.tenantId ===
            tenantId
      );

  }


  // =====================================================
  // GET INVOICE ITEMS
  // =====================================================

  getInvoiceItems(
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
  // GET INVOICE DETAILS
  // =====================================================

  getInvoiceDetails(
    invoiceId: number,
    tenantId: number
  ): InvoiceDetails | undefined {

    const invoice =
      this.getInvoiceById(
        invoiceId,
        tenantId
      );


    if (!invoice) {

      return undefined;

    }


    return {

      invoice,

      items:
        this.getInvoiceItems(
          invoiceId
        )

    };

  }


  // =====================================================
  // CALCULATE ITEM
  // =====================================================

  calculateItem(
    item:
      CreateInvoiceItemRequest
  ): {

    subtotal: number;

    discountAmount: number;

    taxAmount: number;

    totalAmount: number;

  } {


    const quantity =
      Math.max(
        1,
        Number(
          item.quantity
        ) || 1
      );


    const unitPrice =
      Math.max(
        0,
        Number(
          item.unitPrice
        ) || 0
      );


    const discount =
      Math.max(
        0,
        Number(
          item.discountAmount
        ) || 0
      );


    const taxPercentage =
      Math.max(
        0,
        Number(
          item.taxPercentage
        ) || 0
      );


    const subtotal =
      quantity *
      unitPrice;


    const taxableAmount =
      Math.max(
        0,
        subtotal -
        discount
      );


    const taxAmount =
      taxableAmount *
      taxPercentage /
      100;


    const totalAmount =
      taxableAmount +
      taxAmount;


    return {

      subtotal:
        this.round(
          subtotal
        ),

      discountAmount:
        this.round(
          discount
        ),

      taxAmount:
        this.round(
          taxAmount
        ),

      totalAmount:
        this.round(
          totalAmount
        )

    };

  }


  // =====================================================
  // CALCULATE INVOICE TOTALS
  // =====================================================

  calculateTotals(
    items:
      CreateInvoiceItemRequest[]
  ): InvoiceTotals {


    let subtotal = 0;

    let discountAmount = 0;

    let taxAmount = 0;

    let totalAmount = 0;


    for (
      const item
      of items
    ) {

      const calculated =
        this.calculateItem(
          item
        );


      subtotal +=
        calculated.subtotal;


      discountAmount +=
        calculated.discountAmount;


      taxAmount +=
        calculated.taxAmount;


      totalAmount +=
        calculated.totalAmount;

    }


    return {

      subtotal:
        this.round(
          subtotal
        ),

      discountAmount:
        this.round(
          discountAmount
        ),

      taxAmount:
        this.round(
          taxAmount
        ),

      totalAmount:
        this.round(
          totalAmount
        )

    };

  }


  // =====================================================
  // CREATE INVOICE
  // =====================================================

  createInvoice(
    request:
      CreateInvoiceRequest
  ): Invoice {


    if (
      !request.items.length
    ) {

      throw new Error(
        'Invoice must contain at least one item.'
      );

    }


    const invoices =
      this.invoicesSubject.value;


    const nextInvoiceId =

      invoices.length === 0

        ? 1

        : Math.max(
            ...invoices.map(
              invoice =>
                invoice.invoiceId
            )
          ) + 1;


    const totals =
      this.calculateTotals(
        request.items
      );


    const invoiceNumber =
      this.generateInvoiceNumber(
        request.tenantId
      );


    const now =
      new Date()
        .toISOString();


    const invoice:
      Invoice = {

      invoiceId:
        nextInvoiceId,

      tenantId:
        request.tenantId,

      locationId:
        request.locationId,

      invoiceNumber,

      invoiceDate:
        request.invoiceDate,

      memberId:
        request.memberId,

      invoiceType:
        request.invoiceType,

      subtotal:
        totals.subtotal,

      discountAmount:
        totals.discountAmount,

      taxAmount:
        totals.taxAmount,

      totalAmount:
        totals.totalAmount,

      paidAmount:
        0,

      balanceAmount:
        totals.totalAmount,

      status:
        'pending',

      dueDate:
        request.dueDate,

      notes:
        request.notes,

      createdAt:
        now,

      updatedAt:
        now

    };


    // SAVE INVOICE
    this.invoicesSubject.next([

      invoice,

      ...invoices

    ]);


    // SAVE INVOICE ITEMS
    this.createInvoiceItems(
      nextInvoiceId,
      request.items
    );


    return invoice;

  }


  // =====================================================
  // CREATE INVOICE ITEMS
  // =====================================================

  private createInvoiceItems(
    invoiceId: number,
    items:
      CreateInvoiceItemRequest[]
  ): void {


    const existingItems =
      this.invoiceItemsSubject.value;


    let nextItemId =

      existingItems.length === 0

        ? 1

        : Math.max(
            ...existingItems.map(
              item =>
                item.invoiceItemId
            )
          ) + 1;


    const now =
      new Date()
        .toISOString();


    const newItems:
      InvoiceItem[] =
      items.map(
        item => {


          const calculated =
            this.calculateItem(
              item
            );


          const invoiceItem:
            InvoiceItem = {

            invoiceItemId:
              nextItemId++,

            invoiceId,

            itemDescription:
              item.itemDescription,

            itemType:
              item.itemType,

            referenceId:
              item.referenceId,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice,

            discountAmount:
              calculated.discountAmount,

            taxPercentage:
              item.taxPercentage,

            taxAmount:
              calculated.taxAmount,

            totalAmount:
              calculated.totalAmount,

            createdAt:
              now,

            updatedAt:
              now

          };


          return invoiceItem;

        }
      );


    this.invoiceItemsSubject.next([

      ...existingItems,

      ...newItems

    ]);

  }


  // =====================================================
  // APPLY PAYMENT TO INVOICE
  // Called by PaymentService
  // =====================================================

  applyPayment(
    invoiceId: number,
    tenantId: number,
    amount: number
  ): Invoice {


    const invoices =
      this.invoicesSubject.value;


    const index =
      invoices.findIndex(
        invoice =>

          invoice.invoiceId ===
            invoiceId

          &&

          invoice.tenantId ===
            tenantId
      );


    if (
      index === -1
    ) {

      throw new Error(
        'Invoice not found.'
      );

    }


    const invoice =
      invoices[index];


    if (
      invoice.status ===
        'cancelled'
    ) {

      throw new Error(
        'Payment cannot be added to a cancelled invoice.'
      );

    }


    if (
      amount <= 0
    ) {

      throw new Error(
        'Payment amount must be greater than zero.'
      );

    }


    if (
      amount >
      invoice.balanceAmount
    ) {

      throw new Error(
        'Payment cannot exceed the invoice balance.'
      );

    }


    const paidAmount =
      this.round(

        invoice.paidAmount +
        amount

      );


    const balanceAmount =
      this.round(

        invoice.totalAmount -
        paidAmount

      );


    let status:
      InvoiceStatus;


    if (
      balanceAmount <= 0
    ) {

      status =
        'paid';

    }
    else if (
      paidAmount > 0
    ) {

      status =
        'partial';

    }
    else {

      status =
        'pending';

    }


    const updated:
      Invoice = {

      ...invoice,

      paidAmount,

      balanceAmount,

      status,

      updatedAt:
        new Date()
          .toISOString()

    };


    const updatedInvoices =
      [...invoices];


    updatedInvoices[index] =
      updated;


    this.invoicesSubject.next(
      updatedInvoices
    );


    return updated;

  }


  // =====================================================
  // GENERATE INVOICE NUMBER
  // =====================================================

  generateInvoiceNumber(
    tenantId: number
  ): string {


    const today =
      new Date();


    const year =
      today.getFullYear();


    const tenantCount =
      this.invoicesSubject
        .value
        .filter(
          invoice =>
            invoice.tenantId ===
            tenantId
        )
        .length + 1;


    return (

      `INV-${year}-`

      +

      String(
        tenantCount
      )
        .padStart(
          4,
          '0'
        )

    );

  }


  // =====================================================
  // ROUND MONEY
  // =====================================================

  private round(
    value: number
  ): number {

    return Math.round(
      (
        value +
        Number.EPSILON
      ) *
      100
    ) / 100;

  }

}