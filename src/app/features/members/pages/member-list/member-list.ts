import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Member,
  MemberService
} from '../../services/member.service';


@Component({
  selector: 'app-member-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './member-list.html',

  // IMPORTANT:
  // Keep this .scss if your file is members-list.scss.
  // If yours is members-list.css, change it to:
  // styleUrl: './members-list.css'

  styleUrl:
    './member-list.scss'
})
export class MembersListComponent
  implements OnInit {


  // =====================================================
  // ALL MEMBERS
  // =====================================================

  members: Member[] = [];


  // =====================================================
  // FILTERED MEMBERS
  //
  // Your HTML loops through this collection.
  // This allows all matching members to be available
  // inside your scrollable grid.
  // =====================================================

  filteredMembers: Member[] = [];


  // =====================================================
  // FILTER VALUES
  // =====================================================

  searchText = '';

  selectedStatus = '';

  selectedPlan = '';

  selectedLocation = '';


  // =====================================================
  // FILTER DROPDOWN DATA
  // =====================================================

  statuses: string[] = [];

  plans: string[] = [];

  locations: string[] = [];


  // =====================================================
  // LOADING
  // =====================================================

  loading = true;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(

    private memberService:
      MemberService,

    private router:
      Router,

    private route:
      ActivatedRoute

  ) {}


  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {


    // ===============================================
    // LISTEN FOR MEMBERS
    // ===============================================

    this.memberService
      .getMembers()
      .subscribe({

        next: (
          members: Member[]
        ) => {

          this.members =
            members;


          this.prepareFilters();


          /*
            Apply current filters after member data
            arrives.

            This is important when opening:

            /members?status=Active
            /members?status=Expiring
            /members?status=Expired
          */

          this.applyFilters(
            false
          );


          this.loading = false;
        },


        error: error => {

          console.error(
            'Error loading members:',
            error
          );


          this.members = [];

          this.filteredMembers = [];

          this.loading = false;
        }

      });


    // ===============================================
    // LISTEN TO DASHBOARD STATUS FILTER
    // ===============================================

    this.route.queryParamMap
      .subscribe(
        params => {

          const status =
            params.get(
              'status'
            );


          this.selectedStatus =
            status ?? '';


          /*
            If members have already loaded,
            update immediately.
          */

          if (
            this.members.length >
            0
          ) {

            this.applyFilters(
              true
            );
          }

        }
      );
  }


  // =====================================================
  // PREPARE FILTER VALUES
  // =====================================================

  private prepareFilters(): void {


    // STATUS

    this.statuses = [

      ...new Set(

        this.members

          .map(
            member =>
              member.status
          )

          .filter(
            Boolean
          )

      )

    ].sort();


    // PLANS

    this.plans = [

      ...new Set(

        this.members

          .map(
            member =>
              member.planName
          )

          .filter(
            Boolean
          )

      )

    ].sort();


    // LOCATIONS

    this.locations = [

      ...new Set(

        this.members

          .map(
            member =>
              member.locationName
          )

          .filter(
            Boolean
          )

      )

    ].sort();
  }


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  applyFilters(
    scrollToTop: boolean = true
  ): void {


    const search =
      this.searchText

        .trim()

        .toLowerCase();


    this.filteredMembers =
      this.members.filter(
        member => {


          // =============================================
          // FULL NAME
          // =============================================

          const fullName =

            `${member.firstName ?? ''} ${member.lastName ?? ''}`

              .trim()

              .toLowerCase();


          // =============================================
          // MEMBER CODE
          // =============================================

          const memberCode =

            (
              member.memberCode ??
              ''
            )

              .toLowerCase();


          // =============================================
          // PHONE
          // =============================================

          const phone =

            (
              member.phone ??
              ''
            )

              .toLowerCase();


          // =============================================
          // EMAIL
          // =============================================

          const email =

            (
              member.email ??
              ''
            )

              .toLowerCase();


          // =============================================
          // SEARCH MATCH
          // =============================================

          const matchesSearch =

            !search ||

            fullName.includes(
              search
            ) ||

            memberCode.includes(
              search
            ) ||

            phone.includes(
              search
            ) ||

            email.includes(
              search
            );


          // =============================================
          // STATUS MATCH
          // =============================================

          const matchesStatus =

            !this.selectedStatus ||

            member.status
              .toLowerCase() ===

            this.selectedStatus
              .toLowerCase();


          // =============================================
          // PLAN MATCH
          // =============================================

          const matchesPlan =

            !this.selectedPlan ||

            member.planName
              .toLowerCase() ===

            this.selectedPlan
              .toLowerCase();


          // =============================================
          // LOCATION MATCH
          // =============================================

          const matchesLocation =

            !this.selectedLocation ||

            member.locationName
              .toLowerCase() ===

            this.selectedLocation
              .toLowerCase();


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

      this.scrollTableToTop();
    }
  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {


    this.searchText = '';


    this.selectedStatus = '';


    this.selectedPlan = '';


    this.selectedLocation = '';


    /*
      Remove:

      ?status=Active
      ?status=Expiring
      ?status=Expired

      from URL.
    */

    this.router.navigate(
      [],
      {

        relativeTo:
          this.route,

        queryParams:
          {},

        replaceUrl:
          true

      }
    );


    this.filteredMembers = [
      ...this.members
    ];


    this.scrollTableToTop();
  }


  // =====================================================
  // RETURN TO DASHBOARD
  // =====================================================

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }


  // =====================================================
  // CLICK MEMBER ROW
  // =====================================================

  openMemberDetails(
    member: Member
  ): void {


    if (
      member.memberId ===
        null ||

      member.memberId ===
        undefined
    ) {

      return;
    }


    this.router.navigate([
      '/members',
      member.memberId
    ]);
  }


  // =====================================================
  // FULL NAME
  // =====================================================

  getFullName(
    member: Member
  ): string {


    return [

      member.firstName,

      member.lastName

    ]

      .filter(
        Boolean
      )

      .join(' ');
  }


  // =====================================================
  // INITIALS
  // =====================================================

  getInitials(
    member: Member
  ): string {


    const firstInitial =

      member.firstName
        ?.charAt(0) ??
      '';


    const lastInitial =

      member.lastName
        ?.charAt(0) ??
      '';


    return (

      firstInitial +

      lastInitial

    ).toUpperCase();
  }


  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  getStatusClass(
    status: string
  ): string {


    switch (
      status
        .toLowerCase()
    ) {


      case 'active':

        return 'active';


      case 'expiring':

        return 'expiring';


      case 'expired':

        return 'expired';


      case 'inactive':

        return 'inactive';


      case 'suspended':

        return 'suspended';


      default:

        return 'default';

    }
  }


  // =====================================================
  // SCROLL TABLE TO TOP
  // =====================================================

  private scrollTableToTop(): void {


    setTimeout(
      () => {


        const container =

          document
            .querySelector(
              '.members-table-scroll'
            );


        if (
          container
        ) {


          container.scrollTo({

            top: 0,

            behavior:
              'smooth'

          });

        }

      },

      0
    );
  }
}