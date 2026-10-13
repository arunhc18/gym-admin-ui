export type FacilityType =
  | 'studio'
  | 'court'
  | 'pool'
  | 'sauna'
  | 'room';

export type FacilityBookingStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type CleaningType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'deep_clean';

export type MaintenanceRequestType =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'equipment'
  | 'cleaning'
  | 'other';

export type MaintenancePriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type MaintenanceStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';


export interface Facility {

  facilityId: number;

  locationId: number;

  facilityName: string;

  facilityType?: FacilityType | null;

  capacity?: number | null;

  hourlyRate?: number | null;

  amenities?: string | null;

  isBookable: boolean;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface FacilityBooking {

  bookingId: number;

  facilityId: number;

  memberId?: number | null;

  bookingDate: string;

  startTime: string;

  endTime: string;

  purpose?: string | null;

  numberOfPeople?: number | null;

  status: FacilityBookingStatus;

  paymentStatus: string;

  amount?: number | null;

  cancellationDate?: string | null;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface CleaningSchedule {

  scheduleId: number;

  locationId: number;

  areaName: string;

  cleaningType?: CleaningType | null;

  frequency?: string | null;

  assignedTo?: number | null;

  lastCleanedDate?: string | null;

  nextCleaningDate?: string | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface MaintenanceRequest {

  requestId: number;

  tenantId: number;

  locationId: number;

  requestType?: MaintenanceRequestType | null;

  priority: MaintenancePriority;

  areaLocation?: string | null;

  description: string;

  reportedBy?: number | null;

  assignedTo?: number | null;

  status: MaintenanceStatus;

  reportedDate: string;

  completedDate?: string | null;

  cost?: number | null;

  notes?: string | null;

  createdAt?: string;

  updatedAt?: string;

  createdBy?: number | null;

  updatedBy?: number | null;
}


export interface EmployeeOption {

  employeeId: number;

  employeeName: string;

  locationId: number;
}