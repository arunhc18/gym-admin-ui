import { CommonModule } from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Subscription
} from 'rxjs';

import {
  MemberRecord,
  MemberService,
  MEMBERSHIP_PLANS,
  PAYMENT_MODES,
  PaymentMode,
  PaymentStatus
} from '../../services/member.service';


interface RenewalMember extends MemberRecord {
  daysLeft: number;
  dueAmount: number;
}


interface RenewalForm {
  newPlan: string;

  durationMonths: number;

  renewalStart: string;

  newExpiry: string;

  planAmount: number;

  discount: number;

  tax: number;

  finalAmount: number;

  paymentMode: PaymentMode | '';

  amountPaid: number;

  balance: number;

  paymentStatus: PaymentStatus;

  transactionReference: string;

  notes: string;
}


@Component({
  selector: 'app-renewals',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './renewals.html',

  styleUrl:
    './renewals.scss'
})
export class RenewalsComponent
  implements OnInit, OnDestroy {


  // =====================================================
  // DATA
  // =====================================================

  members: MemberRecord[] = [];

  renewalMembers:
    RenewalMember[] = [];

  filteredMembers:
    RenewalMember[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchText = '';

  selectedStatus = '';

  selectedPlan = '';

  selectedLocation = '';


  statuses: string[] = [];

  plans: string[] = [];

  locations: string[] = [];


  // =====================================================
  // OPTIONS
  // =====================================================

  membershipPlans =
    MEMBERSHIP_PLANS;

  paymentModes =
    PAYMENT_MODES;


  // =====================================================
  // DRAWER
  // =====================================================

  drawerOpen = false;

  selectedMember:
    RenewalMember | null = null;


  renewalForm:
    RenewalForm = {

      newPlan: '',

      durationMonths: 0,

      renewalStart: '',

      newExpiry: '',

      planAmount: 0,

      discount: 0,

      tax: 0,

      finalAmount: 0,

      paymentMode: '',

      amountPaid: 0,

      balance: 0,

      paymentStatus:
        'Pending',

      transactionReference: '',

      notes: ''
    };


  // =====================================================
  // VALIDATION
  // =====================================================

  submitted = false;


  // =====================================================
  // TOAST
  // =====================================================

  successMessage = '';

  errorMessage = '';

  private toastTimer?:
    ReturnType<typeof setTimeout>;


  // =====================================================
  // SUBSCRIPTION
  // =====================================================

  private memberSubscription?:
    Subscription;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private memberService:
      MemberService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.memberSubscription =

      this.memberService
        .getMembers()
        .subscribe({

          next: (
            members:
              MemberRecord[]
          ) => {

            this.members =
              members;

            this.buildRenewalList();

            this.buildFilters();

            this.applyFilters(
              false
            );


            /*
             * Keep drawer member synchronized
             * after BehaviorSubject update.
             */

            if (
              this.selectedMember
            ) {

              const refreshed =

                this.renewalMembers
                  .find(
                    member =>
                      member.memberId ===
                      this.selectedMember
                        ?.memberId
                  );


              if (
                refreshed
              ) {

                this.selectedMember =
                  refreshed;
              }
            }
          },

          error: error => {

            console.error(
              error
            );

            this.showError(
              'Unable to load renewal members.'
            );
          }

        });
  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    this.memberSubscription
      ?.unsubscribe();


    this.clearToastTimer();
  }


  // =====================================================
  // BUILD RENEWAL LIST
  // =====================================================

  private buildRenewalList(): void {

    this.renewalMembers =

      this.members

        .map(
          member => ({

            ...member,

            daysLeft:
              this.calculateDaysLeft(
                member.expiryDate
              ),

            dueAmount:
              this.getDueAmount(
                member
              )

          })
        )

        .filter(
          member => {

            const status =

              member.status
                ?.toLowerCase();


            /*
             * Show:
             *
             * Expired
             * Expiring
             * Outstanding balance
             */

            return (

              status ===
                'expired' ||

              status ===
                'expiring' ||

              member.dueAmount > 0

            );
          }
        )

        .sort(
          (
            a,
            b
          ) =>

            a.daysLeft -
            b.daysLeft
        );
  }


  // =====================================================
  // FILTER DATA
  // =====================================================

  private buildFilters(): void {

    this.statuses = [

      ...new Set(

        this.renewalMembers

          .map(
            member =>
              member.status
          )

          .filter(Boolean)

      )

    ].sort();


    this.plans = [

      ...new Set(

        this.members

          .map(
            member =>
              member.planName
          )

          .filter(Boolean)

      )

    ].sort();


    this.locations = [

      ...new Set(

        this.members

          .map(
            member =>
              member.locationName
          )

          .filter(Boolean)

      )

    ].sort();
  }


  // =====================================================
  // FILTER
  // =====================================================

  applyFilters(
    scrollToTop:
      boolean = true
  ): void {

    const search =

      this.searchText
        .trim()
        .toLowerCase();


    this.filteredMembers =

      this.renewalMembers
        .filter(
          member => {

            const fullName =

              `${member.firstName ?? ''} ${member.lastName ?? ''}`

                .trim()

                .toLowerCase();


            const code =

              (
                member.memberCode ??
                ''
              )
                .toLowerCase();


            const phone =

              (
                member.phone ??
                ''
              )
                .toLowerCase();


            const email =

              (
                member.email ??
                ''
              )
                .toLowerCase();


            const matchesSearch =

              !search ||

              fullName.includes(
                search
              ) ||

              code.includes(
                search
              ) ||

              phone.includes(
                search
              ) ||

              email.includes(
                search
              );


            const matchesStatus =

              !this.selectedStatus ||

              member.status
                .toLowerCase() ===

              this.selectedStatus
                .toLowerCase();


            const matchesPlan =

              !this.selectedPlan ||

              member.planName ===
                this.selectedPlan;


            const matchesLocation =

              !this.selectedLocation ||

              member.locationName ===
                this.selectedLocation;


            return (

              matchesSearch &&

              matchesStatus &&

              matchesPlan &&

              matchesLocation

            );
          }
        );


    if (
      scrollToTop
    ) {

      setTimeout(
        () => {

          document
            .querySelector(
              '.renewal-table-scroll'
            )
            ?.scrollTo({

              top: 0,

              behavior:
                'smooth'

            });

        },

        0
      );
    }
  }


  // =====================================================
  // CLEAR FILTER
  // =====================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = '';

    this.selectedPlan = '';

    this.selectedLocation = '';


    this.applyFilters();
  }


  // =====================================================
  // OPEN DRAWER
  // =====================================================

  openRenewal(
    member:
      RenewalMember
  ): void {

    this.selectedMember =
      member;

    this.drawerOpen =
      true;

    this.submitted =
      false;


    const renewalStart =

      this.calculateRenewalStart(
        member
      );


    const planAmount =

      this.memberService
        .getMembershipAmount(
          member.planName
        ) ?? 0;


    const duration =

      this.memberService
        .getPlanDuration(
          member.planName
        );


    this.renewalForm = {

      newPlan:
        member.planName,

      durationMonths:
        duration,

      renewalStart,

      newExpiry:

        this.memberService
          .calculateExpiryDate(
            renewalStart,
            duration
          ),

      planAmount,

      discount: 0,

      tax: 0,

      finalAmount:
        planAmount,

      paymentMode: '',

      amountPaid:
        planAmount,

      balance: 0,

      paymentStatus:
        'Paid',

      transactionReference: '',

      notes: ''
    };


    this.recalculateTotals();
  }


  // =====================================================
  // CLOSE DRAWER
  // =====================================================

  closeRenewalDrawer(): void {

    this.drawerOpen =
      false;

    this.selectedMember =
      null;

    this.submitted =
      false;
  }


  // =====================================================
  // PLAN CHANGE
  // =====================================================

  onPlanChange(): void {

    const planName =

      this.renewalForm
        .newPlan;


    const duration =

      this.memberService
        .getPlanDuration(
          planName
        );


    const planAmount =

      this.memberService
        .getMembershipAmount(
          planName
        ) ?? 0;


    this.renewalForm
      .durationMonths =
      duration;


    this.renewalForm
      .planAmount =
      planAmount;


    this.renewalForm
      .newExpiry =

      this.memberService
        .calculateExpiryDate(

          this.renewalForm
            .renewalStart,

          duration

        );


    /*
     * Default to full payment
     * whenever plan changes.
     */

    this.renewalForm
      .amountPaid =
      this.getFinalAmount();


    this.recalculateTotals();
  }


  // =====================================================
  // RENEWAL START CHANGE
  // =====================================================

  onRenewalStartChange(): void {

    if (
      !this.renewalForm
        .renewalStart
    ) {

      this.renewalForm
        .newExpiry =
        '';

      return;
    }


    this.renewalForm
      .newExpiry =

      this.memberService
        .calculateExpiryDate(

          this.renewalForm
            .renewalStart,

          this.renewalForm
            .durationMonths

        );
  }


  // =====================================================
  // RECALCULATE TOTALS
  // =====================================================

  recalculateTotals(): void {

    const planAmount =

      Number(
        this.renewalForm
          .planAmount
      ) || 0;


    let discount =

      Number(
        this.renewalForm
          .discount
      ) || 0;


    let tax =

      Number(
        this.renewalForm
          .tax
      ) || 0;


    let amountPaid =

      Number(
        this.renewalForm
          .amountPaid
      ) || 0;


    discount =

      Math.max(
        0,
        Math.min(
          discount,
          planAmount
        )
      );


    tax =
      Math.max(
        0,
        tax
      );


    const finalAmount =

      Math.max(

        0,

        planAmount -
        discount +
        tax

      );


    amountPaid =

      Math.max(
        0,
        Math.min(
          amountPaid,
          finalAmount
        )
      );


    const balance =

      Math.max(

        0,

        finalAmount -
        amountPaid

      );


    let paymentStatus:
      PaymentStatus;


    if (
      amountPaid === 0
    ) {

      paymentStatus =
        'Pending';

    } else if (
      balance > 0
    ) {

      paymentStatus =
        'Partial';

    } else {

      paymentStatus =
        'Paid';
    }


    this.renewalForm = {

      ...this.renewalForm,

      discount,

      tax,

      finalAmount,

      amountPaid,

      balance,

      paymentStatus

    };
  }


  // =====================================================
  // FINAL AMOUNT
  // =====================================================

  getFinalAmount(): number {

    return Math.max(

      0,

      (
        Number(
          this.renewalForm
            .planAmount
        ) || 0
      )

      -

      (
        Number(
          this.renewalForm
            .discount
        ) || 0
      )

      +

      (
        Number(
          this.renewalForm
            .tax
        ) || 0
      )

    );
  }


  // =====================================================
  // VALIDATION
  // =====================================================

  get planInvalid():
    boolean {

    return (

      this.submitted &&

      !this.renewalForm
        .newPlan

    );
  }


  get paymentModeInvalid():
    boolean {

    return (

      this.submitted &&

      !this.renewalForm
        .paymentMode

    );
  }


  get renewalStartInvalid():
    boolean {

    return (

      this.submitted &&

      !this.renewalForm
        .renewalStart

    );
  }


  get amountPaidInvalid():
    boolean {

    return (

      this.submitted &&

      (
        this.renewalForm
          .amountPaid < 0 ||

        this.renewalForm
          .amountPaid >

        this.renewalForm
          .finalAmount
      )

    );
  }


  // =====================================================
  // COMPLETE RENEWAL
  // =====================================================

  renewMembership(): void {

    this.submitted =
      true;


    this.recalculateTotals();


    if (
      this.planInvalid ||

      this.paymentModeInvalid ||

      this.renewalStartInvalid ||

      this.amountPaidInvalid ||

      !this.selectedMember
    ) {

      this.showError(
        'Please complete the required renewal details.'
      );

      return;
    }


    const member =

      this.selectedMember;


    const updatedMember =

      this.memberService
        .updateMember(

          member.memberId,

          {

            planName:
              this.renewalForm
                .newPlan,

            planDurationMonths:
              this.renewalForm
                .durationMonths,

            joinedDate:
              this.renewalForm
                .renewalStart,

            joinDate:
              this.renewalForm
                .renewalStart,

            expiryDate:
              this.renewalForm
                .newExpiry,

            /*
             * Plan amount stays the
             * official plan value.
             */

            membershipAmount:
              this.renewalForm
                .planAmount,

            amountPaid:
              this.renewalForm
                .amountPaid,

            balanceAmount:
              this.renewalForm
                .balance,

            paymentMode:
              this.renewalForm
                .paymentMode as
                PaymentMode,

            paymentStatus:
              this.renewalForm
                .paymentStatus,

            status:
              'Active'

          }

        );


    if (
      !updatedMember
    ) {

      this.showError(
        'Membership renewal could not be completed.'
      );

      return;
    }


    /*
     * Later, when backend is added:
     *
     * 1. POST membership renewal
     * 2. POST payment
     * 3. POST membership history
     */


    this.closeRenewalDrawer();


    this.showSuccess(

      `${updatedMember.firstName} ${updatedMember.lastName}'s membership renewed successfully.`

    );
  }


  // =====================================================
  // RENEWAL START
  // =====================================================

  private calculateRenewalStart(
    member:
      RenewalMember
  ): string {

    const today =
      this.getTodayString();


    if (
      !member.expiryDate
    ) {

      return today;
    }


    const expiry =

      this.parseDateOnly(
        member.expiryDate
      );


    const currentDate =

      this.parseDateOnly(
        today
      );


    /*
     * Active membership:
     *
     * start new membership the
     * day after existing expiry.
     */

    if (
      expiry >=
      currentDate
    ) {

      expiry.setDate(
        expiry.getDate() + 1
      );


      return this.formatDate(
        expiry
      );
    }


    /*
     * Already expired:
     *
     * new membership starts today.
     */

    return today;
  }


  // =====================================================
  // DAYS LEFT
  // =====================================================

  private calculateDaysLeft(
    expiryDate:
      string | undefined
  ): number {

    if (
      !expiryDate
    ) {

      return 0;
    }


    const today =

      this.parseDateOnly(
        this.getTodayString()
      );


    const expiry =

      this.parseDateOnly(
        expiryDate
      );


    const day =

      1000 *
      60 *
      60 *
      24;


    return Math.ceil(

      (
        expiry.getTime() -
        today.getTime()
      )

      /
      day

    );
  }


  // =====================================================
  // DUE
  // =====================================================

  private getDueAmount(
    member:
      MemberRecord
  ): number {

    if (
      member.balanceAmount !==
        undefined &&

      member.balanceAmount !==
        null
    ) {

      return member
        .balanceAmount;
    }


    const amount =

      member.membershipAmount ??

      this.memberService
        .getMembershipAmount(
          member.planName
        ) ??

      0;


    const paid =

      member.amountPaid ??
      0;


    return Math.max(

      0,

      amount -
      paid

    );
  }


  // =====================================================
  // STATUS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {

    switch (
      status
        ?.toLowerCase()
    ) {

      case 'active':

        return 'active';


      case 'expiring':

        return 'expiring';


      case 'expired':

        return 'expired';


      default:

        return 'default';
    }
  }


  // =====================================================
  // DAYS CLASS
  // =====================================================

  getDaysClass(
    days: number
  ): string {

    if (
      days < 0
    ) {

      return 'expired';
    }


    if (
      days <= 30
    ) {

      return 'warning';
    }


    return 'normal';
  }


  // =====================================================
  // INITIALS
  // =====================================================

  getInitials(
    member:
      MemberRecord
  ): string {

    return (

      (
        member.firstName
          ?.charAt(0) ??
        ''
      )

      +

      (
        member.lastName
          ?.charAt(0) ??
        ''
      )

    ).toUpperCase();
  }


  // =====================================================
  // FULL NAME
  // =====================================================

  getFullName(
    member:
      MemberRecord
  ): string {

    return [

      member.firstName,

      member.lastName

    ]
      .filter(Boolean)
      .join(' ');
  }


  // =====================================================
  // DATE HELPERS
  // =====================================================

  private getTodayString():
    string {

    return this.formatDate(
      new Date()
    );
  }


  private parseDateOnly(
    date:
      string
  ): Date {

    const [
      year,
      month,
      day
    ] =

      date
        .split('-')
        .map(Number);


    return new Date(

      year,

      month - 1,

      day

    );
  }


  private formatDate(
    date:
      Date
  ): string {

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


  // =====================================================
  // TOAST
  // =====================================================

  private showSuccess(
    message: string
  ): void {

    this.clearToastTimer();


    this.errorMessage = '';

    this.successMessage =
      message;


    this.toastTimer =
      setTimeout(
        () => {

          this.successMessage =
            '';

          this.toastTimer =
            undefined;

        },

        2500
      );
  }


  private showError(
    message: string
  ): void {

    this.clearToastTimer();


    this.successMessage = '';

    this.errorMessage =
      message;


    this.toastTimer =
      setTimeout(
        () => {

          this.errorMessage =
            '';

          this.toastTimer =
            undefined;

        },

        2500
      );
  }


  closeToast(): void {

    this.successMessage = '';

    this.errorMessage = '';

    this.clearToastTimer();
  }


  private clearToastTimer():
    void {

    if (
      this.toastTimer
    ) {

      clearTimeout(
        this.toastTimer
      );


      this.toastTimer =
        undefined;
    }
  }
}