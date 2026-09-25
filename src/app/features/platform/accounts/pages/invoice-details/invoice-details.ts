import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Invoice,
  InvoiceItem
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
  selector:
    'app-platform-invoice-details',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './invoice-details.html',

  styleUrl:
    './invoice-details.scss'
})
export class InvoiceDetailsComponent
  implements OnInit {


  invoice?:
    Invoice;


  invoiceItems:
    InvoiceItem[] = [];


  tenant?:
    Tenant;


  invoiceId = 0;


  constructor(

    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly accountsService:
      AccountsService,

    private readonly tenantService:
      TenantService

  ) {}


  ngOnInit(): void {


    this.invoiceId =
      Number(
        this.route.snapshot
          .paramMap
          .get('id')
      );


    if (
      !this.invoiceId ||
      Number.isNaN(
        this.invoiceId
      )
    ) {

      this.goBack();

      return;

    }


    this.invoice =
      this.accountsService
        .getInvoiceById(
          this.invoiceId
        );


    if (!this.invoice) {

      this.goBack();

      return;

    }


    this.invoiceItems =
      this.accountsService
        .getInvoiceItemsByInvoiceId(
          this.invoiceId
        );


    this.tenantService
      .getTenantById(
        this.invoice.tenantId
      )
      .subscribe(
        tenant => {

          this.tenant =
            tenant;

        }
      );


    const shouldPrint =
      this.route.snapshot
        .queryParamMap
        .get('print') ===
      'true';


    if (shouldPrint) {

      window.setTimeout(
        () =>
          this.printInvoice(),
        250
      );

    }

  }


  // =====================================================
  // BACK
  // =====================================================

  goBack(): void {

    this.router.navigate([
      '/platform/accounts/invoices'
    ]);

  }


  // =====================================================
  // PRINT
  // =====================================================

  printInvoice(): void {

    window.print();

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusClass(): string {

    return (
      this.invoice
        ?.status
        ?.toLowerCase()

      ??

      ''
    );

  }


  // =====================================================
  // TYPE LABEL
  // =====================================================

  getInvoiceTypeLabel(): string {

    if (!this.invoice) {

      return '';

    }


    return this.invoice
      .invoiceType
      .replace(
        '_',
        ' '
      )
      .replace(
        /\b\w/g,
        (value: string) =>
          value.toUpperCase()
      );

  }


  // =====================================================
  // ITEM TYPE
  // =====================================================

  getItemTypeLabel(
    itemType:
      string | null | undefined
  ): string {

    if (!itemType) {

      return '-';

    }


    return itemType
      .replace(
        '_',
        ' '
      )
      .replace(
        /\b\w/g,
        (value: string) =>
          value.toUpperCase()
      );

  }

}