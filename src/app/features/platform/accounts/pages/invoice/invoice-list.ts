import { CommonModule } from '@angular/common';

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
  Invoice
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
  selector: 'app-platform-invoice-list',

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


  invoices: Invoice[] = [];

  filteredInvoices: Invoice[] = [];

  tenants: Tenant[] = [];


  searchText = '';

  selectedTenant = '';

  selectedStatus = '';

  selectedType = '';


  constructor(

    private readonly accountsService:
      AccountsService,

    private readonly tenantService:
      TenantService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {


    this.tenantService
      .getTenants()
      .subscribe(
        tenants => {

          this.tenants =
            tenants;

          this.applyFilters();

        }
      );


    this.accountsService
      .getInvoices()
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
      this.invoices.filter(
        invoice => {


          const tenantName =
            this.getTenantName(
              invoice.tenantId
            )
              .toLowerCase();


          const matchesSearch =

            !search ||

            invoice.invoiceNumber
              .toLowerCase()
              .includes(search) ||

            tenantName.includes(
              search
            ) ||

            String(
              invoice.memberId ??
              ''
            )
              .includes(
                search
              );


          const matchesTenant =

            !this.selectedTenant ||

            invoice.tenantId ===
              Number(
                this.selectedTenant
              );


          const matchesStatus =

            !this.selectedStatus ||

            invoice.status ===
              this.selectedStatus;


          const matchesType =

            !this.selectedType ||

            invoice.invoiceType ===
              this.selectedType;


          return (

            matchesSearch &&

            matchesTenant &&

            matchesStatus &&

            matchesType

          );

        }
      );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedTenant = '';

    this.selectedStatus = '';

    this.selectedType = '';

    this.applyFilters();

  }


  // =====================================================
  // GO TO PAYMENTS
  // =====================================================

  goToPayments(): void {

    this.router.navigate([
      '/platform/accounts/payments'
    ]);

  }


  // =====================================================
  // TENANT
  // =====================================================

  getTenantName(
    tenantId: number
  ): string {

    return (

      this.tenants.find(
        tenant =>
          tenant.tenantId ===
          tenantId
      )?.tenantName

      ??

      `Tenant #${tenantId}`

    );

  }


  // =====================================================
  // TYPE
  // =====================================================

  getTypeLabel(
    type: string
  ): string {

    return type

      .replace(
        '_',
        ' '
      )

      .replace(
        /\b\w/g,
        value =>
          value.toUpperCase()
      );

  }


  // =====================================================
  // STATUS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase();

  }

  // =====================================================
// VIEW INVOICE
// =====================================================

viewInvoice(
  invoice: Invoice
): void {

  this.router.navigate([
    '/platform/accounts/invoices',
    invoice.invoiceId
  ]);

}


// =====================================================
// PRINT INVOICE
// =====================================================

printInvoice(
  event: Event,
  invoice: Invoice
): void {

  event.stopPropagation();


  this.router.navigate(
    [
      '/platform/accounts/invoices',
      invoice.invoiceId
    ],
    {
      queryParams: {
        print: true
      }
    }
  );

}

}