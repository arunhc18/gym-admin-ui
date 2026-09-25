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
  Invoice,
  InvoiceStatus,
  InvoiceType
} from '../../../models/invoice.model';

import {
  InvoiceService
} from '../../../services/invoice.service';


@Component({
  selector:
    'app-gym-invoice-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './invoice-list.html',

  styleUrl:
    './invoice-list.scss'
})
export class InvoiceListComponent
  implements OnInit {


  /*
   * TEMPORARY:
   *
   * Later this must come from
   * authenticated tenant context.
   */
  readonly tenantId = 1;


  invoices:
    Invoice[] = [];


  filteredInvoices:
    Invoice[] = [];


  searchText = '';

  selectedStatus = '';

  selectedType = '';


  constructor(

    private readonly invoiceService:
      InvoiceService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {

    this.loadInvoices();

  }


  // =====================================================
  // LOAD
  // =====================================================

  loadInvoices(): void {

    this.invoiceService
      .getInvoices(
        this.tenantId
      )
      .subscribe(
        invoices => {

          this.invoices =
            invoices;

          this.applyFilters();

        }
      );

  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredInvoices =
      this.invoices
        .filter(
          invoice => {


            const matchesSearch =

              !search

              ||

              invoice.invoiceNumber
                .toLowerCase()
                .includes(
                  search
                )

              ||

              String(
                invoice.memberId ?? ''
              )
                .includes(
                  search
                )

              ||

              String(
                invoice.locationId
              )
                .includes(
                  search
                );


            const matchesStatus =

              !this.selectedStatus

              ||

              invoice.status ===
                this.selectedStatus;


            const matchesType =

              !this.selectedType

              ||

              invoice.invoiceType ===
                this.selectedType;


            return (

              matchesSearch

              &&

              matchesStatus

              &&

              matchesType

            );

          }
        );

  }


  // =====================================================
  // CLEAR
  // =====================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.selectedType = '';

    this.applyFilters();

  }


  // =====================================================
  // CREATE
  // =====================================================

  createInvoice(): void {

    this.router.navigate([
      '/accounts/invoices/new'
    ]);

  }


  // =====================================================
  // VIEW
  // =====================================================

  viewInvoice(
    invoice: Invoice
  ): void {

    this.router.navigate([
      '/accounts/invoices',
      invoice.invoiceId
    ]);

  }


  // =====================================================
  // PRINT
  // =====================================================

  printInvoice(
    event: Event,
    invoice: Invoice
  ): void {

    event.stopPropagation();


    this.router.navigate(
      [
        '/accounts/invoices',
        invoice.invoiceId
      ],
      {
        queryParams: {
          print: true
        }
      }
    );

  }


  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  recordPayment(
    event: Event,
    invoice: Invoice
  ): void {

    event.stopPropagation();


    if (
      invoice.status ===
        'paid'

      ||

      invoice.status ===
        'cancelled'
    ) {

      return;

    }


    this.router.navigate([
      '/accounts/invoices',
      invoice.invoiceId,
      'payment'
    ]);

  }


  // =====================================================
  // TYPE LABEL
  // =====================================================

  getTypeLabel(
    type: InvoiceType
  ): string {

    switch (
      type
    ) {

      case 'membership':
        return 'Membership';

      case 'pt_package':
        return 'PT Package';

      case 'retail':
        return 'Retail';

      case 'other':
        return 'Other';

      default:
        return type;

    }

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusClass(
    status: InvoiceStatus
  ): string {

    return status;

  }


  // =====================================================
  // MEMBER DISPLAY
  // =====================================================

  getMemberDisplay(
    memberId:
      number | null
  ): string {

    if (!memberId) {

      return '-';

    }


    return `Member #${memberId}`;

  }


  // =====================================================
  // CAN RECORD PAYMENT
  // =====================================================

  canRecordPayment(
    invoice: Invoice
  ): boolean {

    return (

      invoice.status ===
        'pending'

      ||

      invoice.status ===
        'partial'

    );

  }

}