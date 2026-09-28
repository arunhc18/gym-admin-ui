import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  Observable
} from 'rxjs';


export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Converted'
  | 'Lost';


export interface Enquiry {

  enquiryId: number;

  name: string;

  phone: string;

  email: string;

  interestedPlan: string;

  source: string;

  enquiryDate: string;

  followUpDate: string;

  status:
    EnquiryStatus;

  notes: string;

}


export type CreateEnquiry =

  Omit<
    Enquiry,
    | 'enquiryId'
    | 'enquiryDate'
    | 'status'
  >

  &

  Partial<
    Pick<
      Enquiry,
      | 'enquiryDate'
      | 'status'
    >
  >;


export type UpdateEnquiry =
  Partial<
    Omit<
      Enquiry,
      'enquiryId'
    >
  >;


@Injectable({
  providedIn: 'root'
})
export class EnquiryService {


  private readonly enquiriesSubject =
    new BehaviorSubject<
      Enquiry[]
    >(
      this.createDummyEnquiries(
        80
      )
    );


  readonly enquiries$:
    Observable<
      Enquiry[]
    > =

    this.enquiriesSubject
      .asObservable();


  /*
   * Existing enquiry pages can continue
   * using this synchronous snapshot.
   */
  getEnquiries():
    Enquiry[] {


    return this.enquiriesSubject
      .value
      .map(
        enquiry => ({
          ...enquiry
        })
      );

  }


  getEnquiriesObservable():
    Observable<
      Enquiry[]
    > {

    return this.enquiries$;

  }


  getEnquiryById(
    id:
      number
  ):
    Enquiry
    | undefined {


    const enquiry =
      this.enquiriesSubject
        .value
        .find(
          item =>
            item.enquiryId ===
            id
        );


    return enquiry

      ? {
          ...enquiry
        }

      : undefined;

  }


  createEnquiry(
    enquiry:
      CreateEnquiry
  ):
    Enquiry {


    const enquiries =
      this.enquiriesSubject
        .value;


    const nextId =

      enquiries.length

        ? Math.max(
            ...enquiries.map(
              item =>
                item.enquiryId
            )
          ) + 1

        : 1;


    const created:
      Enquiry = {

      ...enquiry,

      enquiryId:
        nextId,

      enquiryDate:
        enquiry.enquiryDate
        ??
        this.today(),

      status:
        enquiry.status
        ??
        'New'

    };


    this.enquiriesSubject
      .next([

        created,

        ...enquiries

      ]);


    return {
      ...created
    };

  }


  updateEnquiry(
    id:
      number,

    changes:
      UpdateEnquiry
  ):
    Enquiry
    | undefined {


    const enquiries =
      this.enquiriesSubject
        .value;


    const index =
      enquiries.findIndex(
        item =>
          item.enquiryId ===
          id
      );


    if (
      index ===
      -1
    ) {

      return undefined;

    }


    const updated =
      [...enquiries];


    updated[index] = {

      ...updated[index],

      ...changes,

      enquiryId:
        id

    };


    this.enquiriesSubject
      .next(
        updated
      );


    return {
      ...updated[index]
    };

  }


  private createDummyEnquiries(
    count:
      number
  ):
    Enquiry[] {


    const names = [

      'Aarav Mehta',
      'Diya Shah',
      'Kabir Rao',
      'Meera Nair',
      'Rohan Das',
      'Isha Kapoor',
      'Aditya Menon',
      'Nisha Kumar'

    ];


    const plans = [

      'Monthly',
      'Quarterly',
      'Gold Annual',
      'Premium Annual'

    ];


    const sources = [

      'Website',
      'Walk-in',
      'Instagram',
      'Referral',
      'Google',
      'Other'

    ];


    const statuses:
      EnquiryStatus[] = [

      'New',
      'Contacted',
      'Follow-up',
      'Converted',
      'Lost'

    ];


    return Array.from(
      {
        length:
          count
      },
      (
        _,
        index
      ) => {


        const name =
          names[
            index %
            names.length
          ];


        const date =
          new Date();


        date.setDate(
          date.getDate() -
          (
            index %
            45
          )
        );


        const followUp =
          new Date(
            date
          );


        followUp.setDate(

          followUp.getDate()

          +

          (
            (
              index %
              7
            )

            +

            1
          )

        );


        return {

          enquiryId:
            index + 1,

          name,

          phone:
            `98${String(
              76543210 +
              index
            ).slice(-8)}`,

          email:

            `${name
              .toLowerCase()
              .replace(
                ' ',
                '.'
              )}@example.com`,

          interestedPlan:
            plans[
              index %
              plans.length
            ],

          source:
            sources[
              index %
              sources.length
            ],

          enquiryDate:
            this.toDate(
              date
            ),

          followUpDate:

            index %
              3 ===
            0

              ? this.toDate(
                  followUp
                )

              : '',

          status:
            statuses[
              index %
              statuses.length
            ],

          notes:

            index %
              4 ===
            0

              ? 'Requested a weekday morning callback.'

              : ''

        };

      }
    );

  }


  private today():
    string {


    return this.toDate(
      new Date()
    );

  }


  private toDate(
    date:
      Date
  ):
    string {


    return [

      date.getFullYear(),

      String(
        date.getMonth() +
        1
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

}