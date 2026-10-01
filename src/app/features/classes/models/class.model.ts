export type ClassStatus =
  | 'scheduled'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export type BookingStatus =
  | 'confirmed'
  | 'attended'
  | 'cancelled'
  | 'no_show';

export type WaitlistStatus =
  | 'waiting'
  | 'confirmed'
  | 'expired';

export interface ClassType {
  class_type_id: number;
  tenant_id: number;
  class_name: string;
  description: string | null;
  duration_minutes: number;
  max_capacity: number | null;
  image_url: string | null;
  color_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface GymClass {
  class_id: number;
  tenant_id: number;
  location_id: number;
  class_type_id: number;
  trainer_id: number | null;
  class_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  room_number: string | null;
  status: ClassStatus;
  is_virtual: boolean;
  virtual_meeting_url: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface ClassBooking {
  booking_id: number;
  class_id: number;
  member_id: number;
  booking_date: string;
  status: BookingStatus;
  cancellation_date: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface ClassWaitlistEntry {
  waitlist_id: number;
  class_id: number;
  member_id: number;
  position: number;
  added_date: string;
  status: WaitlistStatus;
  created_at: string;
  created_by: number | null;
  updated_at: string;
  updated_by: number | null;
}

export type ClassFormValues = {
  class_type_id: number | null;
  location_id: number | null;
  trainer_id: number | null;
  class_date: string;
  start_time: string;
  end_time: string;
  max_capacity: number | null;
  room_number: string | null;
  status: ClassStatus;
  is_virtual: boolean;
  virtual_meeting_url: string | null;
  cancellation_reason: string | null;
};

export type ClassTypeFormValues = {
  class_name: string;
  description: string | null;
  duration_minutes: number | null;
  max_capacity: number | null;
  image_url: string | null;
  color_code: string | null;
  is_active: boolean;
};
