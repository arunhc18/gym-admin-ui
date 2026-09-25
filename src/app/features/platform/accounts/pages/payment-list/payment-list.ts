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
  Payment,
  PaymentMethod,
  ReminderChannel
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
  selector: 'app-platform-payment-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './payment-list.html',

  styleUrl:
    './payment-list.scss'
})
export class PaymentListComponent
  implements OnInit {


  payments: Payment[] = [];

  filteredPayments: Payment[] = [];

  tenants: Tenant[] = [];

  paymentMethods:
    PaymentMethod[] = [];


  searchText = '';

  selectedTenant = '';

  selectedStatus = '';

  selectedMethod = '';


  toastMessage = '';

  toastType:
    'success' | 'error' =
    'success';


  private toastTimer?: number;


  constructor(

    private readonly accountsService:
      AccountsService,

    private readonly tenantService:
      TenantService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {


    // LOAD TENANTS
    this.tenantService
      .getTenants()
      .subscribe(
        tenants => {

          this.tenants =
            tenants;

          this.applyFilters();

        }
      );


    // LOAD PAYMENT METHODS
    this.accountsService
      .getPaymentMethods()
      .subscribe(
        methods => {

          this.paymentMethods =
            methods;

          this.applyFilters();

        }
      );


    // LOAD PAYMENTS
    this.accountsService
      .getPayments()
      .subscribe(
        payments => {

          this.payments =
            payments;

          this.applyFilters();

        }
      );

  }


  // =====================================================
  // FILTER PAYMENTS
  // =====================================================

  applyFilters(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredPayments =
      this.payments.filter(
        payment => {


          const tenantName =
            this.getTenantName(
              payment.tenantId
            )
              .toLowerCase();


          const paymentMethod =
            this.getPaymentMethodName(
              payment.paymentMethodId
            )
              .toLowerCase();


          const matchesSearch =

            !search ||

            payment.paymentNumber
              .toLowerCase()
              .includes(search) ||

            (
              payment.transactionId ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            (
              payment.referenceNumber ??
              ''
            )
              .toLowerCase()
              .includes(search) ||

            tenantName.includes(
              search
            ) ||

            paymentMethod.includes(
              search
            ) ||

            String(
              payment.memberId ??
              ''
            ).includes(
              search
            );


          const matchesTenant =

            !this.selectedTenant ||

            payment.tenantId ===
              Number(
                this.selectedTenant
              );


          const matchesStatus =

            !this.selectedStatus ||

            payment.paymentStatus ===
              this.selectedStatus;


          const matchesMethod =

            !this.selectedMethod ||

            payment.paymentMethodId ===
              Number(
                this.selectedMethod
              );


          return (

            matchesSearch &&

            matchesTenant &&

            matchesStatus &&

            matchesMethod

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

    this.selectedMethod = '';

    this.applyFilters();

  }


  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  createPayment(): void {

    this.router.navigate([
      '/platform/accounts/payments/new'
    ]);

  }


  // =====================================================
  // GO TO INVOICES
  // =====================================================

  goToInvoices(): void {

    this.router.navigate([
      '/platform/accounts/invoices'
    ]);

  }


  // =====================================================
  // TENANT NAME
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
  // PAYMENT METHOD
  // =====================================================

  getPaymentMethodName(
    paymentMethodId: number
  ): string {

    return (

      this.paymentMethods.find(
        method =>
          method.paymentMethodId ===
          paymentMethodId
      )?.methodName

      ??

      this.accountsService
        .getPaymentMethodName(
          paymentMethodId
        )

    );

  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase();

  }


  // =====================================================
  // SEND MEMBERSHIP RENEWAL REMINDER
  // =====================================================

  sendReminder(
    event: Event,
    payment: Payment,
    channel: ReminderChannel
  ): void {

    event.stopPropagation();


    this.accountsService
      .sendRenewalReminder(
        payment.paymentId,
        channel
      )
      .subscribe(
        result => {

          this.showToast(

            result.message,

            result.success
              ? 'success'
              : 'error'

          );

        }
      );

  }


  // =====================================================
  // TOAST
  // =====================================================

  private showToast(
    message: string,
    type:
      'success' | 'error'
  ): void {

    this.toastMessage =
      message;

    this.toastType =
      type;


    if (
      this.toastTimer
    ) {

      window.clearTimeout(
        this.toastTimer
      );

    }


    this.toastTimer =
      window.setTimeout(
        () => {

          this.toastMessage = '';

        },
        3500
      );

  }

}