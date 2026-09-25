import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  CreateInvoiceItemRequest,
  CreateInvoiceRequest,
  InvoiceItemType,
  InvoiceType
} from '../../../models/invoice.model';

import {
  CreatePaymentRequest,
  PaymentMethod
} from '../../../models/payment.model';

import {
  InvoiceService
} from '../../../services/invoice.service';

import {
  PaymentService
} from '../../../services/payment.service';


type PaymentOption =
  | 'pay_now'
  | 'partial'
  | 'pay_later';


interface MemberOption {

  memberId: number;

  memberCode: string;

  memberName: string;

}


interface LocationOption {

  locationId: number;

  locationName: string;

}


interface BillingItemOption {

  id: number;

  type: InvoiceItemType;

  name: string;

  price: number;

  taxPercentage: number;

}


@Component({
  selector:
    'app-invoice-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl:
    './invoice-form.html',

  styleUrl:
    './invoice-form.scss'
})
export class InvoiceFormComponent
  implements OnInit {


  /*
   * TEMPORARY
   *
   * Later tenantId must come from
   * logged-in user / authentication context.
   */

  readonly tenantId = 1;


  submitted = false;

  saving = false;


  paymentMethods:
    PaymentMethod[] = [];


  /*
   * TEMPORARY MEMBER DATA
   *
   * Later replace with MemberService.
   */

  readonly members:
    MemberOption[] = [

    {
      memberId: 101,
      memberCode: 'MEM-001',
      memberName: 'Arun Kumar'
    },

    {
      memberId: 102,
      memberCode: 'MEM-002',
      memberName: 'Rahul Sharma'
    },

    {
      memberId: 103,
      memberCode: 'MEM-003',
      memberName: 'Kiran R'
    }

  ];


  /*
   * TEMPORARY LOCATION DATA
   *
   * Later replace with LocationService.
   */

  readonly locations:
    LocationOption[] = [

    {
      locationId: 1,
      locationName: 'Main Branch'
    },

    {
      locationId: 2,
      locationName: 'Branch 2'
    }

  ];


  /*
   * TEMPORARY BILLING CATALOG
   *
   * Later:
   *
   * membership -> membership plans
   * pt_session -> PT packages/sessions
   * product    -> products
   * service    -> gym services
   */

  readonly billingItems:
    BillingItemOption[] = [


    // MEMBERSHIP
    {
      id: 1,
      type: 'membership',
      name: 'Monthly Membership',
      price: 1500,
      taxPercentage: 18
    },

    {
      id: 2,
      type: 'membership',
      name: 'Quarterly Membership',
      price: 4000,
      taxPercentage: 18
    },

    {
      id: 3,
      type: 'membership',
      name: 'Half Yearly Membership',
      price: 7500,
      taxPercentage: 18
    },

    {
      id: 4,
      type: 'membership',
      name: 'Annual Membership',
      price: 12000,
      taxPercentage: 18
    },


    // PT
    {
      id: 10,
      type: 'pt_session',
      name: 'Personal Training - 1 Session',
      price: 700,
      taxPercentage: 18
    },

    {
      id: 11,
      type: 'pt_session',
      name: 'Personal Training - 10 Sessions',
      price: 6000,
      taxPercentage: 18
    },

    {
      id: 12,
      type: 'pt_session',
      name: 'Personal Training - 20 Sessions',
      price: 11000,
      taxPercentage: 18
    },


    // PRODUCT
    {
      id: 20,
      type: 'product',
      name: 'Gym T-Shirt',
      price: 799,
      taxPercentage: 18
    },

    {
      id: 21,
      type: 'product',
      name: 'Gym Shaker',
      price: 499,
      taxPercentage: 18
    },


    // SERVICE
    {
      id: 30,
      type: 'service',
      name: 'Body Composition Analysis',
      price: 500,
      taxPercentage: 18
    },

    {
      id: 31,
      type: 'service',
      name: 'Diet Consultation',
      price: 1000,
      taxPercentage: 18
    }

  ];


invoiceForm!: FormGroup;


  constructor(

    private readonly fb:
      FormBuilder,

    private readonly invoiceService:
      InvoiceService,

    private readonly paymentService:
      PaymentService,

    private readonly router:
      Router

  ) {

    this.invoiceForm =
      this.fb.group({


        memberId: [
          null as number | null,
          Validators.required
        ],


        locationId: [
          null as number | null,
          Validators.required
        ],


        invoiceDate: [
          this.today(),
          Validators.required
        ],


        dueDate: [
          this.today()
        ],


        invoiceType: [
          'membership' as InvoiceType,
          Validators.required
        ],


        notes: [
          ''
        ],


        paymentOption: [
          'pay_now' as PaymentOption,
          Validators.required
        ],


        paymentMethodId: [
          null as number | null
        ],


        paymentAmount: [
          null as number | null
        ],


        transactionId: [
          ''
        ],


        referenceNumber: [
          ''
        ],


        paymentNotes: [
          ''
        ],


        items:
          this.fb.array<
            FormGroup
          >([])

      });

  }


  ngOnInit(): void {


    this.loadPaymentMethods();


    this.addItem();


    this.invoiceForm
      .get('paymentOption')
      ?.valueChanges
      .subscribe(
        () => {

          this.updatePaymentValidators();

        }
      );

  }


  // =====================================================
  // ITEMS
  // =====================================================

  get items():
    FormArray<FormGroup> {

    return this.invoiceForm.get(
      'items'
    ) as FormArray<FormGroup>;

  }


  createItemForm():
    FormGroup {

    return this.fb.group({


      itemType: [
        'membership',
        Validators.required
      ],


      referenceId: [
        null,
        Validators.required
      ],


      itemDescription: [
        '',
        Validators.required
      ],


      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],


      unitPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],


      discountAmount: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],


      taxPercentage: [
        18,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]

    });

  }


  addItem(): void {

    this.items.push(
      this.createItemForm()
    );

  }


  removeItem(
    index: number
  ): void {

    if (
      this.items.length === 1
    ) {

      return;

    }


    this.items.removeAt(
      index
    );

  }


  // =====================================================
  // ITEM TYPE CHANGE
  // =====================================================

  onItemTypeChange(
    index: number
  ): void {

    const row =
      this.items.at(
        index
      );


    row.patchValue({

      referenceId:
        null,

      itemDescription:
        '',

      quantity:
        1,

      unitPrice:
        0,

      discountAmount:
        0,

      taxPercentage:
        18

    });

  }


  // =====================================================
  // ITEM SELECTION
  // =====================================================

  onBillingItemChange(
    index: number
  ): void {

    const row =
      this.items.at(
        index
      );


    const referenceId =
      Number(
        row.get(
          'referenceId'
        )?.value
      );


    const itemType =
      row.get(
        'itemType'
      )?.value as InvoiceItemType;


    const selected =
      this.billingItems.find(
        item =>

          item.id ===
            referenceId

          &&

          item.type ===
            itemType
      );


    if (!selected) {

      return;

    }


    row.patchValue({

      itemDescription:
        selected.name,

      unitPrice:
        selected.price,

      taxPercentage:
        selected.taxPercentage

    });

  }


  // =====================================================
  // AVAILABLE ITEMS
  // =====================================================

  getItemsByType(
    type:
      InvoiceItemType
  ): BillingItemOption[] {

    return this.billingItems
      .filter(
        item =>
          item.type === type
      );

  }


  // =====================================================
  // ROW TOTALS
  // =====================================================

  getRowSubtotal(
    index: number
  ): number {

    const row =
      this.items.at(
        index
      );


    const quantity =
      Number(
        row.get(
          'quantity'
        )?.value
      ) || 0;


    const price =
      Number(
        row.get(
          'unitPrice'
        )?.value
      ) || 0;


    return this.round(
      quantity *
      price
    );

  }


  getRowTax(
    index: number
  ): number {

    const row =
      this.items.at(
        index
      );


    const subtotal =
      this.getRowSubtotal(
        index
      );


    const discount =
      Number(
        row.get(
          'discountAmount'
        )?.value
      ) || 0;


    const taxPercentage =
      Number(
        row.get(
          'taxPercentage'
        )?.value
      ) || 0;


    const taxable =
      Math.max(
        0,
        subtotal -
        discount
      );


    return this.round(

      taxable *
      taxPercentage /
      100

    );

  }


  getRowTotal(
    index: number
  ): number {

    const row =
      this.items.at(
        index
      );


    const subtotal =
      this.getRowSubtotal(
        index
      );


    const discount =
      Number(
        row.get(
          'discountAmount'
        )?.value
      ) || 0;


    const tax =
      this.getRowTax(
        index
      );


    return this.round(

      Math.max(
        0,
        subtotal -
        discount
      )

      +

      tax

    );

  }


  // =====================================================
  // INVOICE TOTALS
  // =====================================================

  get subtotal(): number {

    return this.round(

      this.items.controls
        .reduce(
          (
            total,
            _,
            index
          ) =>

            total +
            this.getRowSubtotal(
              index
            ),

          0
        )

    );

  }


  get discountTotal(): number {

    return this.round(

      this.items.controls
        .reduce(
          (
            total,
            row
          ) =>

            total +

            (
              Number(
                row.get(
                  'discountAmount'
                )?.value
              ) || 0
            ),

          0
        )

    );

  }


  get taxTotal(): number {

    return this.round(

      this.items.controls
        .reduce(
          (
            total,
            _,
            index
          ) =>

            total +
            this.getRowTax(
              index
            ),

          0
        )

    );

  }


  get invoiceTotal(): number {

    return this.round(

      this.subtotal -
      this.discountTotal +
      this.taxTotal

    );

  }


  // =====================================================
  // PAYMENT OPTIONS
  // =====================================================

  get paymentOption():
    PaymentOption {

    return (

      this.invoiceForm.get(
        'paymentOption'
      )?.value

      ||

      'pay_later'

    );

  }


  get showPaymentFields():
    boolean {

    return (
      this.paymentOption !==
      'pay_later'
    );

  }


  onPaymentOptionChange(): void {


    if (
      this.paymentOption ===
      'pay_now'
    ) {

      this.invoiceForm.patchValue({

        paymentAmount:
          this.invoiceTotal

      });

    }


    if (
      this.paymentOption ===
      'partial'
    ) {

      this.invoiceForm.patchValue({

        paymentAmount:
          null

      });

    }


    if (
      this.paymentOption ===
      'pay_later'
    ) {

      this.invoiceForm.patchValue({

        paymentMethodId:
          null,

        paymentAmount:
          null,

        transactionId:
          '',

        referenceNumber:
          '',

        paymentNotes:
          ''

      });

    }


    this.updatePaymentValidators();

  }


  private updatePaymentValidators():
    void {


    const methodControl =
      this.invoiceForm.get(
        'paymentMethodId'
      ) as FormControl | null;


    const amountControl =
      this.invoiceForm.get(
        'paymentAmount'
      ) as FormControl | null;

    if (!methodControl || !amountControl) {
      return;
    }


    methodControl
      .clearValidators();


    amountControl
      .clearValidators();


    if (
      this.paymentOption !==
      'pay_later'
    ) {

      methodControl.setValidators([
        Validators.required
      ]);


      amountControl.setValidators([

        Validators.required,

        Validators.min(
          0.01
        )

      ]);

    }


    methodControl
      .updateValueAndValidity({
        emitEvent:
          false
      });


    amountControl
      .updateValueAndValidity({
        emitEvent:
          false
      });

  }


  // =====================================================
  // LOAD PAYMENT METHODS
  // =====================================================

  private loadPaymentMethods():
    void {

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


  // =====================================================
  // SAVE
  // =====================================================

  saveInvoice(): void {

    this.submitted =
      true;


    this.updatePaymentValidators();


    if (
      this.invoiceForm.invalid
    ) {

      this.invoiceForm
        .markAllAsTouched();

      return;

    }


    if (
      this.items.length === 0
    ) {

      return;

    }


    if (
      this.invoiceTotal <= 0
    ) {

      return;

    }


    const value =
      this.invoiceForm
        .getRawValue();


    /*
     * Validate payment BEFORE invoice creation.
     */

    if (
      this.showPaymentFields
    ) {

      const paymentAmount =
        Number(
          value.paymentAmount
        );


      if (
        paymentAmount <= 0
      ) {

        return;

      }


      if (
        paymentAmount >
        this.invoiceTotal
      ) {

        alert(
          'Payment amount cannot exceed invoice total.'
        );

        return;

      }


      if (
        this.paymentOption ===
          'pay_now'

        &&

        paymentAmount !==
          this.invoiceTotal
      ) {

        alert(
          'Pay Now amount must equal the invoice total.'
        );

        return;

      }


      if (
        this.paymentOption ===
          'partial'

        &&

        paymentAmount >=
          this.invoiceTotal
      ) {

        alert(
          'Partial payment must be less than the invoice total.'
        );

        return;

      }

    }


    this.saving =
      true;


    try {


      const invoiceItems:
        CreateInvoiceItemRequest[] =

        this.items.controls
          .map(
            row => ({

              itemDescription:
                String(
                  row.get(
                    'itemDescription'
                  )?.value
                  ?? ''
                ),

              itemType:
                row.get(
                  'itemType'
                )?.value as InvoiceItemType,

              referenceId:
                Number(
                  row.get(
                    'referenceId'
                  )?.value
                )
                || null,

              quantity:
                Number(
                  row.get(
                    'quantity'
                  )?.value
                ),

              unitPrice:
                Number(
                  row.get(
                    'unitPrice'
                  )?.value
                ),

              discountAmount:
                Number(
                  row.get(
                    'discountAmount'
                  )?.value
                )
                || 0,

              taxPercentage:
                Number(
                  row.get(
                    'taxPercentage'
                  )?.value
                )
                || 0

            })
          );


      const invoiceRequest:
        CreateInvoiceRequest = {

        tenantId:
          this.tenantId,

        locationId:
          Number(
            value.locationId
          ),

        invoiceDate:
          String(
            value.invoiceDate
          ),

        memberId:
          Number(
            value.memberId
          ),

        invoiceType:
          value.invoiceType as InvoiceType,

        dueDate:
          value.dueDate
            ? String(
                value.dueDate
              )
            : null,

        notes:
          value.notes
            ? String(
                value.notes
              ).trim()
            : null,

        items:
          invoiceItems

      };


      /*
       * 1. CREATE INVOICE
       */

      const invoice =
        this.invoiceService
          .createInvoice(
            invoiceRequest
          );


      /*
       * 2. CREATE PAYMENT
       * Only for Pay Now / Partial
       */

      if (
        this.showPaymentFields
      ) {


        const paymentRequest:
          CreatePaymentRequest = {

          tenantId:
            this.tenantId,

          locationId:
            invoice.locationId,

          paymentDate:
            invoice.invoiceDate,

          memberId:
            invoice.memberId,

          invoiceId:
            invoice.invoiceId,

          /*
           * IMPORTANT
           *
           * PAYMENT METHOD ID
           * is stored here.
           */

          paymentMethodId:
            Number(
              value.paymentMethodId
            ),

          amount:
            Number(
              value.paymentAmount
            ),

          transactionId:
            value.transactionId
              ? String(
                  value.transactionId
                ).trim()
              : null,

          paymentStatus:
            'completed',

          referenceNumber:
            value.referenceNumber
              ? String(
                  value.referenceNumber
                ).trim()
              : null,

          notes:
            value.paymentNotes
              ? String(
                  value.paymentNotes
                ).trim()
              : null

        };


        this.paymentService
          .createPayment(
            paymentRequest
          );

      }


      /*
       * 3. GO TO INVOICE DETAILS
       */

      this.router.navigate([

        '/accounts/invoices',

        invoice.invoiceId

      ]);


    }
    catch (
      error
    ) {


      console.error(
        error
      );


      const message =

        error instanceof Error

          ? error.message

          : 'Unable to create invoice.';


      alert(
        message
      );


      this.saving =
        false;

    }

  }


  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {

    this.router.navigate([
      '/accounts/invoices'
    ]);

  }


  // =====================================================
  // VALIDATION
  // =====================================================

  isInvalid(
    controlName:
      keyof typeof this.invoiceForm.controls
  ): boolean {

    const control =
      this.invoiceForm
        .controls[
          controlName
        ];


    return (

      (
        control.touched ||
        this.submitted
      )

      &&

      control.invalid

    );

  }


  // =====================================================
  // HELPERS
  // =====================================================

  private today():
    string {

    const date =
      new Date();


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      )
        .padStart(
          2,
          '0'
        );


    const day =
      String(
        date.getDate()
      )
        .padStart(
          2,
          '0'
        );


    return (
      `${year}-${month}-${day}`
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