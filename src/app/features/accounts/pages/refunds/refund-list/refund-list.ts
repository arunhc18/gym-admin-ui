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
  RefundView
} from '../../../models/refund.model';

import {
  RefundService
} from '../../../services/refund.service';


@Component({
  selector:
    'app-refund-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './refund-list.html',

  styleUrl:
    './refund-list.scss'
})
export class RefundListComponent
  implements OnInit {


  readonly tenantId = 1;


  refunds:
    RefundView[] = [];


  filteredRefunds:
    RefundView[] = [];


  searchText = '';

  selectedStatus = '';


  constructor(

    private readonly refundService:
      RefundService,

    private readonly router:
      Router

  ) {}


  ngOnInit(): void {

    this.loadRefunds();

  }


  loadRefunds(): void {

    this.refundService
      .getRefunds(
        this.tenantId
      )
      .subscribe(
        refunds => {

          this.refunds =
            refunds;

          this.applyFilters();

        }
      );

  }


  applyFilters(): void {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    this.filteredRefunds =
      this.refunds.filter(
        refund => {


          const matchesSearch =

            !search

            ||

            refund.paymentNumber
              .toLowerCase()
              .includes(
                search
              )

            ||

            refund.invoiceNumber
              .toLowerCase()
              .includes(
                search
              )

            ||

            (
              refund.refundReason
              ?? ''
            )
              .toLowerCase()
              .includes(
                search
              );


          const matchesStatus =

            !this.selectedStatus

            ||

            refund.refundStatus ===
              this.selectedStatus;


          return (

            matchesSearch

            &&

            matchesStatus

          );

        }
      );

  }


  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.applyFilters();

  }


  goToPayments(): void {

    this.router.navigate([
      '/accounts/payments'
    ]);

  }


  openInvoice(
    refund:
      RefundView
  ): void {


    if (
      !refund.invoiceId
    ) {

      return;

    }


    this.router.navigate([

      '/accounts/invoices',

      refund.invoiceId

    ]);

  }


  get totalRefunded():
    number {

    return this.filteredRefunds

      .filter(
        refund =>
          refund.refundStatus ===
          'processed'
      )

      .reduce(
        (
          total,
          refund
        ) =>

          total +
          refund.refundAmount,

        0
      );

  }

}