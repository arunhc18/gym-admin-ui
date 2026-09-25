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


type PersonType =
  | 'member'
  | 'staff';


type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'none';


type ViewMode =
  | 'week'
  | 'month';


interface AttendancePerson {

  id: number;

  code: string;

  name: string;

  type: PersonType;

  detail: string;

  location: string;

}


interface AttendanceRecord {

  personId: number;

  date: string;

  status:
    Exclude<
      AttendanceStatus,
      'none'
    >;

  checkIn:
    string | null;

  checkOut:
    string | null;

  notes:
    string | null;

}


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


  // =====================================================
  // VIEW MODE
  // =====================================================

  viewMode:
    ViewMode = 'week';


  // =====================================================
  // PEOPLE
  //
  // TEMPORARY MOCK DATA
  //
  // Later replace with API data.
  // =====================================================

  people:
    AttendancePerson[] = [

      {
        id: 101,
        code: 'MEM-001',
        name: 'Arun Kumar',
        type: 'member',
        detail: 'Gold Membership',
        location: 'Main Branch'
      },

      {
        id: 102,
        code: 'MEM-002',
        name: 'Rahul Sharma',
        type: 'member',
        detail: 'Premium Membership',
        location: 'Main Branch'
      },

      {
        id: 103,
        code: 'MEM-003',
        name: 'Kiran R',
        type: 'member',
        detail: 'Monthly Membership',
        location: 'Branch 2'
      },

      {
        id: 104,
        code: 'MEM-004',
        name: 'Sandeep Kumar',
        type: 'member',
        detail: 'Gold Membership',
        location: 'Main Branch'
      },

      {
        id: 105,
        code: 'MEM-005',
        name: 'Priya S',
        type: 'member',
        detail: 'Premium Membership',
        location: 'Branch 2'
      },

      {
        id: 201,
        code: 'STF-001',
        name: 'Ravi Kumar',
        type: 'staff',
        detail: 'Trainer',
        location: 'Main Branch'
      },

      {
        id: 202,
        code: 'STF-002',
        name: 'Anil S',
        type: 'staff',
        detail: 'Manager',
        location: 'Main Branch'
      },

      {
        id: 203,
        code: 'STF-003',
        name: 'Megha R',
        type: 'staff',
        detail: 'Trainer',
        location: 'Branch 2'
      }

    ];


  // =====================================================
  // ATTENDANCE
  // =====================================================

  attendance:
    AttendanceRecord[] = [];


  // =====================================================
  // WEEK
  // =====================================================

  weekStart =
    this.getMonday(
      new Date()
    );


  weekDays:
    AttendanceDay[] = [];


  // =====================================================
  // MONTH
  // =====================================================

  selectedMonth =
    this.getMonthKey(
      new Date()
    );


  monthDays:
    AttendanceDay[] = [];


  // =====================================================
  // FILTERS
  // =====================================================

  searchText = '';


  selectedType:
    PersonType | '' = '';


  selectedLocation = '';


  locations:
    string[] = [];


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {


    this.locations =
      Array.from(
        new Set(
          this.people.map(
            person =>
              person.location
          )
        )
      );


    this.buildWeek();

    this.buildMonth();

    this.seedAttendance();

  }


  // =====================================================
  // FILTERED PEOPLE
  // =====================================================

  get filteredPeople():
    AttendancePerson[] {


    const search =
      this.searchText
        .trim()
        .toLowerCase();


    return this.people.filter(
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


  // =====================================================
  // ACTIVE DAYS
  // =====================================================

  get displayedDays():
    AttendanceDay[] {


    return this.viewMode ===
      'week'

      ? this.weekDays

      : this.monthDays;

  }


  // =====================================================
  // VIEW MODE
  // =====================================================

  setViewMode(
    mode:
      ViewMode
  ): void {


    this.viewMode =
      mode;


    if (
      mode === 'week'
    ) {

      this.buildWeek();

    }
    else {

      this.buildMonth();

    }

  }


  // =====================================================
  // WEEK NAVIGATION
  // =====================================================

  previousWeek(): void {


    const date =
      new Date(
        this.weekStart
      );


    date.setDate(
      date.getDate() - 7
    );


    this.weekStart =
      date;


    this.buildWeek();

  }


  nextWeek(): void {


    const date =
      new Date(
        this.weekStart
      );


    date.setDate(
      date.getDate() + 7
    );


    this.weekStart =
      date;


    this.buildWeek();

  }


  currentWeek(): void {


    this.weekStart =
      this.getMonday(
        new Date()
      );


    this.buildWeek();

  }


  // =====================================================
  // MONTH NAVIGATION
  // =====================================================

  previousMonth(): void {


    const date =
      this.monthKeyToDate(
        this.selectedMonth
      );


    date.setMonth(
      date.getMonth() - 1
    );


    this.selectedMonth =
      this.getMonthKey(
        date
      );


    this.buildMonth();

  }


  nextMonth(): void {


    const date =
      this.monthKeyToDate(
        this.selectedMonth
      );


    date.setMonth(
      date.getMonth() + 1
    );


    this.selectedMonth =
      this.getMonthKey(
        date
      );


    this.buildMonth();

  }


  currentMonth(): void {


    this.selectedMonth =
      this.getMonthKey(
        new Date()
      );


    this.buildMonth();

  }


  onMonthChange(): void {

    this.buildMonth();

  }


  // =====================================================
  // WEEK BUILD
  // =====================================================

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
          length: 7
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
              .getDate() +
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
                  weekday: 'short'
                }
              ),

            dateLabel:
              date.toLocaleDateString(
                'en-IN',
                {
                  day: '2-digit',
                  month: 'short'
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
              ).getTime() >
              todayDate.getTime()

          };

        }
      );

  }


  // =====================================================
  // MONTH BUILD
  // =====================================================

  private buildMonth():
    void {


    const monthDate =
      this.monthKeyToDate(
        this.selectedMonth
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
                  weekday: 'short'
                }
              ),

            dateLabel:
              date.toLocaleDateString(
                'en-IN',
                {
                  day: '2-digit',
                  month: 'short'
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
              ).getTime() >
              todayDate.getTime()

          };

        }
      );

  }


  // =====================================================
  // DISPLAY LABELS
  // =====================================================

  get weekRangeLabel():
    string {


    if (
      !this.weekDays.length
    ) {

      return '';

    }


    return (

      `${this.weekDays[0].dateLabel} - ` +
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


  // =====================================================
  // ATTENDANCE RECORD
  // =====================================================

  getRecord(
    personId: number,
    date: string
  ): AttendanceRecord | undefined {


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
    personId: number,
    date: string
  ): AttendanceStatus {


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


  // =====================================================
  // FILTERS
  // =====================================================

  clearFilters(): void {


    this.searchText = '';

    this.selectedType = '';

    this.selectedLocation = '';

  }


  // =====================================================
  // SUMMARY - PRESENT
  // =====================================================

  get presentCount():
    number {


    return this.countStatus(
      'present'
    );

  }


  // =====================================================
  // SUMMARY - ABSENT
  // =====================================================

  get absentCount():
    number {


    return this.countStatus(
      'absent'
    );

  }


  // =====================================================
  // SUMMARY - NOT MARKED
  // =====================================================

  get notMarkedCount():
    number {


    let count = 0;


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


  // =====================================================
  // ATTENDANCE RATE
  // =====================================================

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


  // =====================================================
  // SUMMARY LABELS
  // =====================================================

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


  // =====================================================
  // PERSON MONTH SUMMARY
  // =====================================================

  getPersonPresentCount(
    personId: number
  ): number {


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
    personId: number
  ): number {


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
    personId: number
  ): number {


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


  // =====================================================
  // TOOLTIP
  // =====================================================

  getAttendanceTitle(
    personId: number,
    day:
      AttendanceDay
  ): string {


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
      ?? '-';


    const checkOut =
      record.checkOut
      ?? '-';


    return (

      `${day.dateLabel} - Present | ` +
      `In: ${checkIn} | Out: ${checkOut}`

    );

  }


  // =====================================================
  // COUNT STATUS
  // =====================================================

  private countStatus(
    status:
      'present' |
      'absent'
  ): number {


    let count = 0;


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


  // =====================================================
  // MOCK ATTENDANCE
  //
  // Creates historical attendance for:
  //
  // Current month + previous 6 months.
  //
  // Later replace with backend.
  // =====================================================

  private seedAttendance():
    void {


    const records:
      AttendanceRecord[] = [];


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
        dayNumber <=
        totalDays;
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


        this.people.forEach(
          (
            person,
            personIndex
          ) => {


            /*
             * Deterministic mock pattern.
             *
             * Most days present.
             * Some days absent.
             */

            const absent =

              (
                dayNumber +
                personIndex +
                month
              )

              %

              9 === 0;


            records.push({

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

                  : person.type ===
                    'staff'

                    ? (
                        personIndex % 2 ===
                          0
                          ? '08:00'
                          : '08:15'
                      )

                    : (
                        personIndex % 2 ===
                          0
                          ? '06:30'
                          : '07:00'
                      ),

              checkOut:

                absent

                  ? null

                  : person.type ===
                    'staff'

                    ? '17:00'

                    : null,

              notes:
                null

            });

          }
        );

      }

    }


    this.attendance =
      records;

  }


  // =====================================================
  // DATE HELPERS
  // =====================================================

  private getMonday(
    source:
      Date
  ): Date {


    const date =
      this.startOfDay(
        source
      );


    const day =
      date.getDay();


    const difference =
      day === 0

        ? -6

        : 1 - day;


    date.setDate(
      date.getDate() +
      difference
    );


    return date;

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


  private getMonthKey(
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
        )

    ].join('-');

  }


  private monthKeyToDate(
    monthKey:
      string
  ): Date {


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
  ): Date {


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