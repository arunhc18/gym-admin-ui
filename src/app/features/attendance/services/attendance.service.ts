import {
  Injectable
} from '@angular/core';

import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  shareReplay,
  tap
} from 'rxjs';

import {
  MemberService
} from '../../members/services/member.service';

import {
  StaffService
} from '../../staff/services/staff.service';


export type AttendancePersonType =
  | 'member'
  | 'staff';


export type AttendanceRecordStatus =
  | 'present'
  | 'absent';


export interface AttendancePerson {

  id: string;

  sourceId: number;

  code: string;

  name: string;

  type:
    AttendancePersonType;

  detail: string;

  location: string;

  startDate: string;

  endDate:
    string | null;

  isActive: boolean;

}


export interface AttendanceRecord {

  personId: string;

  date: string;

  status:
    AttendanceRecordStatus;

  checkIn:
    string | null;

  checkOut:
    string | null;

  notes:
    string | null;

}


@Injectable({
  providedIn: 'root'
})
export class AttendanceService {


  private readonly attendanceSubject =
    new BehaviorSubject<
      AttendanceRecord[]
    >([]);


  readonly attendance$ =
    this.attendanceSubject
      .asObservable();


  readonly people$:
    Observable<
      AttendancePerson[]
    >;


  constructor(

    private readonly memberService:
      MemberService,

    private readonly staffService:
      StaffService

  ) {


    /*
     * IMPORTANT:
     *
     * people$ is initialized here rather than
     * as a class field.
     *
     * This guarantees memberService and staffService
     * already exist.
     */

    this.people$ =
      combineLatest([

        this.memberService
          .getMembers(),

        this.staffService
          .getStaff()

      ])
        .pipe(

          map(
            ([
              members,
              staff
            ]) => {


              const memberPeople:
                AttendancePerson[] =

                members.map(
                  member => {


                    const status =
                      member.status
                        .toLowerCase();


                    return {

                      id:
                        `member:${member.memberId}`,

                      sourceId:
                        member.memberId,

                      code:
                        member.memberCode,

                      name:
                        `${member.firstName} ${member.lastName}`,

                      type:
                        'member',

                      detail:
                        member.planName,

                      location:
                        member.locationName
                        ||
                        member.location,

                      startDate:
                        member.joinedDate
                        ||
                        member.joinDate,

                      endDate:
                        member.expiryDate
                        ||
                        null,

                      isActive:
                        status !== 'expired'
                        &&
                        status !== 'inactive'

                    };

                  }
                );


              const staffPeople:
                AttendancePerson[] =

                staff.map(
                  item => ({

                    id:
                      `staff:${item.staffId}`,

                    sourceId:
                      item.staffId,

                    code:
                      item.staffCode,

                    name:
                      `${item.firstName} ${item.lastName}`,

                    type:
                      'staff',

                    detail:
                      item.role,

                    location:
                      item.location,

                    startDate:
                      item.joinedDate,

                    endDate:
                      null,

                    isActive:
                      item.status !== 'Inactive'

                  })
                );


              return [

                ...memberPeople,

                ...staffPeople

              ];

            }
          ),

          tap(
            people => {

              this.ensureAttendanceData(
                people
              );

            }
          ),

          shareReplay({
            bufferSize: 1,
            refCount: true
          })

        );

  }


  getPeople():
    Observable<
      AttendancePerson[]
    > {

    return this.people$;

  }


  getAttendance():
    Observable<
      AttendanceRecord[]
    > {

    return this.attendance$;

  }


  getAttendanceSnapshot():
    AttendanceRecord[] {

    return [
      ...this.attendanceSubject
        .value
    ];

  }


  getRecord(
    personId: string,
    date: string
  ):
    AttendanceRecord
    | undefined {


    return this.attendanceSubject
      .value
      .find(
        record =>

          record.personId ===
            personId

          &&

          record.date ===
            date
      );

  }


  saveAttendance(
    record:
      AttendanceRecord
  ): void {


    const records =
      this.attendanceSubject
        .value;


    const index =
      records.findIndex(
        item =>

          item.personId ===
            record.personId

          &&

          item.date ===
            record.date
      );


    if (
      index === -1
    ) {

      this.attendanceSubject
        .next([

          ...records,

          record

        ]);

      return;

    }


    const updated =
      [...records];


    updated[index] =
      record;


    this.attendanceSubject
      .next(
        updated
      );

  }


  private ensureAttendanceData(
    people:
      AttendancePerson[]
  ): void {


    const existing =
      this.attendanceSubject
        .value;


    const existingKeys =
      new Set(
        existing.map(
          record =>
            `${record.personId}|${record.date}`
        )
      );


    const newRecords:
      AttendanceRecord[] =
      [];


    const today =
      this.startOfDay(
        new Date()
      );


    for (
      let monthOffset = 0;
      monthOffset <= 6;
      monthOffset++
    ) {


      const monthDate =
        new Date(

          today.getFullYear(),

          today.getMonth() -
          monthOffset,

          1

        );


      const year =
        monthDate.getFullYear();


      const month =
        monthDate.getMonth();


      const totalDays =
        new Date(
          year,
          month + 1,
          0
        )
          .getDate();


      for (
        let dayNumber = 1;
        dayNumber <= totalDays;
        dayNumber++
      ) {


        const date =
          new Date(
            year,
            month,
            dayNumber
          );


        if (
          date.getTime() >
          today.getTime()
        ) {

          continue;

        }


        const dateKey =
          this.toDateKey(
            date
          );


        for (
          const person
          of people
        ) {


          if (
            person.startDate
            &&
            dateKey <
            person.startDate
          ) {

            continue;

          }


          if (
            person.type === 'member'
            &&
            person.endDate
            &&
            dateKey >
            person.endDate
          ) {

            continue;

          }


          const key =
            `${person.id}|${dateKey}`;


          if (
            existingKeys.has(
              key
            )
          ) {

            continue;

          }


          const absent =

            (
              dayNumber +
              person.sourceId +
              month
            )

            %

            9 === 0;


          newRecords.push({

            personId:
              person.id,

            date:
              dateKey,

            status:
              absent
                ? 'absent'
                : 'present',

            checkIn:

              absent

                ? null

                : person.type === 'staff'

                  ? (
                      person.sourceId % 2 === 0
                        ? '08:15'
                        : '08:00'
                    )

                  : (
                      person.sourceId % 2 === 0
                        ? '07:00'
                        : '06:30'
                    ),

            checkOut:

              absent

                ? null

                : person.type === 'staff'

                  ? '17:00'

                  : null,

            notes:
              null

          });


          existingKeys.add(
            key
          );

        }

      }

    }


    if (
      newRecords.length
    ) {

      this.attendanceSubject
        .next([

          ...existing,

          ...newRecords

        ]);

    }

  }


  private toDateKey(
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


  private startOfDay(
    source:
      Date
  ): Date {


    const date =
      new Date(
        source
      );


    date.setHours(
      0,
      0,
      0,
      0
    );


    return date;

  }

}