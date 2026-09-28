export type ReportType =
  | 'financial'
  | 'membership'
  | 'attendance'
  | 'staff'
  | 'visitors';


export interface ReportFilter {
  fromDate: string;
  toDate: string;
  locationId: number | null;
  reportType: ReportType;
}


export interface ReportLocation {
  locationId: number;
  locationName: string;
}


/* =====================================================
   FINANCIAL
===================================================== */

export interface FinancialReportSummary {
  grossCollections: number;
  refunds: number;
  netCollections: number;
  expenses: number;
  netCashFlow: number;
  outstandingAmount: number;
}


export interface DailyFinancialReport {
  date: string;
  revenue: number;
  refunds: number;
  expenses: number;
  net: number;
}


export interface PaymentMethodReport {
  paymentMethodId: number;
  paymentMethodName: string;
  transactionCount: number;
  amount: number;
  percentage: number;
}


export interface FinancialTransactionRow {
  id: string;
  date: string;

  type:
    | 'payment'
    | 'expense'
    | 'refund';

  description: string;
  method: string;
  amount: number;
}


export interface FinancialReportData {
  summary: FinancialReportSummary;
  daily: DailyFinancialReport[];
  paymentMethods: PaymentMethodReport[];
  transactions: FinancialTransactionRow[];
}


/* =====================================================
   MEMBERSHIP
===================================================== */

export interface MembershipReportSummary {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoon: number;
  newMembers: number;
  renewals: number;
}


export interface MembershipReportRow {
  memberId: number;
  memberCode: string;
  memberName: string;
  planName: string;
  locationId: number;
  locationName: string;
  joinedDate: string;
  expiryDate: string;
  renewalDate: string | null;

  status:
    | 'active'
    | 'expired'
    | 'expiring';
}


export interface MembershipPlanReport {
  planName: string;
  memberCount: number;
  percentage: number;
}


export interface MembershipReportData {
  summary: MembershipReportSummary;
  members: MembershipReportRow[];
  plans: MembershipPlanReport[];
}


/* =====================================================
   ATTENDANCE
===================================================== */

export interface AttendanceReportSummary {
  totalPeople: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
}


export interface AttendanceReportRow {
  personId: number;
  code: string;
  name: string;

  personType:
    | 'member'
    | 'staff';

  locationId: number;
  locationName: string;
  present: number;
  absent: number;
  attendanceRate: number;
}


export interface AttendanceReportData {
  summary: AttendanceReportSummary;
  rows: AttendanceReportRow[];
}


/* =====================================================
   STAFF
===================================================== */

export interface StaffReportSummary {
  totalStaff: number;
  activeStaff: number;
  trainers: number;
  managers: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
}


export interface StaffReportRow {
  staffId: number;
  staffCode: string;
  staffName: string;
  role: string;
  locationId: number;
  locationName: string;
  joiningDate: string;

  status:
    | 'active'
    | 'inactive';

  present: number;
  absent: number;
  attendanceRate: number;
}


export interface StaffRoleReport {
  role: string;
  count: number;
  percentage: number;
}


export interface StaffReportData {
  summary: StaffReportSummary;
  rows: StaffReportRow[];
  roles: StaffRoleReport[];
}


/* =====================================================
   VISITORS / ENQUIRIES
===================================================== */

export interface VisitorReportSummary {
  totalEnquiries: number;
  totalVisitors: number;
  convertedMembers: number;
  pendingFollowUps: number;
  lostEnquiries: number;
  conversionRate: number;
}


export interface VisitorEnquiryReportRow {
  enquiryId: number;
  name: string;
  phone: string;
  enquiryDate: string;
  locationId: number;
  locationName: string;
  source: string;
  interestedPlan: string;

  status:
    | 'new'
    | 'follow_up'
    | 'visited'
    | 'converted'
    | 'lost';

  followUpDate: string | null;
}


export interface EnquirySourceReport {
  source: string;
  count: number;
  percentage: number;
}


export interface VisitorReportData {
  summary: VisitorReportSummary;
  rows: VisitorEnquiryReportRow[];
  sources: EnquirySourceReport[];
}