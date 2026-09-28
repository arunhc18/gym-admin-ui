import {
  CommonModule
} from '@angular/common';

import {
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  AttendancePerson,
  AttendancePersonType,
  AttendanceRecord,
  AttendanceService
} from '../services/attendance.service';


type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'none';


type ViewMode =
  | 'week'
  | 'month';


interface AttendanceDay {

  date: string;

  dayName: string;

  dateLabel: string;

  dayNumber: number;

  isToday: boolean;

  isFuture: boolean;

}


@Component({
  selector:
    'app-attendance-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './attendance-list.html',

  styleUrl:
    './attendance-list.scss'
})
export class AttendanceListComponent
  implements OnInit {


  private readonly destroyRef =
    inject(
      DestroyRef
    );


  viewMode:
    ViewMode =
    'week';


  people:
    AttendancePerson[] =
    [];


  attendance:
    AttendanceRecord[] =
    [];


  weekStart =
    this.getMonday(
      new Date()
    );


  weekDays:
    AttendanceDay[] =
    [];


  selectedMonth =
    this.getMonthKey(
      new Date()
    );


  monthDays:
    AttendanceDay[] =
    [];


  searchText =
    '';


  selectedType:
    AttendancePersonType | '' =
    '';


  selectedLocation =
    '';


  locations:
    string[] =
    [];


  constructor(

    private readonly attendanceService:
      AttendanceService

  ) {}


  ngOnInit():
    void {


    this.buildWeek();

    this.buildMonth();


    this.attendanceService
      .getPeople()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe(
        people => {


          this.people =
            people;


          this.locations =
            Array.from(
              new Set(
                people.map(
                  person =>
                    person.location
                )
              )
            )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.localeCompare(
                    b
                  )
              );

        }
      );


    this.attendanceService
      .getAttendance()

      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe(
        records => {

          this.attendance =
            records;

        }
      );

  }


  get filteredPeople():
    AttendancePerson[] {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    return this.people
      .filter(
        person => {


          const matchesSearch =

            !search

            ||

            person.name
              .toLowerCase()
              .includes(
                search
              )

            ||

            person.code
              .toLowerCase()
              .includes(
                search
              )

            ||

            person.detail
              .toLowerCase()
              .includes(
                search
              );


          const matchesType =

            !this.selectedType

            ||

            person.type ===
              this.selectedType;


          const matchesLocation =

            !this.selectedLocation

            ||

            person.location ===
              this.selectedLocation;


          return (

            matchesSearch

            &&

            matchesType

            &&

            matchesLocation

          );

        }
      );

  }


  get displayedDays():
    AttendanceDay[] {


    return this.viewMode ===
      'week'

      ? this.weekDays

      : this.monthDays;

  }


  setViewMode(
    mode:
      ViewMode
  ): void {


    this.viewMode =
      mode;


    if (
      mode ===
      'week'
    ) {

      this.buildWeek();

    }
    else {

      this.buildMonth();

    }

  }


  previousWeek():
    void {


    const date =
      new Date(
        this.weekStart
      );


    date.setDate(
      date.getDate() -
      7
    );


    this.weekStart =
      date;


    this.buildWeek();

  }


  nextWeek():
    void {


    const date =
      new Date(
        this.weekStart
      );


    date.setDate(
      date.getDate() +
      7
    );


    this.weekStart =
      date;


    this.buildWeek();

  }


  currentWeek():
    void {


    this.weekStart =
      this.getMonday(
        new Date()
      );


    this.buildWeek();

  }


  previousMonth():
    void {


    const date =
      this.monthKeyToDate(
        this.selectedMonth
      );


    date.setMonth(
      date.getMonth() -
      1
    );


    this.selectedMonth =
      this.getMonthKey(
        date
      );


    this.buildMonth();

  }


  nextMonth():
    void {


    const date =
      this.monthKeyToDate(
        this.selectedMonth
      );


    date.setMonth(
      date.getMonth() +
      1
    );


    this.selectedMonth =
      this.getMonthKey(
        date
      );


    this.buildMonth();

  }


  currentMonth():
    void {


    this.selectedMonth =
      this.getMonthKey(
        new Date()
      );


    this.buildMonth();

  }


  onMonthChange():
    void {

    this.buildMonth();

  }


  private buildWeek():
    void {


    const today =
      this.toDateKey(
        new Date()
      );


    const todayDate =
      this.startOfDay(
        new Date()
      );


    this.weekDays =
      Array.from(
        {
          length:
            7
        },
        (
          _,
          index
        ) => {


          const date =
            new Date(
              this.weekStart
            );


          date.setDate(

            this.weekStart
              .getDate()

            +

            index

          );


          const dateKey =
            this.toDateKey(
              date
            );


          return {

            date:
              dateKey,

            dayName:
              date.toLocaleDateString(
                'en-IN',
                {
                  weekday:
                    'short'
                }
              ),

            dateLabel:
              date.toLocaleDateString(
                'en-IN',
                {
                  day:
                    '2-digit',

                  month:
                    'short'
                }
              ),

            dayNumber:
              date.getDate(),

            isToday:
              dateKey ===
              today,

            isFuture:
              this.startOfDay(
                date
              )
                .getTime() >
              todayDate
                .getTime()

          };

        }
      );

  }


  private buildMonth():
    void {


    const monthDate =
      this.monthKeyToDate(
        this.selectedMonth
      );


    const year =
      monthDate
        .getFullYear();


    const month =
      monthDate
        .getMonth();


    const totalDays =
      new Date(
        year,
        month + 1,
        0
      )
        .getDate();


    const today =
      this.toDateKey(
        new Date()
      );


    const todayDate =
      this.startOfDay(
        new Date()
      );


    this.monthDays =
      Array.from(
        {
          length:
            totalDays
        },
        (
          _,
          index
        ) => {


          const date =
            new Date(
              year,
              month,
              index + 1
            );


          const dateKey =
            this.toDateKey(
              date
            );


          return {

            date:
              dateKey,

            dayName:
              date.toLocaleDateString(
                'en-IN',
                {
                  weekday:
                    'short'
                }
              ),

            dateLabel:
              date.toLocaleDateString(
                'en-IN',
                {
                  day:
                    '2-digit',

                  month:
                    'short'
                }
              ),

            dayNumber:
              index + 1,

            isToday:
              dateKey ===
              today,

            isFuture:
              this.startOfDay(
                date
              )
                .getTime() >
              todayDate
                .getTime()

          };

        }
      );

  }


  get weekRangeLabel():
    string {


    if (
      !this.weekDays.length
    ) {

      return '';

    }


    return (

      `${this.weekDays[0].dateLabel} - `

      +

      `${this.weekDays[6].dateLabel}`

    );

  }


  get monthLabel():
    string {


    const date =
      this.monthKeyToDate(
        this.selectedMonth
      );


    return date
      .toLocaleDateString(
        'en-IN',
        {
          month:
            'long',

          year:
            'numeric'
        }
      );

  }


  getRecord(
    personId:
      string,

    date:
      string
  ):
    AttendanceRecord
    | undefined {


    return this.attendance
      .find(
        record =>

          record.personId ===
            personId

          &&

          record.date ===
            date
      );

  }


  getStatus(
    personId:
      string,

    date:
      string
  ):
    AttendanceStatus {


    return (

      this.getRecord(
        personId,
        date
      )
        ?.status

      ??

      'none'

    );

  }


  clearFilters():
    void {


    this.searchText =
      '';


    this.selectedType =
      '';


    this.selectedLocation =
      '';

  }


  get presentCount():
    number {


    return this.countStatus(
      'present'
    );

  }


  get absentCount():
    number {


    return this.countStatus(
      'absent'
    );

  }


  get notMarkedCount():
    number {


    let count =
      0;


    for (
      const person
      of this.filteredPeople
    ) {


      for (
        const day
        of this.displayedDays
      ) {


        if (
          day.isFuture
        ) {

          continue;

        }


        if (
          this.getStatus(
            person.id,
            day.date
          ) ===
          'none'
        ) {

          count++;

        }

      }

    }


    return count;

  }


  get attendanceRate():
    number {


    const marked =
      this.presentCount +
      this.absentCount;


    if (
      marked === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        this.presentCount /
        marked
      )

      *

      100

    );

  }


  get presentLabel():
    string {


    return this.viewMode ===
      'week'

      ? 'Present This Week'

      : 'Present This Month';

  }


  get absentLabel():
    string {


    return this.viewMode ===
      'week'

      ? 'Absent This Week'

      : 'Absent This Month';

  }


  get rateLabel():
    string {


    return this.viewMode ===
      'week'

      ? 'Weekly Attendance Rate'

      : 'Monthly Attendance Rate';

  }


  getPersonPresentCount(
    personId:
      string
  ):
    number {


    return this.monthDays
      .filter(
        day =>

          !day.isFuture

          &&

          this.getStatus(
            personId,
            day.date
          ) ===
            'present'
      )
      .length;

  }


  getPersonAbsentCount(
    personId:
      string
  ):
    number {


    return this.monthDays
      .filter(
        day =>

          !day.isFuture

          &&

          this.getStatus(
            personId,
            day.date
          ) ===
            'absent'
      )
      .length;

  }


  getPersonMonthlyRate(
    personId:
      string
  ):
    number {


    const present =
      this.getPersonPresentCount(
        personId
      );


    const absent =
      this.getPersonAbsentCount(
        personId
      );


    const total =
      present +
      absent;


    if (
      total === 0
    ) {

      return 0;

    }


    return Math.round(

      (
        present /
        total
      )

      *

      100

    );

  }


  getAttendanceTitle(
    personId:
      string,

    day:
      AttendanceDay
  ):
    string {


    if (
      day.isFuture
    ) {

      return (
        `${day.dateLabel} - Future date`
      );

    }


    const record =
      this.getRecord(
        personId,
        day.date
      );


    if (
      !record
    ) {

      return (
        `${day.dateLabel} - Not marked`
      );

    }


    if (
      record.status ===
      'absent'
    ) {

      return (
        `${day.dateLabel} - Absent`
      );

    }


    const checkIn =
      record.checkIn
      ??
      '-';


    const checkOut =
      record.checkOut
      ??
      '-';


    return (

      `${day.dateLabel} - Present | `

      +

      `In: ${checkIn} | Out: ${checkOut}`

    );

  }


  private countStatus(
    status:
      'present'
      |
      'absent'
  ):
    number {


    let count =
      0;


    for (
      const person
      of this.filteredPeople
    ) {


      for (
        const day
        of this.displayedDays
      ) {


        if (
          day.isFuture
        ) {

          continue;

        }


        if (
          this.getStatus(
            person.id,
            day.date
          ) ===
          status
        ) {

          count++;

        }

      }

    }


    return count;

  }


  private getMonday(
    source:
      Date
  ):
    Date {


    const date =
      this.startOfDay(
        source
      );


    const day =
      date.getDay();


    const difference =
      day ===
        0

        ? -6

        : 1 -
          day;


    date.setDate(
      date.getDate() +
      difference
    );


    return date;

  }


  private toDateKey(
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


  private getMonthKey(
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
        )

    ].join('-');

  }


  private monthKeyToDate(
    monthKey:
      string
  ):
    Date {


    const [
      year,
      month
    ] =

      monthKey
        .split('-')
        .map(
          Number
        );


    return new Date(
      year,
      month - 1,
      1
    );

  }


  private startOfDay(
    value:
      Date
  ):
    Date {


    const date =
      new Date(
        value
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